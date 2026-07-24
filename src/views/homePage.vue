<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { auth } from '@/firebase' // Ensure this path points to your firebase.ts file
import { type Unsubscribe } from 'firebase/auth'

interface Story {
  id: number
  name: string
  avatar: string
  viewed: boolean
  isUser?: boolean
  live?: boolean
  followed?: boolean
}

interface Post {
  id: number
  username: string
  location: string
  avatar: string
  verified: boolean
  postImage: string
  likes: string
  caption: string
  isLiked: boolean
  isSaved: boolean
}

const router = useRouter()
const route = useRoute()

// Holder for the live listener cleanup hook
let unsubscribe: Unsubscribe | null = null

const stories = ref<Story[]>([
  {
    id: 1,
    name: 'Your Story', // Will update dynamically when Firebase loads
    avatar: 'https://i.pravatar.cc/150?u=you', // Will update dynamically
    viewed: true,
    isUser: true,
  },
  {
    id: 2,
    name: 'karennne',
    avatar: 'https://i.pravatar.cc/150?u=karennne',
    viewed: false,
    live: true,
    followed: false,
  },
  {
    id: 3,
    name: 'zackjohn',
    avatar: 'https://i.pravatar.cc/150?u=zackjohn',
    viewed: false,
    followed: false,
  },
  {
    id: 4,
    name: 'kieron_d',
    avatar: 'https://i.pravatar.cc/150?u=kieron_d',
    viewed: true,
    followed: true,
  },
  {
    id: 5,
    name: 'craig_love',
    avatar: 'https://i.pravatar.cc/150?u=craig_love',
    viewed: true,
    followed: false,
  },
])

const posts = ref<Post[]>([
  {
    id: 1,
    username: 'joshua_l',
    location: 'Tokyo, Japan',
    avatar: 'https://i.pravatar.cc/150?u=joshua_l',
    verified: true,
    postImage: 'https://picsum.photos/seed/tokyo-game/800/800',
    likes: '44,686',
    caption: 'The game in Japan was amazing and I want to share some photos',
    isLiked: false,
    isSaved: false,
  },
])

const nowPlaying = ref({
  title: 'Night Drive',
  artist: 'Nao Kobayashi',
  cover: 'https://picsum.photos/seed/night-drive/200/200',
})
const isPlaying = ref(true)

// ==========================================
// API DATA FETCHING ROUTINES
// ==========================================
const loadFeedData = async (): Promise<void> => {
  try {
    const res = await fetch('/api/feed')
    if (!res.ok) {
      throw new Error('Network response was not ok')
    }

    const data = (await res.json()) as {
      feed: Array<{
        postId: number
        postImage: string
        caption: string
        likesCount: number
        username: string
        handle: string
        userAvatar: string | null
        trackName: string | null
        artistName: string | null
        albumCover: string | null
        spotifyUrl: string | null
      }>
    }

    posts.value = data.feed.map((item) => ({
      id: item.postId,
      username: item.username,
      location: `@${item.handle}`, // Displays their clean handle as the location line
      avatar: item.userAvatar || 'https://pravatar.cc',
      verified: true,
      postImage: item.postImage,
      likes: Number(item.likesCount).toLocaleString(),
      caption: item.caption,
      isLiked: false,
      isSaved: false,
    }))
  } catch (err) {
    console.error('Failed to populate feed from Cloudflare D1:', err)
  }
}

