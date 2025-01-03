<!-- src/components/OrderCard.vue -->
<template>
  <div class="card h-100 shadow-sm">
    <div class="card-body">
      <h5 class="card-title">Bestellung #{{ order.id }}</h5>
      <p class="card-text">
        <strong>Status:</strong> {{ order.status }}
      </p>
      <p class="card-text">
        <strong>Gesamt:</strong> {{ order.total | currency }}
      </p>
      <p class="card-text">
        <strong>Erstellt am:</strong> {{ formatDate(order.createdAt) }}
      </p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  order: {
    type: Object,
    required: true,
  },
})

// Optional: Define a currency filter
const currency = (value) => {
  if (typeof value !== 'number') {
    return value
  }
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value)
}

// Optional: Format date
const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('de-DE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
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
