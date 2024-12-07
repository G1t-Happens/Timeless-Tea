<template>
  <div class="row mt-3">
    <div class="col-12 text-center">
      <form @submit.prevent="handleSearch" class="d-flex justify-content-center">
        <!-- Such-Eingabefeld -->
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

        <!-- Suchen Button -->
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
import { useRouter } from 'vue-router'
import FilterPopup from './FilterPopup.vue'
import axios from 'axios'

const products = ref([])
const searchQuery = ref('')
const isFilterVisible = ref(false)
const filters = ref({
  taste: [],
  effect: [],
  rating: null,
  price: 50,
  origin: '',
})
const router = useRouter()

// Funktion zum Handhaben der Suche
// script setup part of SearchField.vue
// Function to handle search
const handleSearch = async () => {
  if (searchQuery.value.trim()) {
    try {
      // Navigate to the search results page and pass the query parameters
      router.push({ name: 'search-results', query: { query: searchQuery.value } })
      // Fetch products from the backend using Axios
      await fetchProducts()
    } catch (error) {
      console.error('Error while searching:', error)
    }
  }
}

// Function to fetch products using Axios
const fetchProducts = async () => {
  try {
    const response = await axios.get(`/product?search=${encodeURIComponent(searchQuery.value)}`)
    if (response.data) {
      products.value = response.data
    } else {
      products.value = [] // Fallback if no data received
    }
  } catch (error) {
    console.error('Error fetching products:', error)
  }
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
.search-input {
  width: 500px;
  border-width: 2px;
  border-radius: 36px;
  border-color: #c06e52;
  border-style: solid;
}
</style>
