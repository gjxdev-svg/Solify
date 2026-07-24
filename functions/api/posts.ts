interface Env {
  DB: D1Database
  SOLIFY_BUCKET: R2Bucket
  FIREBASE_API_KEY: string
}

import { verifyFirebaseUser, jsonResponse } from './_auth'
import { enforceRateLimit } from './_rateLimit'
import { purgeDueDeletions } from './_accountLifecycle'

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { request, env } = context
    const { uid } = await verifyFirebaseUser(request, env)
    await enforceRateLimit(env, uid, 'post_write')
    await purgeDueDeletions(env)
    const formData = await request.formData()

    const caption = formData.get('caption') as string | null
    const imageFile = formData.get('postImage') as File | null

    // 2. Extract Spotify metadata strings
    const trackName = formData.get('trackName') as string | null
    const artistName = formData.get('artistName') as string | null
    const albumCover = formData.get('albumCover') as string | null
    const spotifyUrl = formData.get('spotifyUrl') as string | null

    if (!imageFile || imageFile.size === 0) {
      return jsonResponse({ error: 'Missing required Post Image file' }, 400)
    }

    // Generate unique identifier for R2 asset storage keys
    const postId = crypto.randomUUID()
    const fileKey = `posts/${uid}/${postId}.jpg`

    // 3. Upload the media file straight into your R2 bucket
    await env.SOLIFY_BUCKET.put(fileKey, imageFile, {
      httpMetadata: { contentType: imageFile.type || 'image/jpeg' },
    })

    const url = new URL(request.url)
    const postImageUrl = `${url.origin}/${fileKey}`
    const timestamp = Date.now()

    // 4. Save Instagram-style post row into D1
    const postResult = await env.DB.prepare(
      `
      INSERT INTO posts (uid, postImage, caption, likesCount, createdAt)
      VALUES (?1, ?2, ?3, 0, ?4)
      RETURNING id
    `,
    )
      .bind(uid, postImageUrl, caption || '', timestamp)
      .first<{ id: number }>()

    if (!postResult) {
      throw new Error('Failed to commit structural post metadata into D1')
    }

    // 5. If a Spotify track is attached, write it into the songs table
    if (trackName && artistName) {
      await env.DB.prepare(
        `
        INSERT INTO songs (uid, post_id, trackName, artistName, albumCover, spotifyUrl, createdAt)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
      `,
      )
        .bind(
          uid,
          postResult.id,
          trackName.trim(),
          artistName.trim(),
          albumCover || '',
          spotifyUrl || '',
          timestamp,
        )
        .run()
    }

    return jsonResponse({ success: true, postId: postResult.id })
  } catch (error: unknown) {
    if (error instanceof Response) {
      return error
    }
    console.error('Critical Post API failure:', error)
    return jsonResponse({ error: 'Internal Server Error' }, 500)
  }
}
