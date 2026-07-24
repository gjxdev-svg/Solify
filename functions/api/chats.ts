interface Env {
  DB: D1Database
}

// GET: Fetches messages for a specific conversation room
export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const { request, env } = context
    const url = new URL(request.url)
    const chatId = url.searchParams.get('chatId') // e.g., "uid1_uid2"

    if (!chatId) {
      return new Response(JSON.stringify({ error: 'Missing chatId parameter' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const { results } = await env.DB.prepare(
      `
      SELECT m.id, m.chatId, m.senderUid, m.text, m.createdAt, u.username, u.photoURL as avatar
      FROM messages m
      JOIN users u ON m.senderUid = u.uid
      WHERE m.chatId = ?1
      ORDER BY m.createdAt ASC
    `,
    )
      .bind(chatId)
      .all()

    return new Response(JSON.stringify({ messages: results || [] }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error: unknown) {
    console.error('Failed to load message history logs:', error)
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 })
  }
}

// POST: Saves a incoming chat text message
export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { request, env } = context
    const body = await request.json<{ chatId: string; senderUid: string; text: string }>()

    const { chatId, senderUid, text } = body

    if (!chatId || !senderUid || !text || text.trim() === '') {
      return new Response(JSON.stringify({ error: 'Incomplete message data parameters' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    await env.DB.prepare(
      `
      INSERT INTO messages (chatId, senderUid, text, createdAt)
      VALUES (?1, ?2, ?3, ?4)
    `,
    )
      .bind(chatId, senderUid, text.trim(), Date.now())
      .run()

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error: unknown) {
    console.error('Failed to save real-time chat data node:', error)
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 })
  }
}
