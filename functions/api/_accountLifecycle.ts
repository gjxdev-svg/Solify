interface Env {
  DB: D1Database
  SOLIFY_BUCKET: R2Bucket
  FIREBASE_API_KEY: string
}

interface DeletionCandidate {
  uid: string
  firebaseRefreshToken: string | null
}

const asFormBody = (values: Record<string, string>): string =>
  new URLSearchParams(values).toString()

const listAllKeys = async (bucket: R2Bucket, prefix: string): Promise<string[]> => {
  const keys: string[] = []
  let cursor: string | undefined

  while (true) {
    const listing = await bucket.list({ prefix, cursor })
    for (const object of listing.objects) {
      keys.push(object.key)
    }
    if (!listing.truncated || !listing.cursor) {
      break
    }
    cursor = listing.cursor
  }

  return keys
}

const deletePrefix = async (bucket: R2Bucket, prefix: string): Promise<void> => {
  const keys = await listAllKeys(bucket, prefix)
  if (keys.length === 0) {
    return
  }

  await Promise.all(keys.map((key) => bucket.delete(key)))
}

const deleteFirebaseAccount = async (env: Env, refreshToken: string): Promise<void> => {
  const tokenRes = await fetch(
    `https://securetoken.googleapis.com/v1/token?key=${env.FIREBASE_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: asFormBody({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    },
  )

  if (!tokenRes.ok) {
    throw new Error('Failed to refresh Firebase token for scheduled deletion')
  }

  const tokenPayload = (await tokenRes.json()) as { id_token?: string }
  if (!tokenPayload.id_token) {
    throw new Error('Missing Firebase id_token during scheduled deletion')
  }

  const deleteRes = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:delete?key=${env.FIREBASE_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken: tokenPayload.id_token }),
    },
  )

  if (!deleteRes.ok) {
    throw new Error('Failed to delete Firebase Auth user during scheduled deletion')
  }
}

const purgeUser = async (env: Env, candidate: DeletionCandidate): Promise<void> => {
  if (!candidate.firebaseRefreshToken) {
    throw new Error(`Cannot purge ${candidate.uid}: missing Firebase refresh token`)
  }

  await deleteFirebaseAccount(env, candidate.firebaseRefreshToken)
  await deletePrefix(env.SOLIFY_BUCKET, `avatars/${candidate.uid}`)
  await deletePrefix(env.SOLIFY_BUCKET, `posts/${candidate.uid}/`)

  await env.DB.batch([
    env.DB.prepare('DELETE FROM users WHERE uid = ?1').bind(candidate.uid),
    env.DB.prepare('DELETE FROM user_rate_limits WHERE uid = ?1').bind(candidate.uid),
  ])
}

export const purgeDueDeletions = async (env: Env): Promise<void> => {
  const now = Date.now()
  const due = await env.DB.prepare(
    `SELECT uid, firebaseRefreshToken
     FROM users
     WHERE deletionScheduledAt IS NOT NULL
       AND deletionScheduledAt <= ?1
     LIMIT 10`,
  )
    .bind(now)
    .all<DeletionCandidate>()

  for (const candidate of due.results || []) {
    try {
      await purgeUser(env, candidate)
    } catch (error: unknown) {
      console.error(`Failed scheduled purge for uid=${candidate.uid}`, error)
    }
  }
}
