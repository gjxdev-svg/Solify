<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

interface Track {
  id: number
  title: string
  artist: string
  cover: string
  duration: string
}

const router = useRouter()

const tracks = ref<Track[]>([
  {
    id: 1,
    title: 'Night Drive',
    artist: 'Nao Kobayashi',
    cover: 'https://picsum.photos/seed/night-drive/200/200',
    duration: '3:24',
  },
  {
    id: 2,
    title: 'Paper Lanterns',
    artist: 'Hollow Coast',
    cover: 'https://picsum.photos/seed/paper-lanterns/200/200',
    duration: '2:57',
  },
  {
    id: 3,
    title: 'Static Bloom',
    artist: 'Nao Kobayashi',
    cover: 'https://picsum.photos/seed/static-bloom/200/200',
    duration: '4:02',
  },
  {
    id: 4,
    title: 'Low Tide',
    artist: 'Marlowe',
    cover: 'https://picsum.photos/seed/low-tide/200/200',
    duration: '3:11',
  },
  {
    id: 5,
    title: 'Glass Roads',
    artist: 'Hollow Coast',
    cover: 'https://picsum.photos/seed/glass-roads/200/200',
    duration: '3:48',
  },
])

const defaultTrack: Track = tracks.value[0] ?? {
  id: 0,
  title: 'Nothing queued',
  artist: '—',
  cover: 'https://picsum.photos/seed/silence/200/200',
  duration: '0:00',
}

const currentTrackId = ref(defaultTrack.id)
const isPlaying = ref(true)

const currentTrack = computed<Track>(
  () => tracks.value.find((t) => t.id === currentTrackId.value) ?? defaultTrack,
)

function playTrack(track: Track) {
  if (currentTrackId.value === track.id) {
    isPlaying.value = !isPlaying.value
    return
  }
  currentTrackId.value = track.id
  isPlaying.value = true
}

function goBack() {
  if (window.history.state?.back) {
    router.back()
  } else {
    router.push({ name: 'home' })
  }
}
</script>

<template>
  <div class="music-page">
    <header class="music-header">
      <button class="back-btn" type="button" aria-label="Go back" @click="goBack">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
      </button>
      <h1 class="music-title">Your music</h1>
    </header>

    <section class="now-playing-hero">
      <img :src="currentTrack.cover" alt="" class="hero-cover" />
      <div class="hero-info">
        <span class="hero-eyebrow">Now playing</span>
        <h2 class="hero-track">{{ currentTrack.title }}</h2>
        <span class="hero-artist">{{ currentTrack.artist }}</span>
      </div>
      <button
        class="hero-play-btn"
        type="button"
        :aria-label="isPlaying ? 'Pause' : 'Play'"
        @click="isPlaying = !isPlaying"
      >
        <svg v-if="isPlaying" viewBox="0 0 24 24" fill="currentColor">
          <rect x="6" y="5" width="4" height="14" />
          <rect x="14" y="5" width="4" height="14" />
        </svg>
        <svg v-else viewBox="0 0 24 24" fill="currentColor">
          <polygon points="6 4 20 12 6 20" />
        </svg>
      </button>
    </section>

    <main class="track-list">
      <h3 class="list-heading">Recently played</h3>
      <button
        v-for="track in tracks"
        :key="track.id"
        class="track-row"
        type="button"
        :class="{ active: track.id === currentTrackId }"
        @click="playTrack(track)"
      >
        <img :src="track.cover" alt="" class="track-cover" />
        <span class="track-meta">
          <span class="track-title">{{ track.title }}</span>
          <span class="track-artist">{{ track.artist }}</span>
        </span>
        <span class="track-duration">{{ track.duration }}</span>
      </button>
    </main>
  </div>
</template>

<style scoped>
* {
  box-sizing: border-box;
}

.music-page {
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

.music-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px clamp(16px, 4vw, 24px);
  border-bottom: 2px solid #2b2a27;
  background: #fff;
  flex-shrink: 0;
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

.music-title {
  font-size: 1.25rem;
  font-weight: 800;
  margin: 0;
}

.now-playing-hero {
  display: flex;
  align-items: center;
  gap: clamp(12px, 4vw, 16px);
  padding: clamp(16px, 4vw, 24px);
  background: #16a34a;
  color: #fff;
}

.hero-cover {
  width: clamp(56px, 16vw, 72px);
  height: clamp(56px, 16vw, 72px);
  border-radius: 4px;
  object-fit: cover;
  border: 2px solid #2b2a27;
  flex-shrink: 0;
}

.hero-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
}

.hero-eyebrow {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  opacity: 0.85;
}

.hero-track {
  font-size: clamp(1.1rem, 4vw, 1.4rem);
  font-weight: 800;
  margin: 2px 0 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hero-artist {
  font-size: 0.85rem;
  opacity: 0.9;
}

.hero-play-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #fff;
  color: #16a34a;
  border: 2px solid #2b2a27;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.hero-play-btn svg {
  width: 20px;
  height: 20px;
}

.track-list {
  flex: 1;
  overflow-y: auto;
  padding: clamp(16px, 4vw, 24px);
}

.list-heading {
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #71717a;
  margin: 0 0 12px;
}

.track-row {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 8px;
  background: none;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  color: #2b2a27;
}

.track-row.active {
  background: #fff;
  border: 2px solid #2b2a27;
}

.track-cover {
  width: 44px;
  height: 44px;
  border-radius: 4px;
  object-fit: cover;
  border: 2px solid #2b2a27;
  flex-shrink: 0;
}

.track-meta {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
}

.track-title {
  font-weight: 700;
  font-size: 0.9rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.track-row.active .track-title {
  color: #16a34a;
}

.track-artist {
  font-size: 0.78rem;
  color: #71717a;
}

.track-duration {
  font-size: 0.78rem;
  color: #71717a;
  flex-shrink: 0;
}
</style>
