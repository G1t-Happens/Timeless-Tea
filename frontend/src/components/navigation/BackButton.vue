<template>
  <!-- Zurück-Button -->
  <div>
    <button type="button" @click="goBack" class="btn-back" title="Zurück zur vorherigen Seite">
      <!-- SVG-Icon für den Zurück-Pfeil -->
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="back-icon"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fill-rule="evenodd"
          d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
          clip-rule="evenodd"
        />
      </svg>
      Zurück
    </button>
  </div>
</template>

<script setup>
import router from '@/router/index.js'

const goBack = () => {
  if (window.history.length > 1) {
    router.back()
  }
}
</script>

<style scoped>
/* Stil für den Zurück-Button */
.btn-back {
  background-color: #f0f0f0; /* Heller Hintergrund */
  color: #4a5043; /* Textfarbe */
  border: none; /* Kein Rahmen */
  padding: 8px 12px; /* Innenabstand */
  border-radius: 5px; /* Abgerundete Ecken */
  cursor: pointer; /* Mauszeiger als Hand */
  font-size: 1rem; /* Schriftgröße */
  display: flex; /* Flexbox für Icon und Text */
  align-items: center; /* Vertikale Zentrierung */
  transition:
    background-color 0.3s,
    color 0.3s; /* Übergangseffekte */
}

/* Hover Color */
.btn-back:hover {
  background-color: #4a5043; /* Hintergrundfarbe beim Hover */
  color: white; /* Textfarbe beim Hover */
}

/* SVG-Icon innerhalb des Zurück-Buttons */
.back-icon {
  width: 25px; /* Breite des Icons */
  height: 20px; /* Höhe des Icons */
  margin-right: 8px; /* Abstand zwischen Icon und Text */
}
</style>
