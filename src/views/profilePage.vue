<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

interface GridPost {
  id: number
  image: string
  likes: string
  comments: string
  pinned?: boolean
  isReel?: boolean
}

const router = useRouter()
const route = useRoute()

const profile = ref({
  username: 'joshua_l',
  displayName: 'Joshua Lin',
  avatar: 'https://i.pravatar.cc/300?u=joshua_l',
  verified: true,
  bio: 'Your favourite way to end the week ☀️\nAvailable on web, iOS, Mac & Android',
  link: 'solify.app',
  posts: 128,
  followers: '109K',
  following: 972,
  isOwnProfile: true,
})

const tabs = ['posts', 'reels', 'tagged'] as const
type Tab = (typeof tabs)[number]
const activeTab = ref<Tab>('posts')

const tabIcons: Record<Tab, string> = {
  posts: 'grid',
  reels: 'reel',
  tagged: 'tag',
}
const tabLabels: Record<Tab, string> = {
  posts: 'Posts',
  reels: 'Reels',
  tagged: 'Tagged',
}

const gridPosts = ref<GridPost[]>([
  {
    id: 1,
    image: 'https://picsum.photos/seed/solify-1/500/500',
    likes: '12.4K',
    comments: '312',
    pinned: true,
  },
  { id: 2, image: 'https://picsum.photos/seed/solify-2/500/500', likes: '8,204', comments: '96' },
  {
    id: 3,
    image: 'https://picsum.photos/seed/solify-3/500/500',
    likes: '44,686',
    comments: '1,204',
  },
  {
    id: 4,
    image: 'https://picsum.photos/seed/solify-4/500/500',
    likes: '3,410',
    comments: '58',
    isReel: true,
  },
  { id: 5, image: 'https://picsum.photos/seed/solify-5/500/500', likes: '19,552', comments: '640' },
  { id: 6, image: 'https://picsum.photos/seed/solify-6/500/500', likes: '2,981', comments: '44' },
  {
    id: 7,
    image: 'https://picsum.photos/seed/solify-7/500/500',
    likes: '15,003',
    comments: '287',
    isReel: true,
  },
  { id: 8, image: 'https://picsum.photos/seed/solify-8/500/500', likes: '6,720', comments: '112' },
  { id: 9, image: 'https://picsum.photos/seed/solify-9/500/500', likes: '9,845', comments: '203' },
])

const reelPosts = computed(() => gridPosts.value.filter((p) => p.isReel))

const nowPlaying = ref({
  title: 'Night Drive',
  artist: 'Nao Kobayashi',
  cover: 'https://picsum.photos/seed/night-drive/200/200',
})
const isPlaying = ref(true)

function togglePlay(event: Event) {
  event.stopPropagation()
  isPlaying.value = !isPlaying.value
}

function isActive(name: string) {
  return route.name === name
}

function setTab(tab: Tab) {
  activeTab.value = tab
}

function openConversation() {
  router.push({ name: 'messages', query: { with: profile.value.username } })
}

/* --- Owner-only account controls (simulated) --- */
const optionsOpen = ref(false)
const avatarFileInput = ref<HTMLInputElement | null>(null)

const isEditingUsername = ref(false)
const usernameDraft = ref(profile.value.username)
const usernameError = ref('')

const showDeleteConfirm = ref(false)
const toastMessage = ref('')
let toastTimer: ReturnType<typeof setTimeout> | null = null

function showToast(message: string) {
  toastMessage.value = message
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toastMessage.value = ''
  }, 2600)
}

function toggleOptions() {
  optionsOpen.value = !optionsOpen.value
}

function closeOptions() {
  optionsOpen.value = false
}

function triggerAvatarChange() {
  closeOptions()
  avatarFileInput.value?.click()
}

function onAvatarFileSelected(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    profile.value.avatar = reader.result as string
    showToast('Profile photo updated')
  }
  reader.readAsDataURL(file)
  input.value = ''
}

function startEditUsername() {
  usernameDraft.value = profile.value.username
  usernameError.value = ''
  isEditingUsername.value = true
  closeOptions()
}

function cancelEditUsername() {
  isEditingUsername.value = false
  usernameError.value = ''
}

function saveUsername() {
  const next = usernameDraft.value.trim().toLowerCase()
  if (!next) {
    usernameError.value = 'Username cannot be empty'
    return
  }
  if (!/^[a-z0-9._]{1,30}$/.test(next)) {
    usernameError.value = 'Only letters, numbers, periods and underscores'
    return
  }
  profile.value.username = next
  isEditingUsername.value = false
  showToast('Username updated')
}