// ==========================================
// LIVE AUTH SESSION LIFECYCLE HOOKS
// ==========================================
onMounted(() => {
  unsubscribe = auth.onAuthStateChanged(async (user) => {
    if (user) {
      const userStory = stories.value.find((s) => s.id === 1)

      try {
        // 1. Fetch their profile records from your custom Cloudflare D1 Database
        const response = await fetch(`/api/profile?uid=${user.uid}`)
        const data = (await response.json()) as {
          profile: { username: string; handle: string; photoURL: string } | null
        }

        let finalName = ''
        let finalAvatar = ''

        if (data.profile) {
          // User exists in D1! Pull their custom username and R2 avatar image link
          finalName = data.profile.username
          finalAvatar = data.profile.photoURL
        } else {
          // User doesn't exist in D1 yet (Brand new signup with no onboarding process)
          const emailParts = user.email ? user.email.split('@') : []
          const fallbackHandle = emailParts[0]
            ? emailParts[0].toLowerCase().replace(/[^a-z0-9_]/g, '')
            : 'user'
          finalName = user.displayName || fallbackHandle
          finalAvatar = user.photoURL || `https://pravatar.cc{user.uid}`

          // Silently provision their brand new Cloudflare database entry in the background
          const setupData = new FormData()
          setupData.append('uid', user.uid)
          setupData.append('username', finalName)
          setupData.append('handle', fallbackHandle)

          void fetch('/api/profile', { method: 'POST', body: setupData })
        }

        // 2. Safely apply the verified Cloudflare metrics to your UI story layout component
        if (userStory) {
          userStory.name = finalName
          userStory.avatar = finalAvatar
        }

        // >>> PLACE THE FEED LOAD CALL HERE <<<
        await loadFeedData()
      } catch (err) {
        console.error(
          'Cloudflare data fetch failure, defaulting to Firebase local auth state tokens:',
          err,
        )
        // Global safe layout emergency fallbacks if your backend network connection drops
        if (userStory) {
          const emailParts = user.email ? user.email.split('@') : []
          userStory.name = user.displayName || (emailParts[0] ? emailParts[0] : 'You')
          userStory.avatar = user.photoURL || 'https://pravatar.cc'
        }
      }
    } else {
      void router.push('/login')
    }
  })
})

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe() // Clean up active backend websockets to prevent performance leaks
  }
})

// ==========================================
// INTERACTIVE PAGE METHODS
// ==========================================
function togglePlay(event: Event) {
  event.stopPropagation()
  isPlaying.value = !isPlaying.value
}

function openStory(story: Story) {
  if (story.isUser) {
    void router.push({ name: 'create' })
    return
  }
  story.viewed = true
}

function toggleFollow(story: Story) {
  story.followed = !story.followed
}

function isActive(name: string) {
  return route.name === name
}
</script>

