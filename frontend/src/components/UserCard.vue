<template>
  <div class="card h-100 shadow-sm">
    <div class="card-body">
      <h5 class="card-title">{{ user.firstName }} {{ user.lastName }}</h5>
      <p class="card-text"><strong>User-ID: </strong>{{ user.id }}</p>
      <p class="card-text"><strong>Email:</strong> {{ user.emailAddress }}</p>
      <p class="card-text"><strong>Rolle:</strong> {{ user.isAdmin ? 'Admin' : 'Benutzer' }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  user: {
    type: Object,
    required: true,
  },
})
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