function viewArchive() {
  closeOptions()
  showToast('Archive is empty — nothing here yet')
}

function openSettings() {
  closeOptions()
  showToast('Settings & privacy — coming soon')
}

function logOut() {
  closeOptions()
  router.push({ name: 'login' })
}

function requestDeleteAccount() {
  closeOptions()
  showDeleteConfirm.value = true
}

function cancelDeleteAccount() {
  showDeleteConfirm.value = false
}

function confirmDeleteAccount() {
  showDeleteConfirm.value = false
  router.push({ name: 'landing' })
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
          <img :src="profile.avatar" alt="" class="sidebar-avatar" />
          <span class="sidebar-label">Profile</span>
        </button>
      </nav>
    </aside>

    <div class="feed-column">
      <header class="app-header mobile-only">
        <button class="back-btn" type="button" aria-label="Back" @click="router.back()">
          <svg
            class="icon-svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>
        <h1 class="mobile-username">
          {{ profile.username }}
          <svg
            v-if="profile.verified"
            class="lock-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              d="M12 2l2.4 1.4 2.7-.3 1.2 2.4 2.4 1.2-.3 2.7L22 12l-1.4 2.4.3 2.7-2.4 1.2-1.2 2.4-2.7-.3L12 22l-2.4-1.4-2.7.3-1.2-2.4-2.4-1.2.3-2.7L2 12l1.4-2.4-.3-2.7 2.4-1.2 1.2-2.4 2.7.3z"
            />
          </svg>
        </h1>
        <button
          v-if="profile.isOwnProfile"
          class="icon-btn"
          type="button"
          aria-label="Menu"
          @click="toggleOptions"
        >
          <svg
            class="icon-svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="18" x2="20" y2="18" />
          </svg>
        </button>
        <span v-else class="header-spacer" />
      </header>

      <main class="profile-scroll">
        <section class="profile-header">
          <button
            class="avatar-ring"
            :class="{ editable: profile.isOwnProfile }"
            type="button"
            :disabled="!profile.isOwnProfile"
            @click="profile.isOwnProfile && triggerAvatarChange()"
          >
            <img :src="profile.avatar" :alt="profile.username" class="profile-avatar" />
            <span v-if="profile.isOwnProfile" class="avatar-edit-badge" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path
                  d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
                />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </span>
          </button>
          <input
            ref="avatarFileInput"
            type="file"
            accept="image/*"
            class="hidden-file-input"
            @change="onAvatarFileSelected"
          />

          <div class="profile-meta">
            <div v-if="!isEditingUsername" class="username-row">
              <h2 class="profile-username">{{ profile.username }}</h2>
              <span v-if="profile.verified" class="verified-badge">✓</span>
              <button
                v-if="profile.isOwnProfile"
                class="username-edit-btn"
                type="button"
                aria-label="Edit username"
                @click="startEditUsername"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z" />
                </svg>
              </button>
            </div>
            <div v-else class="username-edit-row">
              <span class="username-edit-at">@</span>
              <input
                v-model="usernameDraft"
                type="text"
                class="username-edit-input"
                autofocus
                @keyup.enter="saveUsername"
                @keyup.esc="cancelEditUsername"
              />
              <button class="username-save-btn" type="button" @click="saveUsername">Save</button>
              <button class="username-cancel-btn" type="button" @click="cancelEditUsername">
                Cancel
              </button>
            </div>
            <p v-if="usernameError" class="username-error">{{ usernameError }}</p>

            <div class="stats-row">
              <div class="stat">
                <span class="stat-num">{{ profile.posts }}</span>
                <span class="stat-label">posts</span>
              </div>
              <div class="stat">
                <span class="stat-num">{{ profile.followers }}</span>
                <span class="stat-label">followers</span>
              </div>
              <div class="stat">
                <span class="stat-num">{{ profile.following }}</span>
                <span class="stat-label">following</span>
              </div>
            </div>

            <div class="bio-block">
              <span class="bio-name">{{ profile.displayName }}</span>
              <p class="bio-text">{{ profile.bio }}</p>
              <a class="bio-link" href="#" @click.prevent>
                <svg
                  class="link-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
                {{ profile.link }}
              </a>
            </div>

            <div class="action-row">
              <template v-if="profile.isOwnProfile">
                <button class="edit-profile-btn" type="button" @click="startEditUsername">
                  Edit profile
                </button>
                <button class="archive-btn" type="button" @click="viewArchive">View archive</button>
                <div class="options-wrap">
                  <button
                    class="options-btn"
                    type="button"
                    aria-label="More options"
                    @click="toggleOptions"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="5" cy="12" r="2" />
                      <circle cx="12" cy="12" r="2" />
                      <circle cx="19" cy="12" r="2" />
                    </svg>
                  </button>
                  <div v-if="optionsOpen" class="options-menu">
                    <button class="options-item" type="button" @click="triggerAvatarChange">
                      Change profile photo
                    </button>
                    <button class="options-item" type="button" @click="startEditUsername">
                      Edit username
                    </button>
                    <button class="options-item" type="button" @click="viewArchive">
                      View archive
                    </button>
                    <button class="options-item" type="button" @click="openSettings">
                      Settings and privacy
                    </button>
                    <button class="options-item" type="button" @click="logOut">Log out</button>
                    <button class="options-item danger" type="button" @click="requestDeleteAccount">
                      Delete account
                    </button>
                  </div>
                </div>
              </template>
              <template v-else>
                <button class="follow-btn" type="button">Follow</button>
                <button class="message-btn" type="button" @click="openConversation">Message</button>
              </template>
            </div>
          </div>
        </section>

        <div v-if="optionsOpen" class="options-backdrop" @click="closeOptions" />

        <div v-if="toastMessage" class="toast" role="status">{{ toastMessage }}</div>

        <div v-if="showDeleteConfirm" class="modal-backdrop" @click="cancelDeleteAccount">
          <div class="modal-card" @click.stop>
            <h3 class="modal-title">Delete your account?</h3>
            <p class="modal-body">
              This is a simulated action for preview purposes — your posts, followers, and profile
              info would be permanently removed. This can't be undone.
            </p>
            <div class="modal-actions">
              <button class="modal-cancel-btn" type="button" @click="cancelDeleteAccount">
                Cancel
              </button>
              <button class="modal-delete-btn" type="button" @click="confirmDeleteAccount">
                Delete account
              </button>
            </div>
          </div>
        </div>

        <nav class="profile-tabs">
          <button
            v-for="tab in tabs"
            :key="tab"
            class="tab-btn"
            type="button"
            :class="{ active: activeTab === tab }"
            @click="setTab(tab)"
          >
            <svg
              v-if="tabIcons[tab] === 'grid'"
              class="icon-svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
            </svg>
            <svg
              v-else-if="tabIcons[tab] === 'reel'"
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
            <svg
              v-else
              class="icon-svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span class="tab-label">{{ tabLabels[tab] }}</span>
          </button>
        </nav>

        <section v-if="activeTab === 'posts'" class="post-grid">
          <button v-for="post in gridPosts" :key="post.id" class="grid-cell" type="button">
            <img :src="post.image" alt="" class="grid-img" />
            <span v-if="post.pinned" class="pin-badge" aria-label="Pinned">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l1.5 5.5L19 9l-4 3.5L16 18l-4-2.8L8 18l1-5.5L5 9l5.5-1.5z" />
              </svg>
            </span>
            <span class="grid-overlay">
              <span class="overlay-stat">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path
                    d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                  />
                </svg>
                {{ post.likes }}
              </span>
              <span class="overlay-stat">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path
                    d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
                  />
                </svg>
                {{ post.comments }}
              </span>
            </span>
          </button>
        </section>

        <section v-else-if="activeTab === 'reels'" class="post-grid">
          <button v-for="post in reelPosts" :key="post.id" class="grid-cell" type="button">
            <img :src="post.image" alt="" class="grid-img" />
            <span class="reel-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                <polyline points="2 17 12 22 22 17" />
                <polyline points="2 12 12 17 22 12" />
              </svg>
            </span>
          </button>
        </section>

        <section v-else class="empty-state">
          <div class="empty-icon-ring">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <p class="empty-title">No tagged posts yet</p>
          <p class="empty-sub">
            Photos and videos {{ profile.username }} is tagged in will appear here.
          </p>
        </section>
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
          <img :src="profile.avatar" alt="" class="nav-avatar" />
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

      <div class="rail-about">
        <div class="rail-about-header">About</div>
        <p class="rail-about-text">{{ profile.bio }}</p>
        <a class="rail-about-link" href="#" @click.prevent>{{ profile.link }}</a>
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

/* --- Sidebar (shared shell) --- */
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
  font-weight: 900;
  text-transform: uppercase;
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

/* --- Right rail (shared shell) --- */
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

.rail-about {
  border: 2px solid #2b2a27;
  border-radius: 8px;
  padding: 14px;
}

.rail-about-header {
  font-size: 0.85rem;
  font-weight: 700;
  color: #71717a;
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.rail-about-text {
  font-size: 0.82rem;
  line-height: 1.5;
  white-space: pre-line;
  margin: 0 0 10px 0;
}

.rail-about-link {
  font-size: 0.82rem;
  font-weight: 700;
  color: #16a34a;
  text-decoration: none;
}

/* --- Feed column / page shell --- */
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

.back-btn,
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
}

.mobile-username {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 1.05rem;
  font-weight: 800;
  margin: 0;
}

.lock-icon {
  width: 15px;
  height: 15px;
  color: #16a34a;
}

.header-spacer {
  width: 24px;
  height: 24px;
}

/* --- Profile header --- */
.profile-scroll {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  background-color: #fff;
}

.profile-header {
  display: flex;
  gap: clamp(16px, 5vw, 40px);
  align-items: flex-start;
  padding: clamp(20px, 5vw, 36px) clamp(16px, 5vw, 40px);
  max-width: 900px;
  margin: 0 auto;
  border-bottom: 2px solid #2b2a27;
}

.avatar-ring {
  position: relative;
  flex-shrink: 0;
  width: clamp(78px, 20vw, 140px);
  height: clamp(78px, 20vw, 140px);
  border-radius: 50%;
  padding: 3px;
  background: conic-gradient(from 210deg, #16a34a, #fbbf24, #e11d48, #16a34a);
  border: none;
  cursor: default;
}

.avatar-ring.editable {
  cursor: pointer;
}

.avatar-edit-badge {
  position: absolute;
  bottom: 4px;
  right: 4px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #2b2a27;
  color: #fff;
  border: 2px solid #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-edit-badge svg {
  width: 14px;
  height: 14px;
}

.hidden-file-input {
  display: none;
}

.profile-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  border: 3px solid #fff;
  display: block;
}

.profile-meta {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.username-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.profile-username {
  font-size: clamp(1.1rem, 3vw, 1.4rem);
  font-weight: 800;
  margin: 0;
}

.verified-badge {
  color: #fff;
  background-color: #2b2a27;
  font-size: 0.6rem;
  width: 15px;
  height: 15px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  flex-shrink: 0;
}

.username-edit-btn {
  background: none;
  border: none;
  color: #71717a;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
}

.username-edit-btn svg {
  width: 15px;
  height: 15px;
}

.username-edit-btn:hover {
  color: #2b2a27;
}

.username-edit-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.username-edit-at {
  font-weight: 700;
  color: #71717a;
}

.username-edit-input {
  font-family: inherit;
  font-size: 1rem;
  font-weight: 700;
  border: 2px solid #2b2a27;
  border-radius: 6px;
  padding: 4px 8px;
  outline: none;
  color: #2b2a27;
  background: #fff;
  min-width: 140px;
}

.username-save-btn,
.username-cancel-btn {
  font-family: inherit;
  font-size: 0.78rem;
  font-weight: 700;
  border-radius: 6px;
  padding: 6px 12px;
  cursor: pointer;
  border: 2px solid #2b2a27;
}

.username-save-btn {
  background: #16a34a;
  color: #fff;
}

.username-cancel-btn {
  background: #fff;
  color: #2b2a27;
}

.username-error {
  color: #e11d48;
  font-size: 0.78rem;
  margin: -8px 0 0;
}

.stats-row {
  display: flex;
  gap: clamp(16px, 4vw, 32px);
}

.stat {
  display: flex;
  align-items: baseline;
  gap: 5px;
}

.stat-num {
  font-weight: 800;
  font-size: 0.95rem;
}

.stat-label {
  font-size: 0.85rem;
  color: #71717a;
}

.bio-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 0.88rem;
  line-height: 1.5;
}

.bio-name {
  font-weight: 700;
}

.bio-text {
  margin: 0;
  white-space: pre-line;
  color: #2b2a27;
}

.bio-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #16a34a;
  font-weight: 700;
  text-decoration: none;
  width: fit-content;
}

