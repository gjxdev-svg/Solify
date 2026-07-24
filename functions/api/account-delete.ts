import { jsonResponse, verifyFirebaseUser } from './_auth'
import { enforceRateLimit } from './_rateLimit'
import { purgeDueDeletions } from './_accountLifecycle'

interface Env {
  DB: D1Database
  SOLIFY_BUCKET: R2Bucket
  FIREBASE_API_KEY: string
}

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { request, env } = context
    const { uid } = await verifyFirebaseUser(request, env)
    await enforceRateLimit(env, uid, 'delete_request')
    await purgeDueDeletions(env)

    const body = await request.json<{ refreshToken?: string }>()
    const refreshToken = body.refreshToken?.trim()
    if (!refreshToken) {
      return jsonResponse({ error: 'Missing Firebase refresh token' }, 400)
    }

    const now = Date.now()
    const scheduledAt = now + THIRTY_DAYS_MS
    await env.DB.prepare(
      `INSERT INTO users (uid, username, displayName, handle, photoURL, onboardingCompleted, deletionRequestedAt, deletionScheduledAt, firebaseRefreshToken, updatedAt)
       VALUES (?1, ?2, ?3, ?4, '', 0, ?5, ?6, ?7, ?5)
       ON CONFLICT(uid) DO UPDATE SET
         deletionRequestedAt = excluded.deletionRequestedAt,
         deletionScheduledAt = excluded.deletionScheduledAt,
         firebaseRefreshToken = excluded.firebaseRefreshToken,
         updatedAt = excluded.updatedAt`,
    )
      .bind(uid, `user_${uid}`, `User ${uid.slice(0, 8)}`, `user_${uid}`, now, scheduledAt, refreshToken)
      .run()

    return jsonResponse({
      success: true,
      deletionScheduledAt: scheduledAt,
      notice:
        'Your account is scheduled for permanent deletion in 30 days. Logging in again before then cancels the deletion.',
    })
  } catch (error: unknown) {
    if (error instanceof Response) {
      return error
    }
    console.error('Account deletion schedule error', error)
    return jsonResponse({ error: 'Internal Server Error' }, 500)
  }
}
