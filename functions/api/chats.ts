interface Env {
  DB: D1Database
  FIREBASE_API_KEY: string
}

import { jsonResponse, verifyFirebaseUser } from './_auth'
import { enforceRateLimit } from './_rateLimit'

// GET: Fetches messages for a specific conversation room
export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const { request, env } = context
    const { uid } = await verifyFirebaseUser(request, env)
    const url = new URL(request.url)
    const chatId = url.searchParams.get('chatId') // e.g., "uid1_uid2"

    if (!chatId) {
      return jsonResponse({ error: 'Missing chatId parameter' }, 400)
    }

    if (!chatId.includes(uid)) {
      return jsonResponse({ error: 'You cannot access this chat' }, 403)
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

    return jsonResponse({ messages: results || [] })
  } catch (error: unknown) {
    if (error instanceof Response) {
      return error
    }
    console.error('Failed to load message history logs:', error)
    return jsonResponse({ error: 'Internal Server Error' }, 500)
  }
}

// POST: Saves a incoming chat text message
export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { request, env } = context
    const { uid } = await verifyFirebaseUser(request, env)
    await enforceRateLimit(env, uid, 'chat_write')
    const body = await request.json<{ chatId: string; text: string }>()

    const { chatId, text } = body

    if (!chatId || !text || text.trim() === '') {
      return jsonResponse({ error: 'Incomplete message data parameters' }, 400)
    }

    if (!chatId.includes(uid)) {
      return jsonResponse({ error: 'You cannot send to this chat' }, 403)
    }

    await env.DB.prepare(
      `
      INSERT INTO messages (chatId, senderUid, text, createdAt)
      VALUES (?1, ?2, ?3, ?4)
    `,
    )
      .bind(chatId, uid, text.trim(), Date.now())
      .run()

    return jsonResponse({ success: true })
  } catch (error: unknown) {
    if (error instanceof Response) {
      return error
    }
    console.error('Failed to save real-time chat data node:', error)
    return jsonResponse({ error: 'Internal Server Error' }, 500)
  }
}