<template>
  <div class="app-shell">
    <aside class="sidebar">
      <button class="sidebar-logo" type="button" @click="router.push({ name: 'home' })">
        <span class="logo-title">solify</span>
      </button>

      <nav class="sidebar-nav">
        <button
          class="sidebar-link"
          type="button"
          :class="{ active: isActive('home') }"
          @click="router.push({ name: 'home' })"
        >
          <svg class="icon-svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          </svg>
          <span class="sidebar-label">Home</span>
        </button>

        <button
          class="sidebar-link"
          type="button"
          :class="{ active: isActive('search') }"
          @click="router.push({ name: 'search' })"
        >
          <svg
            class="icon-svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <span class="sidebar-label">Search</span>
        </button>

        <button
          class="sidebar-link"
          type="button"
          :class="{ active: isActive('create') }"
          @click="router.push({ name: 'create' })"
        >
          <svg
            class="icon-svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <line x1="12" y1="8" x2="12" y2="16" />
            <line x1="8" y1="12" x2="16" y2="12" />
          </svg>
          <span class="sidebar-label">Create</span>
        </button>

        <button
          class="sidebar-link"
          type="button"
          :class="{ active: isActive('reels') }"
          @click="router.push({ name: 'reels' })"
        >
          <svg
            class="icon-svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <polygon points="12 2 2 7 12 12 22 7 12 2" />
            <polyline points="2 17 12 22 22 17" />
            <polyline points="2 12 12 17 22 12" />
          </svg>
          <span class="sidebar-label">Reels</span>
        </button>

        <button
          class="sidebar-link"
          type="button"
          :class="{ active: isActive('music') }"
          @click="router.push({ name: 'music' })"
        >
          <svg
            class="icon-svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
          <span class="sidebar-label">Music</span>
        </button>

        <button
          class="sidebar-link"
          type="button"
          :class="{ active: isActive('notifications') }"
          @click="router.push({ name: 'notifications' })"
        >
          <svg
            class="icon-svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span class="sidebar-label">Notifications</span>
        </button>

        <button
          class="sidebar-link"
          type="button"
          :class="{ active: isActive('messages') }"
          @click="router.push({ name: 'messages' })"
        >
          <svg
            class="icon-svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M22 2L11 13" />
            <path d="M22 2l-7 20-4-9-9-4z" />
          </svg>
          <span class="sidebar-label">Messages</span>
        </button>

        <button
          class="sidebar-link"
          type="button"
          :class="{ active: isActive('profile') }"
          @click="router.push({ name: 'profile' })"
        >
          <img src="https://i.pravatar.cc/150?u=you" alt="" class="sidebar-avatar" />
          <span class="sidebar-label">Profile</span>
        </button>
      </nav>
    </aside>

    <!-- Center feed -->
    <div class="feed-column">
      <header class="app-header mobile-only">
        <button class="logo-btn" type="button" @click="router.push({ name: 'home' })">
          <h1 class="logo-title">solify</h1>
        </button>
        <div class="header-actions">
          <button
            class="icon-btn"
            type="button"
            aria-label="Your music"
            @click="router.push({ name: 'music' })"
          >
            <svg
              class="icon-svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
          </button>
          <button
            class="icon-btn"
            type="button"
            aria-label="Notifications"
            @click="router.push({ name: 'notifications' })"
          >
            <svg
              class="icon-svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </button>
        </div>
      </header>

      <div class="stories-bar">
        <button
          v-for="story in stories"
          :key="story.id"
          class="story-item"
          type="button"
          @click="openStory(story)"
        >
          <span
            class="avatar-wrapper"
            :class="{ unread: !story.viewed, 'live-border': story.live }"
          >
            <img :src="story.avatar" :alt="story.name" class="avatar-img" />
            <span v-if="story.live" class="live-badge">LIVE</span>
          </span>
          <span class="story-name">{{ story.name }}</span>
        </button>
      </div>

      <main class="posts-container">
        <article v-for="post in posts" :key="post.id" class="post-card">
          <div class="post-header">
            <img :src="post.avatar" :alt="post.username" class="post-avatar" />
            <div class="post-user-info">
              <div class="username-row">
                <span class="username">{{ post.username }}</span>
                <span v-if="post.verified" class="verified-badge">✓</span>
              </div>
              <span class="location">{{ post.location }}</span>
            </div>
          </div>

          <div class="post-media">
            <img :src="post.postImage" alt="Post content" class="media-img" />
          </div>

          <div class="post-actions">
            <div class="left-actions">
              <button
                class="icon-btn"
                type="button"
                :aria-label="post.isLiked ? 'Unlike' : 'Like'"
                @click="post.isLiked = !post.isLiked"
              >
                <svg
                  class="icon-svg"
                  :class="{ liked: post.isLiked }"
                  viewBox="0 0 24 24"
                  :fill="post.isLiked ? 'currentColor' : 'none'"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                  />
                </svg>
              </button>
              <button class="icon-btn" type="button" aria-label="Comment">
                <svg
                  class="icon-svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
                  />
                </svg>
              </button>
              <button class="icon-btn" type="button" aria-label="Share">
                <svg
                  class="icon-svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
            <button
              class="icon-btn"
              type="button"
              :aria-label="post.isSaved ? 'Unsave' : 'Save'"
              @click="post.isSaved = !post.isSaved"
            >
              <svg
                class="icon-svg"
                viewBox="0 0 24 24"
                :fill="post.isSaved ? 'currentColor' : 'none'"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
            </button>
          </div>

          <div class="post-details">
            <p class="likes-count">
              Liked by <span class="bold-text">craig_love</span> and
              <span class="bold-text">{{ post.likes }} others</span>
            </p>
            <p class="caption">
              <span class="bold-text">{{ post.username }}</span> {{ post.caption }}
            </p>
          </div>
        </article>
      </main>

      <div
        class="now-playing-bar mobile-only"
        role="button"
        tabindex="0"
        aria-label="Open your music"
        @click="router.push({ name: 'music' })"
        @keydown.enter="router.push({ name: 'music' })"
      >
        <img :src="nowPlaying.cover" alt="" class="now-playing-cover" />
        <span class="now-playing-meta">
          <span class="now-playing-title">{{ nowPlaying.title }}</span>
          <span class="now-playing-artist">{{ nowPlaying.artist }}</span>
        </span>
        <button
          class="now-playing-play"
          type="button"
          :aria-label="isPlaying ? 'Pause' : 'Play'"
          @click="togglePlay"
        >
          <svg v-if="isPlaying" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="5" width="4" height="14" />
            <rect x="14" y="5" width="4" height="14" />
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="currentColor">
            <polygon points="6 4 20 12 6 20" />
          </svg>
        </button>
      </div>

      <nav class="bottom-nav mobile-only">
        <button
          class="nav-btn"
          type="button"
          aria-label="Home"
          :class="{ active: isActive('home') }"
          @click="router.push({ name: 'home' })"
        >
          <svg class="icon-svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          </svg>
        </button>
        <button
          class="nav-btn"
          type="button"
          aria-label="Search"
          :class="{ active: isActive('search') }"
          @click="router.push({ name: 'search' })"
        >
          <svg
            class="icon-svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>
        <button
          class="nav-btn"
          type="button"
          aria-label="New post"
          :class="{ active: isActive('create') }"
          @click="router.push({ name: 'create' })"
        >
          <svg
            class="icon-svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <line x1="12" y1="8" x2="12" y2="16" />
            <line x1="8" y1="12" x2="16" y2="12" />
          </svg>
        </button>
        <button
          class="nav-btn"
          type="button"
          aria-label="Reels"
          :class="{ active: isActive('reels') }"
          @click="router.push({ name: 'reels' })"
        >
          <svg
            class="icon-svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <polygon points="12 2 2 7 12 12 22 7 12 2" />
            <polyline points="2 17 12 22 22 17" />
            <polyline points="2 12 12 17 22 12" />
          </svg>
        </button>
        <button
          class="nav-btn profile-nav-btn"
          type="button"
          aria-label="Profile"
          :class="{ active: isActive('profile') }"
          @click="router.push({ name: 'profile' })"
        >
          <img src="https://i.pravatar.cc/150?u=you" alt="" class="nav-avatar" />
        </button>
      </nav>
    </div>

    <aside class="right-rail">
      <div
        class="rail-now-playing"
        role="button"
        tabindex="0"
        aria-label="Open your music"
        @click="router.push({ name: 'music' })"
        @keydown.enter="router.push({ name: 'music' })"
      >
        <img :src="nowPlaying.cover" alt="" class="rail-cover" />
        <span class="rail-track-meta">
          <span class="rail-eyebrow">Now playing</span>
          <span class="rail-track-title">{{ nowPlaying.title }}</span>
          <span class="rail-track-artist">{{ nowPlaying.artist }}</span>
        </span>
        <button
          class="rail-play-btn"
          type="button"
          :aria-label="isPlaying ? 'Pause' : 'Play'"
          @click="togglePlay"
        >
          <svg v-if="isPlaying" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="5" width="4" height="14" />
            <rect x="14" y="5" width="4" height="14" />
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="currentColor">
            <polygon points="6 4 20 12 6 20" />
          </svg>
        </button>
      </div>

      <div class="rail-suggestions">
        <div class="rail-suggestions-header">
          <span>Suggested for you</span>
        </div>
        <div
          v-for="story in stories.filter((s) => !s.isUser)"
          :key="story.id"
          class="rail-suggestion-row"
        >
          <img :src="story.avatar" :alt="story.name" class="rail-suggestion-avatar" />
          <span class="rail-suggestion-name">{{ story.name }}</span>
          <button class="rail-follow-btn" type="button" @click="toggleFollow(story)">
            {{ story.followed ? 'Following' : 'Follow' }}
          </button>
        </div>
      </div>
    </aside>
  </div>
