<template>
  <div class="success-page">
    <div class="grain-overlay"></div>
    <div class="success-card">
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

/* Faux paper grain overlay */
.grain-overlay {
  position: absolute;
  inset: 0;
  opacity: 0.04;
  pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://w3.org id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
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
