interface Env {
  DB: D1Database
}

const ACTION_CONFIG: Record<
  string,
  {
    windowMs: number
    maxRequests: number
    basePenaltyMs: number
  }
> = {
  profile_write: { windowMs: 60_000, maxRequests: 8, basePenaltyMs: 60_000 },
  post_write: { windowMs: 60_000, maxRequests: 5, basePenaltyMs: 120_000 },
  chat_write: { windowMs: 30_000, maxRequests: 20, basePenaltyMs: 45_000 },
  delete_request: { windowMs: 60_000, maxRequests: 2, basePenaltyMs: 300_000 },
}

interface RateLimitRow {
  uid: string
  action: string
  windowStart: number
  requestCount: number
  penaltyLevel: number
  blockedUntil: number
}

export const enforceRateLimit = async (
  env: Env,
  uid: string,
  action: keyof typeof ACTION_CONFIG,
): Promise<void> => {
  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS user_rate_limits (
      uid TEXT NOT NULL,
      action TEXT NOT NULL,
      windowStart INTEGER NOT NULL,
      requestCount INTEGER NOT NULL DEFAULT 0,
      penaltyLevel INTEGER NOT NULL DEFAULT 0,
      blockedUntil INTEGER NOT NULL DEFAULT 0,
      updatedAt INTEGER NOT NULL,
      PRIMARY KEY (uid, action)
    )`,
  ).run()

  const config = ACTION_CONFIG[action]
  const now = Date.now()
  const row = await env.DB.prepare(
    `SELECT uid, action, windowStart, requestCount, penaltyLevel, blockedUntil
     FROM user_rate_limits WHERE uid = ?1 AND action = ?2`,
  )
    .bind(uid, action)
    .first<RateLimitRow>()

  if (!row) {
    await env.DB.prepare(
      `INSERT INTO user_rate_limits (uid, action, windowStart, requestCount, penaltyLevel, blockedUntil, updatedAt)
       VALUES (?1, ?2, ?3, 1, 0, 0, ?3)`,
    )
      .bind(uid, action, now)
      .run()
    return
  }

  if (row.blockedUntil > now) {
    throw new Response(
      JSON.stringify({
        error: 'Temporarily blocked due to too many requests',
        blockedUntil: row.blockedUntil,
      }),
      {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  }

  const windowStillOpen = now - row.windowStart <= config.windowMs
  const nextCount = windowStillOpen ? row.requestCount + 1 : 1
  const nextWindowStart = windowStillOpen ? row.windowStart : now

  if (nextCount <= config.maxRequests) {
    await env.DB.prepare(
      `UPDATE user_rate_limits
       SET requestCount = ?3, windowStart = ?4, blockedUntil = 0, updatedAt = ?5
       WHERE uid = ?1 AND action = ?2`,
    )
      .bind(uid, action, nextCount, nextWindowStart, now)
      .run()
    return
  }

  const nextPenaltyLevel = row.penaltyLevel + 1
  const blockDurationMs = config.basePenaltyMs * 2 ** (nextPenaltyLevel - 1)
  const blockedUntil = now + blockDurationMs

  await env.DB.prepare(
    `UPDATE user_rate_limits
     SET requestCount = 0, windowStart = ?3, penaltyLevel = ?4, blockedUntil = ?5, updatedAt = ?3
     WHERE uid = ?1 AND action = ?2`,
  )
    .bind(uid, action, now, nextPenaltyLevel, blockedUntil)
    .run()

  throw new Response(
    JSON.stringify({
      error: 'Temporarily blocked due to spam-like activity',
      blockedUntil,
    }),
    {
      status: 429,
      headers: { 'Content-Type': 'application/json' },
    },
  )
}
