<template>
  <div class="search-results-page">
    <h2 class="text-center mb-4">Suchergebnisse für: "{{ searchQuery }}"</h2>

    <!-- Suchfeld -->
    <div class="search-field mb-4">
      <SearchField :initialQuery="searchQuery" @search="handleSearch" />
    </div>

    <!-- Ladeanzeige -->
    <div v-if="loading" class="text-center">
      <p>Lade Produkte...</p>
    </div>

    <!-- Keine Produkte gefunden -->
    <div v-if="!loading && filteredProducts.length === 0" class="text-center">
      <p>Keine Produkte gefunden</p>
    </div>

    <!-- Gefilterte Produkte anzeigen -->
    <div v-else>
      <div class="row">
        <ProductCard v-for="product in filteredProducts" :key="product.id" :product="product" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ProductCard from '@/components/ProductCard.vue'
import SearchField from '@/components/SearchField.vue'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const searchQuery = ref(route.query.query || '')
const products = ref([])

// Computed Property für gefilterte Produkte
const filteredProducts = computed(() => {
  if (!searchQuery.value) return products.value
  return products.value.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.value.toLowerCase()),
  )
})

// Laden der Produkte anhand des searchQuery aus der URI
const fetchProducts = async () => {
  loading.value = true
  try {
    const response = await axios.get(`/product?search=${encodeURIComponent(searchQuery.value)}`)
    products.value = response.data || []
    loading.value = false
  } catch (error) {
    loading.value = false
    console.error('Error fetching products:', error)
  }
}

onMounted(fetchProducts)

// Reagiere auf Änderungen im Suchbegriff (Query-Parameter)
watch(
  () => route.query.query,
  (newQuery) => {
    searchQuery.value = newQuery || '' // Setze den Suchbegriff neu, wenn sich der URL-Query-Parameter ändert
    loading.value = true // Ladeanzeige zeigen, bis neue Produkte gefiltert werden
    fetchProducts() // Produkte nach neuem Suchbegriff filtern
  },
)

// Handelt die Suche, wenn der Benutzer im Suchfeld eine neue Suche ausführt
const handleSearch = (query) => {
  // Navigiere zu einer neuen URL mit dem neuen Suchbegriff
  router.push({ path: '/search', query: { query } })
}
</script>

<style scoped>
.search-results-page {
  background-color: #f9f8f1;
}

.text-center {
  text-align: center;
}

.row {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  gap: 20px;
}

p {
  font-size: 1.2rem;
  color: #333;
}

h2 {
  font-size: 1.8rem;
  color: #4a5043;
}

button {
  border-radius: 8px;
}

@media (max-width: 768px) {
  h2 {
    font-size: 1.5rem;
  }
}
</style>
