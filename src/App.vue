<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <!-- The main container must wrap the view for Vue to render safely -->
  <main>
    <RouterView />
  </main>
</template>

<style scoped></style>
