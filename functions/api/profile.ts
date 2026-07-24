interface Env {
  DB: D1Database
  SOLIFY_BUCKET: R2Bucket
  FIREBASE_API_KEY: string
}

import { jsonResponse, verifyFirebaseUser } from './_auth'
import { purgeDueDeletions } from './_accountLifecycle'
import { enforceRateLimit } from './_rateLimit'

interface UserProfileRow {
  uid: string
  username: string
  displayName: string
  handle: string
  photoURL: string
  onboardingCompleted: number
  deletionScheduledAt: number | null
}

const sanitizeUsername = (value: string): string => value.trim().toLowerCase().replace(/[^a-z0-9._]/g, '')

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    await purgeDueDeletions(context.env)

    const { request, env } = context
    const url = new URL(request.url)
    const uid = url.searchParams.get('uid')

    if (!uid) {
      return jsonResponse({ error: 'Missing uid parameter', profile: null }, 400)
    }

    const userProfile = await env.DB.prepare(
      `SELECT uid, username, displayName, handle, photoURL, onboardingCompleted, deletionScheduledAt
       FROM users
       WHERE uid = ?1`,
    )
      .bind(uid)
      .first<UserProfileRow>()

    return jsonResponse({ profile: userProfile || null })
  } catch (error: unknown) {
    console.error('D1 Fetch Error Logs:', error)
    return jsonResponse({ error: 'Internal Server Error', profile: null }, 500)
  }
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { request, env } = context
    const { uid } = await verifyFirebaseUser(request, env)
    await enforceRateLimit(env, uid, 'profile_write')
    await purgeDueDeletions(env)

    const formData = await request.formData()

    const usernameRaw = formData.get('username') as string | null
    const displayNameRaw = formData.get('displayName') as string | null
    const avatarFile = formData.get('avatar') as File | null
    const onboardingCompletedRaw = formData.get('onboardingCompleted') as string | null

    if (!usernameRaw || !displayNameRaw) {
      return jsonResponse({ error: 'Missing user configuration parameters' }, 400)
    }

    const username = sanitizeUsername(usernameRaw)
    const displayName = displayNameRaw.trim()
    if (!username || !displayName) {
      return jsonResponse({ error: 'Invalid username or display name' }, 400)
    }

    const handle = username
    let photoURL = ''
    if (avatarFile && avatarFile.size > 0) {
      const fileKey = `avatars/${uid}.jpg`
      await env.SOLIFY_BUCKET.put(fileKey, avatarFile, {
        httpMetadata: { contentType: avatarFile.type || 'image/jpeg' },
      })
      const url = new URL(request.url)
      photoURL = `${url.origin}/${fileKey}`
    }

    const timestamp = Date.now()
    const onboardingCompleted = onboardingCompletedRaw === '1' || onboardingCompletedRaw === 'true' ? 1 : 0

    await env.DB.prepare(
      `
      INSERT INTO users (uid, username, displayName, handle, photoURL, onboardingCompleted, updatedAt)
      VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
      ON CONFLICT(uid) DO UPDATE SET
        username = excluded.username,
        displayName = excluded.displayName,
        handle = excluded.handle,
        photoURL = CASE WHEN excluded.photoURL != '' THEN excluded.photoURL ELSE users.photoURL END,
        onboardingCompleted = MAX(users.onboardingCompleted, excluded.onboardingCompleted),
        deletionRequestedAt = NULL,
        deletionScheduledAt = NULL,
        firebaseRefreshToken = NULL,
        updatedAt = excluded.updatedAt
    `,
    )
      .bind(uid, username, displayName, handle, photoURL, onboardingCompleted, timestamp)
      .run()

    const profile = await env.DB.prepare(
      `SELECT uid, username, displayName, handle, photoURL, onboardingCompleted, deletionScheduledAt
       FROM users
       WHERE uid = ?1`,
    )
      .bind(uid)
      .first<UserProfileRow>()

    return jsonResponse({ success: true, profile })
  } catch (error: unknown) {
    if (error instanceof Response) {
      return error
    }
    console.error('Profile execution sync error:', error)
    return jsonResponse({ error: 'Profile operational sync failure' }, 500)
  }
}

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  try {
    const { request, env } = context
    const { uid } = await verifyFirebaseUser(request, env)
    await enforceRateLimit(env, uid, 'profile_write')

    await env.DB.prepare(
      `UPDATE users
       SET photoURL = '', updatedAt = ?2
       WHERE uid = ?1`,
    )
      .bind(uid, Date.now())
      .run()

    await env.SOLIFY_BUCKET.delete(`avatars/${uid}.jpg`)
    return jsonResponse({ success: true })
  } catch (err: unknown) {
    if (err instanceof Response) {
      return err
    }
    console.error('Profile execution sync error:', err)
    return jsonResponse({ error: 'Profile operational sync failure' }, 500)
  }
}
