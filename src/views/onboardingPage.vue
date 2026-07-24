<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from '@/firebase'
import { getAuthHeaders } from '@/utils/authApi'

const router = useRouter()
const username = ref('')
const displayName = ref('')
const avatarFile = ref<File | null>(null)
const previewUrl = ref('')
const isSubmitting = ref(false)
const errorMessage = ref('')

const onAvatarSelected = (event: Event): void => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  avatarFile.value = file
  previewUrl.value = URL.createObjectURL(file)
}

const submitOnboarding = async (): Promise<void> => {
  errorMessage.value = ''
  const cleanUsername = username.value.trim().toLowerCase()
  const cleanName = displayName.value.trim()

  if (!cleanUsername || !cleanName) {
    errorMessage.value = 'Username and name are required.'
    return
  }

  if (!/^[a-z0-9._]{3,30}$/.test(cleanUsername)) {
    errorMessage.value = 'Username must be 3-30 chars and use letters, numbers, "." or "_".'
    return
  }

  try {
    isSubmitting.value = true
    const headers = await getAuthHeaders()
    const formData = new FormData()
    formData.append('username', cleanUsername)
    formData.append('displayName', cleanName)
    formData.append('onboardingCompleted', '1')
    if (avatarFile.value) {
      formData.append('avatar', avatarFile.value)
    }

    const res = await fetch('/api/profile', {
      method: 'POST',
      headers,
      body: formData,
    })

    if (!res.ok) {
      const data = (await res.json()) as { error?: string }
      throw new Error(data.error || 'Failed to save onboarding data')
    }

    await router.push({ name: 'home' })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Onboarding failed.'
    errorMessage.value = message
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  auth.onAuthStateChanged((user) => {
    if (!user) {
      void router.push({ name: 'login' })
      return
    }

    if (!displayName.value) {
      displayName.value = user.displayName || ''
    }
    if (!username.value && user.email) {
      username.value = user.email.split('@')[0]?.toLowerCase() || ''
    }
  })
})
</script>

<template>
  <div class="onboarding-page">
    <form class="onboarding-card" @submit.prevent="submitOnboarding">
      <h1>Finish your profile</h1>
      <p>Set your username, name, and photo so your account is fully ready.</p>

      <label class="field">
        Username
        <input v-model="username" type="text" maxlength="30" required />
      </label>

      <label class="field">
        Name
        <input v-model="displayName" type="text" maxlength="80" required />
      </label>

      <label class="field">
        Profile picture
        <input type="file" accept="image/*" @change="onAvatarSelected" />
      </label>

      <img v-if="previewUrl" :src="previewUrl" class="avatar-preview" alt="Avatar preview" />

      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

      <button type="submit" :disabled="isSubmitting">
        {{ isSubmitting ? 'Saving...' : 'Complete onboarding' }}
      </button>
    </form>
  </div>
</template>

<style scoped>
.onboarding-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: #f4f1ea;
  padding: 24px;
}

.onboarding-card {
  width: min(460px, 100%);
  background: #fbf9f4;
  border: 2px solid #2b2a27;
  box-shadow: 8px 8px 0 #2b2a27;
  padding: 24px;
  display: grid;
  gap: 12px;
}

.field {
  display: grid;
  gap: 6px;
  font-weight: 600;
}

input {
  border: 2px solid #2b2a27;
  padding: 10px;
  border-radius: 4px;
}

.avatar-preview {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #2b2a27;
}

.error {
  color: #dc2626;
  margin: 0;
}

button {
  background: #2b2a27;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 4px;
  font-weight: 700;
  cursor: pointer;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