</template>

<style>
html,
body {
  margin: 0;
  padding: 0;
  height: 100%;
  overflow: hidden;
}

#app {
  height: 100%;
}
</style>

<style scoped>
* {
  box-sizing: border-box;
}

.app-shell {
  display: flex;
  height: 100dvh;
  width: 100%;
  background-color: #fbf9f4;
  font-family:
    system-ui,
    -apple-system,
    sans-serif;
  color: #2b2a27;
  overflow: hidden;
}

.sidebar {
  display: none;
  flex-direction: column;
  gap: 32px;
  width: 88px;
  height: 100%;
  padding: 20px 12px;
  border-right: 2px solid #2b2a27;
  background: #fff;
  flex-shrink: 0;
}

.sidebar-logo {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  justify-content: center;
}

.sidebar .logo-title {
  font-size: 1.6rem;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sidebar-link {
  display: flex;
  align-items: center;
  gap: 12px;
  background: none;
  border: none;
  color: #2b2a27;
  cursor: pointer;
  padding: 10px;
  border-radius: 6px;
  font-family: inherit;
  font-size: 0.85rem;
  font-weight: 600;
}

.sidebar-link:hover {
  background: #f4f1ea;
}

.sidebar-link.active {
  background: #2b2a27;
  color: #fff;
}

.sidebar-link .icon-svg {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.sidebar-label {
  display: none;
  white-space: nowrap;
}

.sidebar-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid currentColor;
  flex-shrink: 0;
}

.right-rail {
  display: none;
  flex-direction: column;
  gap: 24px;
  width: 300px;
  height: 100%;
  padding: 24px 20px;
  border-left: 2px solid #2b2a27;
  background: #fff;
  overflow-y: auto;
  flex-shrink: 0;
}

.rail-now-playing {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: #16a34a;
  color: #fff;
  border: 2px solid #2b2a27;
  border-radius: 8px;
  cursor: pointer;
}

.rail-cover {
  width: 44px;
  height: 44px;
  border-radius: 4px;
  object-fit: cover;
  border: 2px solid #2b2a27;
  flex-shrink: 0;
}

.rail-track-meta {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
}

.rail-eyebrow {
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  opacity: 0.85;
}

.rail-track-title {
  font-size: 0.85rem;
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rail-track-artist {
  font-size: 0.75rem;
  opacity: 0.9;
}

.rail-play-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #fff;
  color: #16a34a;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
}

.rail-play-btn svg {
  width: 16px;
  height: 16px;
}

.rail-suggestions-header {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  font-weight: 700;
  color: #71717a;
  margin-bottom: 12px;
}

.rail-suggestion-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 0;
}

