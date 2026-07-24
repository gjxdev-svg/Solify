import { auth } from '@/firebase'

export const getAuthHeaders = async (): Promise<HeadersInit> => {
  const user = auth.currentUser
  if (!user) {
    throw new Error('No authenticated user')
  }

  const idToken = await user.getIdToken()
  return {
    Authorization: `Bearer ${idToken}`,
  }
}
