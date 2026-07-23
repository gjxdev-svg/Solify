<script setup lang="ts">
import { useRouter } from 'vue-router'

defineProps<{
  title: string
}>()

const router = useRouter()

function goBack() {
  if (window.history.state?.back) {
    router.back()
  } else {
    router.push({ name: 'home' })
  }
}
</script>

<template>
  <div class="placeholder-page">
    <header class="placeholder-header">
      <button class="back-btn" type="button" aria-label="Go back" @click="goBack">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
      </button>
      <h1 class="placeholder-title">{{ title }}</h1>
    </header>

    <main class="placeholder-body">
      <p>{{ title }} is coming soon.</p>
    </main>
  </div>
</template>

<style scoped>
.placeholder-page {
  min-height: 100dvh;
  background: #fbf9f4;
  color: #2b2a27;
  font-family:
    system-ui,
    -apple-system,
    sans-serif;
  display: flex;
  flex-direction: column;
}

.placeholder-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px clamp(16px, 4vw, 24px);
  border-bottom: 2px solid #2b2a27;
  background: #fff;
}

.back-btn {
  background: none;
  border: none;
  color: #2b2a27;
  cursor: pointer;
  display: flex;
  padding: 4px;
}

.back-btn svg {
  width: 24px;
  height: 24px;
}

.placeholder-title {
  font-size: 1.25rem;
  font-weight: 800;
  margin: 0;
}

.placeholder-body {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 24px;
  color: #71717a;
}
</style>
