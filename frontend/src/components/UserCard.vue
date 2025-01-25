<template>
  <div class="order-card h-100 mb-1 shadow-sm">
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
.order-card {
  border: 1px solid #e5e5e5;
  border-radius: 12px;
  padding: 20px;
  background-color: #ffffff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
  min-height: 200px; /* Mindesthöhe für die Karte */
}

.order-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}

.card-title {
  font-size: 1.25rem;
  font-weight: bold;
  word-wrap: break-word; /* Ermöglicht Umbrüche in langen Wörtern */
  overflow-wrap: break-word; /* Moderne Eigenschaft für Umbrüche */
  white-space: normal; /* Zeilenumbruch aktivieren */
  overflow: hidden; /* Kein Überlauf aus dem Container */
  text-overflow: ellipsis; /* Optional: Zeigt "..." bei Überlauf */
  display: -webkit-box; /* Für Ellipsen im Mehrzeiligen Text */
  line-clamp: 2; /* Begrenze auf 2 Zeilen */
  -webkit-line-clamp: 2; /* Begrenze auf 2 Zeilen */
  -webkit-box-orient: vertical;
}

.card-text {
  font-size: 1rem;
  word-wrap: break-word; /* Umbrüche in langen Wörtern */
  overflow-wrap: break-word; /* Moderne Umbrüche */
  white-space: normal; /* Zeilenumbruch aktivieren */
  overflow: hidden; /* Kein Überlauf aus dem Container */
}
</style>
