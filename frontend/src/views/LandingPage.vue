<template>
  <main class="container my-2">
    <!-- Suchfeld für Artikel -->
    <div class="search-section mb-4">
      <SearchField
        v-model="searchQuery"
        @search="fetchProducts"
        placeholder="Artikel suchen..."
        :showFilter="true"
      />
    </div>

    <!-- Trennlinie -->
    <hr class="dashed-line" />

    <!-- Mitgliedssektion -->
    <MembershipSection />

    <!-- Trennlinie -->
    <hr class="dashed-line" />

    <!-- Sektion für beliebteste Teesorten -->
    <section class="products-section">
      <h2 class="text-center headline-title mb-4">Unsere beliebtesten Teesorten</h2>

      <!-- Ladezustand oder keine Produkte -->
      <div v-if="loading && products.length === 0" class="text-center">
        <p>Lade Artikel...</p>
      </div>
      <div v-if="!loading && products.length === 0" class="text-center">
        <p>Keine Produkte gefunden.</p>
      </div>

      <!-- Karten Container -->
      <div class="row row-cols-lg-3">
        <!-- Produktkarten mit den Ergebnissen -->
        <div v-for="product in products" :key="product.id" class="col mb-4">
          <ProductCard :product="product" />
        </div>
      </div>

      <!-- Mehr Tees Button -->
      <div v-if="hasMore && !loading" class="text-center mt-4">
        <button @click="loadMore" class="btn btn-success">Mehr Tees</button>
      </div>
      <!-- Keine weiteren Produkte -->
      <div v-if="!hasMore && products.length > 0" class="text-center mt-4">
        <p>Keine weiteren Tees verfügbar.</p>
      </div>
    </section>
  </main>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import SearchField from '@/components/SearchField.vue'
import ProductCard from '@/components/ProductCard.vue'
import axios from 'axios'
import MembershipSection from '@/components/MembershipSection.vue'

// Reaktive Variablen
const products = ref([])
const searchQuery = ref('')
const loading = ref(false)
const pageSize = 3
const currentPage = ref(1)
const hasMore = ref(true)
const localFilters = ref({ categories: [], price: 0, rating: 0, page: 1, size: 8 })

// API-Aufruf für Produkte mit Pagination und Filtern
const fetchProducts = async ({ query = '', filters = localFilters.value }) => {
  // Reset bei neuer Suchanfrage
  if (query !== searchQuery.value) {
    searchQuery.value = query.trim() // Such-Query aktualisieren
    currentPage.value = 1 // Zurück zur ersten Seite
    products.value = [] // Produkte leeren
    hasMore.value = true // "Mehr laden" zurücksetzen
  }

  // Überprüfen, ob sich die Filter geändert haben und falls ja changen
  if (filters && JSON.stringify(filters) !== JSON.stringify(localFilters.value)) {
    localFilters.value = { ...filters } // Filter aktualisieren
    currentPage.value = 1 // Seite zurücksetzen, wenn die Filter geändert wurden
  }

  // Ladezustand aktivieren
  loading.value = true

  // Kategorien als kommagetrennte Liste formatieren fuer backend call
  // Bsp: http://localhost:1337/product?categories=1,2,5&page=1&size=3
  const categoriesParam =
    filters.categories && filters.categories.length > 0 ? filters.categories.join(',') : undefined

  // Pruefen ob price !=0 ansonsten undefiend
  const priceParam = ((p) => (p && p !== 0 ? p : undefined))(parseFloat(filters.price))

  try {
    const response = await axios.get('/api/product', {
      params: {
        search: query || undefined,
        categories: categoriesParam,
        price: priceParam,
        rating: filters.rating || undefined,
        page: currentPage.value, // Aktuelle Seite
        size: pageSize, // Anzahl der Produkte pro Seite
      },
    })

    // Ergebnisse verarbeiten
    if (currentPage.value === 1) {
      products.value = response.data.products // Produkte für Seite 1
    } else {
      products.value.push(...response.data.products) // Weitere Produkte hinzufügen
    }

    // "Mehr laden" aktualisieren
    hasMore.value = response.data.hasMore
  } catch (error) {
    console.error('Fehler beim Laden der Artikel:', error)
  } finally {
    loading.value = false
  }
}

// Funktion zum Laden der nächsten Seite
const loadMore = async () => {
  if (hasMore.value) {
    currentPage.value++ // Seite erhöhen
    await fetchProducts({ query: searchQuery.value, filters: localFilters.value }) // Produkte nachladen
  }
}

// Produkte beim Mounten laden
onMounted(() => {
  fetchProducts({ query: '', filters: localFilters.value }) // Initiales Laden
})
</script>

<style scoped>
/* Stil für die gestrichelte Linie */
.dashed-line {
  border: 0;
  border-top: 2px dashed #c06e52; /* Gestreifte Linie */
  width: 100%; /* Dehnt die Linie über die gesamte Breite des Bildschirms */
  margin: 20px 0; /* Abstand nach oben und unten */
}

/* Zentrale Ausrichtung des Buttons */
.text-center button {
  display: inline-block;
  width: auto;
}

/* Flexbox und Bootstrap Grid für Produktkarten */
.row {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between; /* Karten gleichmäßig verteilen */
}
</style>
