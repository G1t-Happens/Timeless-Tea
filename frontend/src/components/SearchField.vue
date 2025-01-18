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
          :placeholder="placeholder"
        />

        <!-- Filter Button nur anzeigen, wenn showFilter true ist -->
        <button v-if="showFilter" class="btn btn-image" type="button" @click="toggleFilter">
          <img
            src="../../src/assets/icons/filter.webp"
            width="96"
            height="61"
            class="oval-icon-responsive"
            alt="Filter Icon"
          />
        </button>

        <!-- Such-Button -->
        <button class="btn btn-image" type="submit">
          <img
            src="../../src/assets/icons/search.webp"
            width="97"
            height="61"
            class="oval-icon-responsive"
            alt="Search Icon"
          />
        </button>
      </form>
    </div>

    <!-- Filter-Popup nur anzeigen, wenn showFilter true ist -->
    <FilterPopup
      v-if="isFilterVisible && showFilter"
      :filters="filters"
      @close="toggleFilter"
      @applyFilters="applyFilters"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import FilterPopup from './FilterPopup.vue'

// Definiere Props
const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: '',
  },
  showFilter: {
    type: Boolean,
    default: false,
  },
})

// Lokaler Zustand
const searchQuery = ref(props.modelValue)
const isFilterVisible = ref(false)
const filters = ref({
  taste: [],
  effect: [],
  rating: null,
  price: 0,
})

// Emit für das Senden der Suchanfrage
const emit = defineEmits(['update:modelValue', 'search'])

// Handle search mit den übergebenen Filterdaten
const handleSearch = () => {
  const trimmedQuery = searchQuery.value.trim()
  // Emit 'search' Event mit der Suchanfrage und den Filtern
  emit('search', {
    query: trimmedQuery,
    filters: filters.value,
  })
}

// Toggle Filter-Modal
const toggleFilter = () => {
  if (props.showFilter) {
    isFilterVisible.value = !isFilterVisible.value
  }
}

// Empfange Filterdaten, setze sie in den Zustand und suche
const applyFilters = (newFilters) => {
  filters.value = newFilters
  handleSearch()
}
</script>

<style scoped>
/* Stil für das Suchfeld */
.search-input {
  width: 500px;
  border-width: 2px;
  border-radius: 36px;
  border-color: #c06e52;
  border-style: solid;
  padding: 10px;
  font-size: 16px;
}

@media (max-width: 768px) {
  .search-input {
    width: 100%;
  }
}
</style>
