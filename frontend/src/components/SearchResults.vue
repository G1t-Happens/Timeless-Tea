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

// Beispielhafte Produktdaten
const products = ref([
  {
    id: 1,
    name: 'Schwarzer Tee - Earl Grey',
    image: '../../src/assets/images/blackTea.jpg',
    price: 12.3,
    description:
      'Aus den besten Teegärten Asiens: aromatisch, voller Koffein. Fördert Konzentration, Energie und sorgt für wohltuende Genussmomente.',
    rating: 2,
    reviews: 325,
  },
  {
    id: 2,
    name: 'Grüner Tee - Sencha',
    image: '../../src/assets/images/greenTea.jpg',
    price: 10.5,
    description:
      'Direkt aus den besten Teegärten Asiens! Reich an Antioxidantien, unterstützt er Wohlbefinden und innere Balance.',
    rating: 3,
    reviews: 198,
  },
  {
    id: 3,
    name: 'Kräutertee',
    image: '../../src/assets/images/herbalTea.jpg',
    price: 8.9,
    description:
      'Beruhigend wie eine warme Umarmung, ob mit Kamille, Pfefferminze oder Ingwer – perfekt für eine entspannte Auszeit.',
    rating: 2,
    reviews: 89,
  },
])

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const searchQuery = ref(route.query.query || '')

// Computed Property für gefilterte Produkte
const filteredProducts = computed(() => {
  if (!searchQuery.value) return products.value
  return products.value.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.value.toLowerCase()),
  )
})

// Funktion zum Simulieren des Ladens von Produkten
const fetchProducts = () => {
  setTimeout(() => {
    loading.value = false
  }, 1000) // Simuliere eine Ladezeit von 1 Sekunde
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
  gap: 20px; /* Abstand zwischen den Produktkarten */
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
