interface Env {
  DB: D1Database
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const { env } = context

    // Single fast query that merges user profiles, posts, and attached songs
    const { results } = await env.DB.prepare(
      `
      SELECT
        p.id as postId,
        p.postImage,
        p.caption,
        p.likesCount,
        p.createdAt,
        u.username,
        u.handle,
        u.photoURL as userAvatar,
        s.trackName,
        s.artistName,
        s.albumCover,
        s.spotifyUrl
      FROM posts p
      JOIN users u ON p.uid = u.uid
      LEFT JOIN songs s ON p.id = s.post_id
      ORDER BY p.createdAt DESC
      LIMIT 20
    `,
    ).all()

    return new Response(JSON.stringify({ feed: results }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error: unknown) {
    console.error('Failed to load activity stream feed:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}
