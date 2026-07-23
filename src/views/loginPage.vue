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

const handleLogin = async (): Promise<void> => {
  errorMessage.value = ''
  successMessage.value = ''

  if (!email.value || !password.value) {
    errorMessage.value = 'Please fill out all fields.'
    return
  }

  isLoading.value = true

  try {
    await sleep(1500)

    const user = mockCloudDatabase.find(
      (u) => u.email.toLowerCase() === email.value.toLowerCase().trim(),
    )

    if (!user || user.password !== password.value) {
      throw new Error('Invalid email or password.')
    }

    console.log('Server response: 200 OK', { email: email.value })
    successMessage.value = 'Login successful! Welcome back...'

    await sleep(2000)
    await router.push('/home')

    email.value = ''
    password.value = ''
    isPasswordVisible.value = false
  } catch (error: unknown) {
    if (error instanceof Error) {
      errorMessage.value = error.message
    } else {
      errorMessage.value = 'An error occurred during login.'
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <h2 class="logo-title">Solify</h2>
      <h1 class="title">Welcome Back</h1>
      <div>
        <form @submit.prevent="handleLogin">
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
            {{ isLoading ? 'Verifying...' : 'Log In' }}
          </button>
        </form>

        <div class="divider">
          <span class="divider-text">or</span>
        </div>

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
          Don't have an account? <router-link to="/register" class="auth-link">Sign Up</router-link>
        </p>

        <p class="switch-auth-mode2">
          <router-link to="/" class="auth-link">Go Back home</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #f4f1ea;
  padding: 40px;
  position: relative;
  overflow: hidden;
}

.login-card {
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
  margin: 0 0 8px 0;
}

.title {
  font-family: 'Georgia', 'Times New Roman', serif;
  color: #2b2a27;
  margin-bottom: 32px;
  font-size: 1.75rem;
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
  padding: 22px 12px 6px 12px;
  height: 54px;
  box-sizing: border-box;
  border: 2px solid #2b2a27;
  border-radius: 4px;
  background: #fff;
  font-family: inherit;
  font-size: 1rem;
  color: #2b2a27;
  outline: none;
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
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #71717a;
  pointer-events: none;
  font-size: 1rem;
  font-family: inherit;
  transition: all 0.2s ease-out;
  background-color: transparent;
  line-height: 1;
}

.form-input:focus ~ .floating-label,
.form-input:not(:placeholder-shown) ~ .floating-label {
  top: 14px;
  font-size: 0.75rem;
  color: #2b2a27;
  font-weight: bold;
}

.toggle-btn {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2b2a27;
}

.icon-svg {
  width: 20px;
  height: 20px;
}

.submit-btn {
  width: 100%;
  height: 50px;
  background-color: #2b2a27;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: 10px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.submit-btn:hover:not(:disabled) {
  background-color: #413f3b;
}

.submit-btn:disabled {
  background-color: #a1a1aa;
  cursor: not-allowed;
}

.divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 24px 0;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  border-bottom: 2px solid #2b2a27;
}

.divider:not(:empty)::before {
  margin-right: 0.5em;
}

.divider:not(:empty)::after {
  margin-left: 0.5em;
}

.divider-text {
  font-family: 'Georgia', serif;
  font-style: italic;
  color: #2b2a27;
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
  transform: translate(2px, 2px);
  box-shadow: 2px 2px 0px #2b2a27;
}

.google-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.google-icon {
  width: 20px;
  height: 20px;
}

.error-msg {
  color: #e11d48;
  font-size: 0.875rem;
  margin: 8px 0;
  text-align: left;
  font-weight: 500;
}

.success-msg {
  color: #16a34a;
  font-size: 0.875rem;
  margin: 8px 0;
  text-align: left;
  font-weight: 500;
}

.switch-auth-mode {
  margin-top: 32px;
  font-size: 0.9rem;
  color: #71717a;
}

.switch-auth-mode2 {
  position: relative;
  top: 20px;
}

.auth-link {
  color: #2b2a27;
  font-weight: bold;
  text-decoration: underline;
}
</style>
