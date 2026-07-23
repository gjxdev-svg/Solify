<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { mockCloudDatabase } from '@/utils/mockDb'

const router = useRouter()
const email = ref('')
const password = ref('')
const isPasswordVisible = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

const togglePasswordVisibility = (): void => {
  isPasswordVisible.value = !isPasswordVisible.value
}

const handleGoogleLogin = async (): Promise<void> => {
  errorMessage.value = ''
  successMessage.value = ''
  isLoading.value = true

  try {
    await sleep(2000)

    console.log('Server response: 200 OK - Authenticated via Google Oauth')
    successMessage.value = 'Google login successful! Redirecting...'

    await sleep(1500)
    await router.push('/home')
  } catch (error) {
    errorMessage.value = 'Google authentication failed.'
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

const handleSignup = async (): Promise<void> => {
  errorMessage.value = ''
  successMessage.value = ''

  if (!email.value || !password.value) {
    errorMessage.value = 'Please fill out all fields.'
    return
  }

  if (email.value.toLowerCase().includes(password.value.toLowerCase())) {
    errorMessage.value = 'Security error: Your email address cannot contain your password.'
    return
  }

  isLoading.value = true

  try {
    await sleep(1500)

    const emailExists = mockCloudDatabase.some(
      (user) => user.email.toLowerCase() === email.value.toLowerCase().trim(),
    )

    if (emailExists) {
      throw new Error('This email is already registered to an account.')
    }

    console.log('Server response: 201 Created', {
      email: email.value,
      password: password.value,
    })

    successMessage.value = 'Account successfully created! Redirecting...'

    await sleep(2000)

    await router.push('/home')

    email.value = ''
    password.value = ''
    isPasswordVisible.value = false
  } catch (error: unknown) {
    if (error instanceof Error) {
      errorMessage.value = error.message
    } else {
      errorMessage.value = 'An error occurred during signup.'
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="success-page">
    <div class="success-card">
      <h2 class="logo-title">Solify</h2>
      <h1 class="title">Sign Up Below</h1>
      <div>
        <form @submit.prevent="handleSignup">
          <div class="input-group">
            <input
              id="email-input"
              type="email"
              v-model="email"
              :disabled="isLoading"
              placeholder=" "
              class="form-input"
            />
            <label for="email-input" class="floating-label">Email Address</label>
          </div>

          <div class="input-group password-wrapper">
            <input
              id="password-input"
              :type="isPasswordVisible ? 'text' : 'password'"
              v-model="password"
              :disabled="isLoading"
              placeholder=" "
              class="form-input password-input"
            />
            <label for="password-input" class="floating-label">Password</label>

            <button
              type="button"
              class="toggle-btn"
              :aria-label="isPasswordVisible ? 'Hide password' : 'Show password'"
              @click="togglePasswordVisibility"
            >
              <svg
                v-if="isPasswordVisible"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="2"
                stroke="currentColor"
                class="icon-svg"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 11-4.243-4.243m4.242 4.242L9.88 9.88"
                />
              </svg>

              <svg
                v-else
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="2"
                stroke="currentColor"
                class="icon-svg"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>
          </div>

          <p v-if="errorMessage" class="error-msg">{{ errorMessage }}</p>
          <p v-if="successMessage" class="success-msg">{{ successMessage }}</p>

          <button type="submit" :disabled="isLoading" class="submit-btn">
            {{ isLoading ? 'Connecting...' : 'Sign Up' }}
          </button>
        </form>

        <!-- Visual Context Line Break -->
        <div class="divider">
          <span class="divider-text">or</span>
        </div>

        <!-- Google Authentication Button -->
        <button type="button" :disabled="isLoading" @click="handleGoogleLogin" class="google-btn">
          <svg class="google-icon" viewBox="0 0 48 48">
            <path
              fill="#EA4335"
              d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
            />
            <path
              fill="#4285F4"
              d="M46.5 24c0-1.55-.15-3.24-.47-4.77H24v9.03h12.75c-.55 2.87-2.22 5.29-4.65 6.92l7.25 5.62c4.23-3.9 6.65-9.64 6.65-16.8z"
            />
            <path
              fill="#FBBC05"
              d="M10.54 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.98-6.19z"
            />
            <path
              fill="#34A853"
              d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.25-5.62c-2.03 1.37-4.63 2.18-8.64 2.18-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
            />
          </svg>
          Sign in with Google
        </button>

        <p class="switch-auth-mode">
          Don't have an account? <router-link to="/login" class="auth-link">Log In</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.success-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #f4f1ea;
  padding: 40px;
  position: relative;
  overflow: hidden;
}

.success-card {
  width: 100%;
  max-width: 480px;
  background: #fbf9f4;
  padding: 48px 40px;
  border-radius: 4px;
  border: 2px solid #2b2a27;
  box-shadow: 8px 8px 0px #2b2a27;
  text-align: center;
  z-index: 2;
}

.logo-title {
  width: 100%;
  color: black;
  font-size: 4rem;
  text-transform: uppercase;
}

.title {
  font-family: 'Georgia', 'Times New Roman', serif;
  color: #2b2a27;
  margin-bottom: 32px;
}

.input-group {
  position: relative;
  margin-bottom: 20px;
  width: 100%;
}

.password-wrapper {
  display: flex;
  align-items: center;
}

.form-input {
  width: 100%;
  padding: 16px 12px 8px 12px;
  height: 54px;
  box-sizing: border-box;
  border: 2px solid #2b2a27;
  border-radius: 4px;
  background: #fff;
  font-family: inherit;
  font-size: 1rem;
  color: #2b2a27;
}

.password-input {
  padding-right: 44px;
}

.form-input:disabled {
  background-color: #e2e8f0;
  cursor: not-allowed;
}

.floating-label {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #71717a;
  pointer-events: none;
  font-size: 1rem;
  font-family: inherit;
  transition: all 0.2s ease-out;
  background-color: transparent;
}

.form-input:focus ~ .floating-label,
.form-input:not(:placeholder-shown) ~ .floating-label {
  top: 14px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #2b2a27;
}

.toggle-btn {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #71717a;
  transition: color 0.15s ease;
}

.toggle-btn:hover {
  color: #2b2a27;
}

.icon-svg {
  width: 20px;
  height: 20px;
}

.submit-btn {
  width: 100%;
  padding: 14px;
  background-color: #2b2a27;
  color: #fbf9f4;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 8px;
  transition: opacity 0.2s ease;
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 20px 0;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  border-bottom: 2px solid #2b2a27;
}

.divider-text {
  padding: 0 12px;
  font-weight: 600;
  color: #2b2a27;
  text-transform: uppercase;
  font-size: 0.85rem;
}

.google-btn {
  width: 100%;
  height: 50px;
  background-color: #fff;
  color: #2b2a27;
  border: 2px solid #2b2a27;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  box-shadow: 4px 4px 0px #2b2a27;
  transition:
    transform 0.1s,
    box-shadow 0.1s;
}

.google-btn:hover:not(:disabled) {
  background-color: #f4f1ea;
}

.google-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.google-icon {
  width: 18px;
  height: 18px;
}

.error-msg {
  color: #dc2626;
  font-size: 0.85rem;
  margin: 4px 0 12px 0;
  text-align: left;
}

.success-msg {
  color: #16a34a;
  font-size: 0.85rem;
  margin: 4px 0 12px 0;
  text-align: left;
}

.switch-auth-mode {
  margin-top: 32px;
  font-size: 0.9rem;
  color: #71717a;
}

.auth-link {
  color: #2b2a27;
  font-weight: bold;
  text-decoration: underline;
}
</style>
