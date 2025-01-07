<template>
  <div class="user-dashboard">
    <!-- Dashboard Header -->
    <div class="header">
      <h2 class="text-center user-title">User Dashboard</h2>
    </div>

    <!-- Navigation Buttons -->
    <div class="navigation mb-4">
      <button
        @click="navigateToOrders"
        class="btn navigation-btn"
      >
        Meine Bestellungen
      </button>
      <button
        @click="navigateToFavorites"
        class="btn navigation-btn"
      >
        Meine Favoriten
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";

const router = useRouter();

// Navigation zu Bestellungen
const navigateToOrders = () => {
  router.push("/user/orders");
};

// Navigation zu Favoriten
const navigateToFavorites = () => {
  router.push("/user/favorites");
};
</script>

<style scoped>
.user-title {
  font-size: 2rem;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 2px;
  text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

/* Navigation Buttons */
.navigation {
  display: flex;
  flex-wrap: wrap; /* Buttons umbrechen bei kleineren Bildschirmen */
  justify-content: center;
  gap: 20px; /* Abstand zwischen den Buttons */
  padding-bottom: 50px;
}

.navigation-btn {
  font-size: 1.2rem; /* Größere Schriftgröße */
  font-weight: bold; /* Fettdruck */
  text-transform: uppercase; /* Großbuchstaben */
  letter-spacing: 1px; /* Leichte Zeichenabstände */
  padding: 12px 25px; /* Größere Polsterung */
  border-radius: 10px; /* Runde Ecken */
  border: transparent; /* Klare Rahmenfarbe */
  background: linear-gradient(135deg, #D4B483, #C06E52); /* Farbverlauf mit den gewünschten Farben */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* Leichter Schatten */
  transition: all 0.3s ease; /* Sanfte Übergänge */
  color: #F1E2C5;
  text-align: center;
}

.navigation-btn:hover {
  background: linear-gradient(135deg, #C06E52, #D4B483); /* Umgekehrter Farbverlauf beim Hover */
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3); /* Stärkerer Schatten beim Hover */
  transform: translateY(-3px); /* Leichtes Anheben */
  color: white;
}

.navigation-btn:active {
  transform: translateY(1px); /* Leichtes Absenken beim Klick */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* Schatten zurücksetzen */
  color: white;
}
</style>
