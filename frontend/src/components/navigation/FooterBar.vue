<template>
  <!-- Footer -->
  <footer class="text-center py-3">
    <div class="footer-links">
      <router-link to="/impressum" class="footer-link">Impressum</router-link>
      <router-link to="/payment_shipping" class="footer-link">Versand & Zahlung</router-link>
      <router-link to="/contact" class="footer-link">Kontakt</router-link>
      <router-link to="/returns" class="footer-link">Rückgabe & Umtausch</router-link>
      <router-link to="/faq" class="footer-link">FAQ</router-link>
    </div>
    <div class="footer-divider"></div>
    <p>&copy; 2024 Timeless Tea. Alle Rechte vorbehalten.</p>
  </footer>
</template>

<script setup></script>

<style scoped>
footer {
  background-color: #4a5043;
  color: #fff;
}

.footer-links {
  margin-bottom: 10px;
}

.footer-link {
  color: #fff;
  text-decoration: none;
  margin: 0 10px;
  font-size: 14px;
  transition: color 0.3s ease;
}

.footer-link:hover {
  color: #c06e52;
}

.footer-divider {
  width: 80%; /* Trennlinie hat 80% der Footer-Breite */
  height: 2px; /* Höhe der Trennlinie */
  background: linear-gradient(to right, #c06e52, #7a844b); /* Farbverlauf */
  margin: 10px auto; /* Zentrieren und Abstand */
  border-radius: 1px;
}

footer p {
  margin: 0;
  font-size: 14px;
}
</style>
