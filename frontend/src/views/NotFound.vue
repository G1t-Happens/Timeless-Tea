<template>
  <div class="not-found d-flex flex-column justify-content-center align-items-center vh-100">
    <i class="bi bi-exclamation-triangle-fill text-danger" style="font-size: 4rem"></i>
    <h1 class="mt-4">404 - Seite nicht gefunden</h1>
    <p class="text-muted">Die Seite, die Sie suchen, existiert nicht oder wurde verschoben.</p>
    <router-link :to="{ name: 'LandingPage' }" class="btn save-btn mt-3">
      <i class="bi bi-house-door"></i> Zur Startseite
    </router-link>
  </div>
</template>

<script setup></script>

<style scoped>
.not-found {
  text-align: center;
  padding: 2rem;
}

.not-found h1 {
  font-size: 3rem;
  font-weight: bold;
}

.not-found p {
  font-size: 1.25rem;
  margin: 1rem 0;
}

.not-found .btn {
  font-size: 1rem;
  padding: 0.75rem 1.5rem;
}

.save-btn {
  background-color: #4a5043;
  color: white;
  margin-right: 10px;
}

.save-btn:hover {
  background-color: #9fa86d;
}
</style>
