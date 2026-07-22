<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterView } from 'vue-router'

// Glow elements stay reactive but use hardware-accelerated transforms
const glowTransform = ref('translate3d(-1000px, -1000px, 0)')
// Single reactive string for the SVG points attribute to minimize template rerenders
const pointsString = ref('')

// Core physics and tracking history kept strictly plain to avoid Vue proxy overhead
let historyX: number[] = []
let historyY: number[] = []
const MAX_HISTORY = 16 // Slightly higher gives a longer, luxurious sweep

let currentX = -100
let currentY = -100
let targetX = -100
let targetY = -100

let rafId: number | null = null

const onMouseMove = (e: MouseEvent) => {
  targetX = e.clientX
  targetY = e.clientY
}

// Linear interpolation loop ensures fluid physics independent of hardware mouse polling rates
const updateAnimation = () => {
  // Lerp factor (0.35) cushions sudden direction changes smoothly
  currentX += (targetX - currentX) * 0.35
  currentY += (targetY - currentY) * 0.35

  // Efficiently move the glow layer via compositing instead of layout triggers
  glowTransform.value = `translate3d(${targetX - 250}px, ${targetY - 250}px, 0)`

  // Append new positions
  historyX.push(Math.round(currentX))
  historyY.push(Math.round(currentY))

  if (historyX.length > MAX_HISTORY) {
    historyX.shift()
    historyY.shift()
  }

  // Blazing fast native string compilation instead of reactive array loops
  let str = ''
  for (let i = 0; i < historyX.length; i++) {
    str += `${historyX[i]},${historyY[i]} `
  }
  pointsString.value = str

  rafId = requestAnimationFrame(updateAnimation)
}

onMounted(() => {
  window.addEventListener('mousemove', onMouseMove, { passive: true })
  rafId = requestAnimationFrame(updateAnimation)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', onMouseMove)
  if (rafId) cancelAnimationFrame(rafId)
})
</script>

<template>
  <main class="app-vintage-container">
    <!-- Inline hardware-level SVG processing filter -->
    <svg class="ink-filter-definition">
      <defs>
        <filter id="retro-ink-bleed">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" result="noise" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="9"
            xChannelSelector="R"
            yChannelSelector="G"
            result="displaced"
          />
          <feGaussianBlur in="displaced" stdDeviation="0.8" result="blurred" />
          <feMerge>
            <feMergeNode in="blurred" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
    </svg>

    <!-- Warm Incandescent Desktop Lamp Glow Layer -->
    <div class="cursor-glow" :style="{ transform: glowTransform }"></div>

    <!-- Active Trail Element -->
    <svg class="ink-trail-viewport">
      <polyline :points="pointsString" class="vintage-ink-line" />
    </svg>

    <RouterView />
  </main>
</template>

<style>
.app-vintage-container {
  min-height: 100vh;
  width: 100%;
  position: relative;
  overflow-x: hidden;
  background-color: #f4f1ea;
  cursor:
    url("data:image/svg+xml,%3Csvg xmlns='http://w3.org' width='12' height='12' viewBox='0 0 12 12'%3E%3Ccircle cx='6' cy='6' r='4' fill='%232b2a27'/%3E%3C/svg%3E")
      6 6,
    auto;
}

.ink-filter-definition {
  position: absolute;
  width: 0;
  height: 0;
  pointer-events: none;
}

.ink-trail-viewport {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 9999;
}

.vintage-ink-line {
  fill: none;
  stroke: #2b2a27;
  stroke-width: 6px;
  stroke-linecap: round;
  stroke-linejoin: round;
  opacity: 0.35;
  filter: url(#retro-ink-bleed);
}

.cursor-glow {
  position: fixed;
  top: 0;
  left: 0;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(223, 138, 73, 0.05) 0%, rgba(244, 241, 234, 0) 70%);
  border-radius: 50%;
  pointer-events: none;
  z-index: 1;
  will-change: transform;
}
</style>
