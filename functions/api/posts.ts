interface Env {
  DB: D1Database
  SOLIFY_BUCKET: R2Bucket
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { request, env } = context
    const formData = await request.formData()

    // 1. Extract post details
    const uid = formData.get('uid') as string | null
    const caption = formData.get('caption') as string | null
    const imageFile = formData.get('postImage') as File | null

    // 2. Extract Spotify metadata strings
    const trackName = formData.get('trackName') as string | null
    const artistName = formData.get('artistName') as string | null
    const albumCover = formData.get('albumCover') as string | null
    const spotifyUrl = formData.get('spotifyUrl') as string | null

    if (!uid || !imageFile || imageFile.size === 0) {
      return new Response('Missing required post arguments', { status: 400 })
    }

    // Generate a unique random ID for the post image name
    const postId = crypto.randomUUID()
    const fileKey = `posts/${uid}/${postId}.jpg`

    // 3. Upload the media file straight into your R2 bucket
    await env.SOLIFY_BUCKET.put(fileKey, imageFile, {
      httpMetadata: { contentType: imageFile.type || 'image/jpeg' },
    })

    const url = new URL(request.url)
    const postImageUrl = `${url.origin}/${fileKey}`
    const timestamp = Date.now()

    // 4. Save the Instagram-style post data into D1 SQL
    const postResult = await env.DB.prepare(
      `
      INSERT INTO posts (uid, postImage, caption, createdAt)
      VALUES (?1, ?2, ?3, ?4)
      RETURNING id
    `,
    )
      .bind(uid, postImageUrl, caption || '', timestamp)
      .first<{ id: number }>()

    if (!postResult) {
      throw new Error('Failed to commit structural post metadata')
    }

    // 5. If a Spotify song was attached, insert it into the songs table linked to this post
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

    return new Response(JSON.stringify({ success: true, postId: postResult.id }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error: unknown) {
    console.error('Critical Post API failure:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}
