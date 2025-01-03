<template>
  <div class="card h-100 shadow-sm">
    <div class="card-body">
      <h5 class="card-title">{{ user.firstName }} {{ user.lastName }}</h5>
      <p class="card-text">
        <strong>Email:</strong> {{ user.emailAddress }}
      </p>
      <p class="card-text">
        <strong>Rolle:</strong> {{ user.isAdmin ? 'Admin' : 'Benutzer' }}
      </p>

      <!-- Adresse anzeigen oder eine Standardnachricht -->
      <p class="card-text">
        <strong>Adresse:</strong>
        <span v-if="user.address">
          {{ user.address.street }}, {{ user.address.city }}, {{ user.address.zipCode }}, {{ user.address.country }}
        </span>
        <span v-else>
          Noch nicht ausgefüllt
        </span>
      </p>

      <!-- Zahlungsmethode anzeigen oder eine Standardnachricht -->
      <p class="card-text">
        <strong>Zahlungsmethode:</strong>
        <span v-if="user.payment">
          {{ user.payment.method }}
        </span>
        <span v-else>
          Noch nicht ausgefüllt
        </span>
      </p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  user: {
    type: Object,
    required: true,
  },
});
</script>

<style scoped>
.card-title {
  font-size: 1.25rem;
  font-weight: bold;
}

.card-text {
  font-size: 1rem;
}
</style>
