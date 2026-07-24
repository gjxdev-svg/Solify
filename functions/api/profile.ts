interface Env {
  DB: D1Database
  SOLIFY_BUCKET: R2Bucket
}

// ========================================================
// 1. GET: FETCH USER PROFILE DATA ON HOMEPAGE LOAD
// ========================================================
export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const { request, env } = context
    const url = new URL(request.url)
    const uid = url.searchParams.get('uid')

    if (!uid) {
      return new Response(JSON.stringify({ error: 'Missing uid parameter', profile: null }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Query D1 SQL database for this user
    const userProfile = await env.DB.prepare('SELECT * FROM users WHERE uid = ?1').bind(uid).first()

    // GUARANTEES JSON OUTPUT: Always stringifies an object so .json() never crashes the browser!
    return new Response(JSON.stringify({ profile: userProfile || null }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error: unknown) {
    console.error('D1 Fetch Error Logs:', error)
    return new Response(JSON.stringify({ error: 'Internal Server Error', profile: null }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

// ========================================================
// 2. POST: SAVE OR UPDATE USER PROFILE
// ========================================================
export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { request, env } = context
    const formData = await request.formData()
    const uid = formData.get('uid') as string | null
    const username = formData.get('username') as string | null
    const handle = formData.get('handle') as string | null
    const avatarFile = formData.get('avatar') as File | null

    if (!uid || !username || !handle) {
      return new Response('Missing required parameters', { status: 400 })
    }

    let photoURL = ''

    if (avatarFile && avatarFile.size > 0) {
      const fileKey = `avatars/${uid}.jpg`
      await env.SOLIFY_BUCKET.put(fileKey, avatarFile, {
        httpMetadata: { contentType: avatarFile.type || 'image/jpeg' },
      })
      const url = new URL(request.url)
      photoURL = `${url.origin}/${fileKey}`
    }

    await env.DB.prepare(
      `
      INSERT INTO users (uid, username, handle, photoURL, updatedAt)
      VALUES (?1, ?2, ?3, ?4, ?5)
      ON CONFLICT(uid) DO UPDATE SET
        username = ?2,
        handle = ?3,
        photoURL = CASE WHEN ?4 != '' THEN ?4 ELSE photoURL END,
        updatedAt = ?5
    `,
    )
      .bind(uid, username.trim(), handle.trim().toLowerCase(), photoURL, Date.now())
      .run()

    return new Response(JSON.stringify({ success: true, photoURL }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error: unknown) {
    console.error('D1 Save Error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}
