// Define a clear interface for user objects to ensure type safety
export interface MockUser {
  email: string
  password: string
}

// Named export containing your hardcoded cloud database simulation
export const mockCloudDatabase: MockUser[] = [
  { email: 'test@example.com', password: 'Password123' },
  { email: 'user@gmail.com', password: 'SecurePassword5' },
  { email: 'admin@domain.com', password: 'AdminPassword!' },
]
