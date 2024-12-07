<template>
  <div class="row mt-3">
    <div class="col-12 text-center">
      <!-- Suchformular -->
      <form @submit.prevent="handleSearch" class="d-flex justify-content-center">
        <!-- Suchfeld -->
        <input
          v-model="searchQuery"
          class="search-input"
          type="search"
          placeholder="Finde deinen Tee..."
          alt="Search Field"
        />

        <!-- Filter Button -->
        <button class="btn btn-image" type="button" @click="toggleFilter">
          <img
            src="../../src/assets/icons/filter.png"
            class="oval-icon-responsive"
            alt="Filter Icon"
          />
        </button>

        <!-- Such-Button -->
        <button class="btn btn-image" type="submit">
          <img
            src="../../src/assets/icons/search.png"
            class="oval-icon-responsive"
            alt="Search Icon"
          />
        </button>
      </form>
    </div>
    <!-- Filter-Popup -->
    <FilterPopup
      v-if="isFilterVisible"
      :filters="filters"
      @close="toggleFilter"
      @applyFilters="applyFilters"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import FilterPopup from './FilterPopup.vue'

// Lokaler Zustand für die Suchanfrage und Filter
const searchQuery = ref('')
const isFilterVisible = ref(false)
const filters = ref({
  taste: [],
  effect: [],
  rating: null,
  price: 50,
  origin: '',
})

// Emit-Event definieren, um die Suchanfrage nach oben zu senden
const emit = defineEmits(['search'])

// Funktion zum Verarbeiten der Suchanfrage
const handleSearch = () => {
  const trimmedQuery = searchQuery.value.trim() // Führende und nachfolgende Leerzeichen entfernen
  emit('search', trimmedQuery) // Emit die abgeschnittene Suchanfrage
}

// Funktion zum Umschalten des Filters
const toggleFilter = () => {
  isFilterVisible.value = !isFilterVisible.value
}

// Funktion zum Anwenden der Filter
const applyFilters = (appliedFilters) => {
  filters.value = appliedFilters
  toggleFilter()
}
</script>

<style scoped>
/* Stil für das Suchfeld */
.search-input {
  width: 500px; /* Einheitliche Breite des Suchfeldes */
  border-width: 2px; /* Dicke des Rahmens */
  border-radius: 36px; /* Abgerundete Ecken */
  border-color: #c06e52; /* Farbcode für den Rand */
  border-style: solid; /* Durchgezogener Rahmen */
  padding: 10px; /* Innenabstand für besseres Styling */
  font-size: 16px; /* Lesbare Schriftgröße */
}

/* Anpassung der Größe bei kleineren Bildschirmen */
@media (max-width: 768px) {
  .search-input {
    width: 100%; /* Passt sich der Breite des Containers an */
  }
}
</style>
