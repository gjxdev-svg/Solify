import { jsonResponse, verifyFirebaseUser } from './_auth'
import { purgeDueDeletions } from './_accountLifecycle'

interface Env {
  DB: D1Database
  SOLIFY_BUCKET: R2Bucket
  FIREBASE_API_KEY: string
}

interface SessionProfile {
  uid: string
  username: string
  displayName: string
  handle: string
  photoURL: string
  onboardingCompleted: number
  deletionScheduledAt: number | null
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { request, env } = context
    await purgeDueDeletions(env)
    const { uid } = await verifyFirebaseUser(request, env)

    const profile = await env.DB.prepare(
      `SELECT uid, username, displayName, handle, photoURL, onboardingCompleted, deletionScheduledAt
       FROM users
       WHERE uid = ?1`,
    )
      .bind(uid)
      .first<SessionProfile>()

    if (!profile) {
      return jsonResponse({
        profile: null,
        deletionCanceled: false,
      })
    }

    const now = Date.now()
    let deletionCanceled = false
    let finalProfile = profile

    if (profile.deletionScheduledAt && profile.deletionScheduledAt > now) {
      await env.DB.prepare(
        `UPDATE users
         SET deletionRequestedAt = NULL,
             deletionScheduledAt = NULL,
             firebaseRefreshToken = NULL,
             updatedAt = ?2
         WHERE uid = ?1`,
      )
        .bind(uid, now)
        .run()

      deletionCanceled = true
      finalProfile = {
        ...profile,
        deletionScheduledAt: null,
      }
    }

    return jsonResponse({
      profile: finalProfile,
      deletionCanceled,
    })
  } catch (error: unknown) {
    if (error instanceof Response) {
      return error
    }
    console.error('Session endpoint error', error)
    return jsonResponse({ error: 'Internal Server Error' }, 500)
  }
}