.link-icon {
  width: 13px;
  height: 13px;
}

.action-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 4px;
}

.edit-profile-btn,
.follow-btn,
.message-btn,
.archive-btn {
  font-family: inherit;
  font-size: 0.85rem;
  font-weight: 700;
  padding: 8px 20px;
  border-radius: 8px;
  border: 2px solid #2b2a27;
  cursor: pointer;
  background: #fff;
  color: #2b2a27;
}

.follow-btn {
  background: #16a34a;
  color: #fff;
}

.edit-profile-btn:hover,
.message-btn:hover,
.archive-btn:hover {
  background: #f4f1ea;
}

.options-wrap {
  position: relative;
}

.options-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 2px solid #2b2a27;
  background: #fff;
  color: #2b2a27;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.options-btn:hover {
  background: #f4f1ea;
}

.options-btn svg {
  width: 18px;
  height: 18px;
}

.options-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  z-index: 20;
  width: 220px;
  background: #fff;
  border: 2px solid #2b2a27;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 4px 4px 0 rgba(43, 42, 39, 0.12);
}

.options-item {
  display: block;
  width: 100%;
  text-align: left;
  padding: 11px 14px;
  font-family: inherit;
  font-size: 0.85rem;
  font-weight: 600;
  background: #fff;
  border: none;
  border-bottom: 1px solid #ece8dd;
  color: #2b2a27;
  cursor: pointer;
}

