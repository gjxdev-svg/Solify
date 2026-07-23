<script setup>
import { ref } from 'vue'

const email = ref('')
const password = ref('')

const handleSignup = () => {
  // Your code to send data to the server goes here
  console.log(email.value, password.value)
}
</script>

<template>
  <div class="success-page">
    <div class="success-card">
      <h2 class="logo-title">Solify</h2>
      <h1 class="title">Sign Up Below</h1>
      <div>
        <form @submit.prevent="handleSignup">
          <input type="email" v-model="email" /><br />
          <input type="password" v-model="password" /><br />
          <button type="submit">Sign Up</button>
        </form>
      </div>
      <div class="success-icon">✓</div>
      <h2 class="success-title">Page Loaded Successfully!</h2>
      <div class="decorative-line"></div>
    </div>
  </div>
</template>

<style scoped>
.success-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #f4f1ea; /* Cream editorial paper background */
  padding: 40px;
  position: relative;
  overflow: hidden;
}

.success-card {
  width: 100%;
  max-width: 480px;
  background: #fbf9f4;
  padding: 48px 40px;
  border-radius: 4px; /* Crisp, hard geometric edges */
  border: 2px solid #2b2a27; /* Deep charcoal border */
  box-shadow: 8px 8px 0px #2b2a27; /* Thick analog offset drop shadow */
  text-align: center;
  z-index: 2;
}

.logo-title {
  width: 100;
  color: black;
  font-size: 4rem;
  text-transform: uppercase;
}

.success-icon {
  font-size: 2.5rem;
  color: #c46626; /* Warm 1970s burnt orange accent */
  margin-bottom: 16px;
}

.success-title {
  font-family: 'Georgia', 'Times New Roman', serif; /* Elegant serif typeface */
  color: #2b2a27;
  font-size: 2rem;
  font-weight: 700;
  line-height: 1.2;
}

.decorative-line {
  width: 60px;
  height: 3px;
  background-color: #2b2a27;
  margin: 24px auto 0 auto;
  border-top: 1px solid #2b2a27;
  border-bottom: 1px solid #2b2a27;
}
</style>
