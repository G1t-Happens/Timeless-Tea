<template>
  <main class="container my-2">
    <!-- Suchfeld für Artikel -->
    <div class="search-section mb-4">
      <SearchField v-model="searchQuery" @search="fetchProducts" placeholder="Artikel suchen..." />
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
        <button @click="loadMore" class="btn btn-secondary">Mehr Tees</button>
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

// API-Aufruf fuer Produkte mit Pagination
const fetchProducts = async (query = '') => {
  // Reset bei neuer Suchanfrage
  if (query !== searchQuery.value) {
    searchQuery.value = query.trim() // Aktualisiere Suchquery
    currentPage.value = 1 // Erste Seite
    products.value = [] // Leere Produkte
    hasMore.value = true // "Mehr laden" zurücksetzen
  }

  // Ladezustand aktivieren
  loading.value = true
  try {
    // API-Aufruf mit der aktuellen Seite
    const response = await axios.get('/product', {
      params: {
        search: searchQuery.value || undefined,
        page: currentPage.value, // Aktuelle Seite
        size: pageSize, // Anzahl der Produkte pro Seite
      },
    })

    // Ergebnisse verarbeiten
    if (currentPage.value === 1) {
      products.value = response.data.products // Ersetze Produkte
    } else {
      products.value.push(...response.data.products) // Füge weitere Seiten hinzu
    }

    // Aktualisiere hasMore basierend auf der API-Antwort
    hasMore.value = response.data.hasMore
  } catch (error) {
    console.error('Fehler beim Laden der Artikel:', error)
  } finally {
    loading.value = false // Ladezustand beenden
  }
}

// Funktion zum Laden der nächsten Seite
const loadMore = async () => {
  if (hasMore.value) {
    currentPage.value++ // Erhöhe die aktuelle Seite
    await fetchProducts() // Produkte laden
  }
}

// Produkte laden beim Mounten
onMounted(async () => {
  await fetchProducts()
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
