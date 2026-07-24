import { jsonResponse } from './_auth'
import { purgeDueDeletions } from './_accountLifecycle'

interface Env {
  DB: D1Database
  SOLIFY_BUCKET: R2Bucket
  FIREBASE_API_KEY: string
  ACCOUNT_PURGE_SECRET: string
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { request, env } = context
    const providedSecret = request.headers.get('x-purge-secret')
    if (!providedSecret || providedSecret !== env.ACCOUNT_PURGE_SECRET) {
      return jsonResponse({ error: 'Unauthorized' }, 401)
    }

    await purgeDueDeletions(env)
    return jsonResponse({ success: true })
  } catch (error: unknown) {
    console.error('Account purge endpoint failed', error)
    return jsonResponse({ error: 'Internal Server Error' }, 500)
  }
}
