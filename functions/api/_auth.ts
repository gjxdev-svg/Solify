interface Env {
  FIREBASE_API_KEY: string
}

interface FirebaseLookupUser {
  localId: string
  email?: string
}

interface FirebaseLookupResponse {
  users?: FirebaseLookupUser[]
}

const jsonHeaders = { 'Content-Type': 'application/json' }

export const jsonResponse = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), { status, headers: jsonHeaders })

const getBearerToken = (request: Request): string | null => {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.slice('Bearer '.length).trim()
  return token.length > 0 ? token : null
}

export const verifyFirebaseUser = async (
  request: Request,
  env: Env,
): Promise<{ uid: string; token: string }> => {
  const token = getBearerToken(request)
  if (!token) {
    throw new Response(JSON.stringify({ error: 'Missing bearer token' }), {
      status: 401,
      headers: jsonHeaders,
    })
  }

  const lookupRes = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${env.FIREBASE_API_KEY}`,
    {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({ idToken: token }),
    },
  )

  if (!lookupRes.ok) {
    throw new Response(JSON.stringify({ error: 'Invalid authentication token' }), {
      status: 401,
      headers: jsonHeaders,
    })
  }

  const payload = (await lookupRes.json()) as FirebaseLookupResponse
  const uid = payload.users?.[0]?.localId
  if (!uid) {
    throw new Response(JSON.stringify({ error: 'Unable to resolve authenticated user' }), {
      status: 401,
      headers: jsonHeaders,
    })
  }

  return { uid, token }
}