.rail-suggestion-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #2b2a27;
  flex-shrink: 0;
}

.rail-suggestion-name {
  flex: 1;
  font-size: 0.85rem;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rail-follow-btn {
  background: none;
  border: none;
  color: #16a34a;
  font-weight: 700;
  font-size: 0.78rem;
  cursor: pointer;
}

.feed-column {
  flex: 1;
  min-width: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px clamp(14px, 4vw, 20px);
  border-bottom: 2px solid #2b2a27;
  background: #fff;
  flex-shrink: 0;
}

.logo-btn {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
}

.logo-title {
  color: #2b2a27;
  font-size: clamp(1.5rem, 5vw, 2.25rem);
  text-transform: uppercase;
  margin: 0;
  font-weight: 900;
  letter-spacing: -0.03em;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stories-bar {
  display: flex;
  gap: clamp(8px, 3vw, 16px);
  padding: 12px clamp(10px, 4vw, 20px);
  overflow-x: auto;
  border-bottom: 2px solid #2b2a27;
  background: #fff;
  scrollbar-width: none;
  flex-shrink: 0;
}
.stories-bar::-webkit-scrollbar {
  display: none;
}

.story-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: clamp(52px, 15vw, 64px);
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
}

.avatar-wrapper {
  position: relative;
  width: clamp(44px, 13vw, 56px);
  height: clamp(44px, 13vw, 56px);
  border-radius: 50%;
  border: 2px solid transparent;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-wrapper.unread {
  border-color: #e11d48;
}

.avatar-wrapper.live-border {
  border-color: #16a34a;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  border: 2px solid #2b2a27;
}

.live-badge {
  position: absolute;
  bottom: -4px;
  background-color: #16a34a;
  color: white;
  font-size: 0.6rem;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 4px;
  border: 1.5px solid #2b2a27;
}

.story-name {
  font-size: 0.7rem;
  color: #2b2a27;
  margin-top: 6px;
  max-width: clamp(52px, 15vw, 64px);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.posts-container {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  background-color: #fff;
}

.post-card {
  max-width: 600px;
  margin: 0 auto;
  background: #fff;
  border-bottom: 2px solid #2b2a27;
}

.post-header {
  display: flex;
  align-items: center;
  padding: 12px clamp(12px, 4vw, 16px);
}

.post-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid #2b2a27;
  object-fit: cover;
  margin-right: 12px;
  flex-shrink: 0;
}

.post-user-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.username-row {
  display: flex;
  align-items: center;
  gap: 4px;
}

.username {
  font-weight: bold;
  font-size: 0.9rem;
  color: #2b2a27;
}

.verified-badge {
  color: #fff;
  background-color: #2b2a27;
  font-size: 0.6rem;
  width: 12px;
  height: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  flex-shrink: 0;
}

.location {
  font-size: 0.75rem;
  color: #71717a;
}

.post-media {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  border-top: 2px solid #2b2a27;
  border-bottom: 2px solid #2b2a27;
  background-color: #e2e8f0;
}

.media-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.post-actions {
  display: flex;
  justify-content: space-between;
  padding: 12px clamp(12px, 4vw, 16px);
}

.left-actions {
  display: flex;
  gap: 16px;
}

.icon-btn {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  color: #2b2a27;
}

.icon-svg {
  width: 24px;
  height: 24px;
  transition: transform 0.1s ease;
}

.icon-btn:hover .icon-svg {
  transform: scale(1.1);
}

.icon-svg.liked {
  color: #e11d48;
}

.post-details {
  padding: 0 clamp(12px, 4vw, 16px) 16px;
  text-align: left;
  font-size: 0.9rem;
  color: #2b2a27;
  line-height: 1.4;
}

.likes-count {
  margin: 0 0 6px 0;
}

.caption {
  margin: 0;
}

.bold-text {
  font-weight: 800;
}

.now-playing-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 8px clamp(12px, 4vw, 16px);
  background: #16a34a;
  color: #fff;
  border-top: 2px solid #2b2a27;
  cursor: pointer;
  flex-shrink: 0;
}

.now-playing-cover {
  width: 34px;
  height: 34px;
  border-radius: 4px;
  object-fit: cover;
  border: 2px solid #2b2a27;
  flex-shrink: 0;
}

.now-playing-meta {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
}

.now-playing-title {
  font-size: 0.82rem;
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.now-playing-artist {
  font-size: 0.72rem;
  opacity: 0.85;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.now-playing-play {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #fff;
  color: #16a34a;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.now-playing-play svg {
  width: 14px;
  height: 14px;
}

.bottom-nav {
  display: flex;
  align-items: center;
  justify-content: space-around;
  height: 56px;
  padding: 0 10px calc(env(safe-area-inset-bottom, 0px));
  background: #fff;
  border-top: 2px solid #2b2a27;
  flex-shrink: 0;
}

.nav-btn {
  background: none;
  border: none;
  color: #71717a;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-btn.active {
  color: #2b2a27;
}

.profile-nav-btn {
  padding: 0;
}

.nav-avatar {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 2px solid #2b2a27;
  object-fit: cover;
}

.nav-btn.active .nav-avatar {
  border-color: #e11d48;
}

@media (min-width: 768px) {
  .mobile-only {
    display: none !important;
  }

  .sidebar {
    display: flex;
  }
}

@media (min-width: 900px) {
  .sidebar-label {
    display: inline;
  }

  .sidebar {
    width: 230px;
  }
}

@media (min-width: 1100px) {
  .right-rail {
    display: flex;
  }
}
</style>
