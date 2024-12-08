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

const searchQuery = ref('')
const isFilterVisible = ref(false)
const filters = ref({
  taste: [],
  effect: [],
  rating: null,
  price: 50,
  origin: '',
})

const emit = defineEmits(['search'])

const handleSearch = () => {
  const trimmedQuery = searchQuery.value.trim()
  emit('search', trimmedQuery)
}

const toggleFilter = () => {
  isFilterVisible.value = !isFilterVisible.value
}

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
