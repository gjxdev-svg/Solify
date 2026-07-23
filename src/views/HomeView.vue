<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <!-- Bind the coordinates directly as native CSS variables on the root container -->
  <main class="container">
    <!-- Left Hero Section (Retro Editorial Style) -->
    <div class="left-side">
      <div class="grain-overlay"></div>
      <div class="hero-content fade-in-up">
        <h1 class="welcome">Welcome to <span class="brand-accent">Solify</span></h1>
        <p class="information">
          Get started by either signing in or logging into Solify to listen to music while chatting
          with your friends all in one place.
        </p>
      </div>
      <div class="copyright fade-in">&copy; 2026 Solify. All rights reserved.</div>
    </div>

    <!-- Right Interaction Section (Tactile Card Entry) -->
    <div class="right-side">
      <div class="card-page slide-in-right">
        <h2 class="card-title">Access Your Account</h2>
        <p class="card-subtitle">Connect, stream, and chat instantly.</p>

        <div class="action-buttons">
          <RouterLink to="/register" class="btn btn-primary btn-click">
            <span>Get Started</span>
            <svg class="arrow-icon" viewBox="0 0 24 24">
              <path
                d="M5 12h14M12 5l7 7-7 7"
                stroke="currentColor"
                stroke-width="2"
                fill="none"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </RouterLink>

          <RouterLink to="/login" class="btn btn-secondary btn-click">Log In</RouterLink>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped></style>
