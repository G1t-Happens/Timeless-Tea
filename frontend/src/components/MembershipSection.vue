<template>
  <section class="member-section">
    <!-- Textbereich für die Mitgliedseinladung -->
    <div class="text-container">
      <h2 class="headline-title mb-3">Jetzt Mitglied werden!</h2>
      <p>Verpasse keine unserer neuen Sorten und Angebote!</p>
      <p>Erlebe exklusive Teekreationen und genieße besondere Aktionen</p>
    </div>

    <!-- Button und RouterLink zum Mitgliedsbereich -->
    <div class="text-center">
      <RouterLink to="member">
        <button class="btn btn-image" type="button">
          <!-- Membership Icon -->
          <img src="../../src/assets/icons/membership.png" alt="Mitglied werden" />
        </button>
      </RouterLink>
    </div>
  </section>
</template>

<script setup>
// Kein zusätzlicher JavaScript-Code erforderlich
</script>

<style scoped>
/* Container für den Textbereich */
.text-container {
  text-align: center; /* Zentriert den Text */
  margin-bottom: 20px; /* Abstand zum nächsten Element */
}

/* Stil für die Überschrift */
.headline-title {
  font-size: 2rem; /* Größere Schriftgröße für die Hauptüberschrift */
  color: #9fa86d; /* Grüner Farbton für die Überschrift */
  font-weight: bold; /* Fettgedruckt für mehr Betonung */
  margin-bottom: 1rem; /* Abstand nach unten */
}

/* Hover-Effekt auf das Bild im Button */
.btn-image:hover img {
  transform: scale(1.1); /* Bild wird bei Hover leicht vergrößert */
}
</style>
