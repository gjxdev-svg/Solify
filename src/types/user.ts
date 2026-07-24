// types/user.ts
export interface UserProfile {
  uid: string
  username: string
  displayName: string
  handle: string
  photoURL: string
  onboardingCompleted: number
  deletionScheduledAt: number | null
  updatedAt: number
}
