interface Env {
  DB: D1Database
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const { env } = context

    // Single fast query that cleanly grabs posts, merging user metadata and attached songs
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
      INNER JOIN users u ON p.uid = u.uid
      LEFT JOIN songs s ON p.id = s.post_id
      ORDER BY p.createdAt DESC
      LIMIT 20
    `,
    ).all()

    return new Response(JSON.stringify({ feed: results || [] }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store', // Prevent browsers from caching an outdated feed
      },
    })
  } catch (error: unknown) {
    console.error('Failed to load activity stream feed:', error)
    return new Response(JSON.stringify({ error: 'Internal Server Error', feed: [] }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