.options-item:last-child {
  border-bottom: none;
}

.options-item:hover {
  background: #f4f1ea;
}

.options-item.danger {
  color: #e11d48;
}

.options-backdrop {
  position: fixed;
  inset: 0;
  z-index: 10;
  background: transparent;
}

.toast {
  position: fixed;
  left: 50%;
  bottom: 24px;
  transform: translateX(-50%);
  background: #2b2a27;
  color: #fff;
  font-size: 0.85rem;
  font-weight: 600;
  padding: 10px 18px;
  border-radius: 8px;
  z-index: 40;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 50;
  background: rgba(43, 42, 39, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal-card {
  width: 100%;
  max-width: 360px;
  background: #fff;
  border: 2px solid #2b2a27;
  border-radius: 12px;
  padding: 22px;
  text-align: center;
}

.modal-title {
  font-size: 1.05rem;
  font-weight: 800;
  margin: 0 0 10px;
}

.modal-body {
  font-size: 0.85rem;
  color: #71717a;
  line-height: 1.5;
  margin: 0 0 18px;
}

.modal-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.modal-cancel-btn,
.modal-delete-btn {
  font-family: inherit;
  font-size: 0.88rem;
  font-weight: 700;
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
  border: 2px solid #2b2a27;
}

.modal-cancel-btn {
  background: #fff;
  color: #2b2a27;
}

.modal-delete-btn {
  background: #e11d48;
  color: #fff;
  border-color: #e11d48;
}

/* --- Tabs --- */
.profile-tabs {
  display: flex;
  justify-content: center;
  gap: clamp(24px, 8vw, 64px);
  border-bottom: 2px solid #2b2a27;
  max-width: 900px;
  margin: 0 auto;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  border-top: 2px solid transparent;
  padding: 14px 4px;
  cursor: pointer;
  color: #a3a3a3;
  font-family: inherit;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.tab-btn .icon-svg {
  width: 18px;
  height: 18px;
}

.tab-btn.active {
  color: #2b2a27;
  border-top-color: #2b2a27;
}

.tab-label {
  display: none;
}

/* --- Post grid --- */
.post-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2px;
  max-width: 900px;
  margin: 0 auto;
}

.grid-cell {
  position: relative;
  aspect-ratio: 1 / 1;
  border: none;
  padding: 0;
  cursor: pointer;
  overflow: hidden;
  background: #e2e8f0;
}

.grid-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.pin-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 20px;
  height: 20px;
  color: #fff;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5));
}

.reel-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 18px;
  height: 18px;
  color: #fff;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5));
}

.grid-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  background: rgba(43, 42, 39, 0);
  opacity: 0;
  transition:
    opacity 0.15s ease,
    background 0.15s ease;
}

.grid-cell:hover .grid-overlay {
  opacity: 1;
  background: rgba(43, 42, 39, 0.35);
}

.overlay-stat {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #fff;
  font-weight: 800;
  font-size: 0.9rem;
}

.overlay-stat svg {
  width: 18px;
  height: 18px;
}

/* --- Empty state (tagged tab) --- */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 64px 20px;
  text-align: center;
}

.empty-icon-ring {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: 2px solid #2b2a27;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2b2a27;
}

.empty-icon-ring svg {
  width: 30px;
  height: 30px;
}

.empty-title {
  font-size: 1.1rem;
  font-weight: 800;
  margin: 0;
}

.empty-sub {
  font-size: 0.85rem;
  color: #71717a;
  margin: 0;
  max-width: 260px;
}

/* --- Now playing bar (mobile) --- */
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

/* --- Bottom nav (mobile) --- */
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

  .tab-label {
    display: inline;
  }

  .profile-header {
    padding-top: 48px;
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
