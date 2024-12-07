<template>
  <div class="admin-dashboard">
    <h2 class="text-center mb-4">Admin Dashboard</h2>

    <!-- Suchfeld für Artikel -->
    <div class="search-section mb-4">
      <SearchField v-model="searchQuery" @search="fetchProducts" placeholder="Artikel suchen..." />
    </div>

    <!-- Button zum Hinzufügen eines neuen Artikels -->
    <div class="text-center mt-4 mb-4 w-10">
      <button @click="createNewArticle" class="btn btn-primary">Neuen Artikel erstellen</button>
    </div>

    <!-- Ladezustand oder keine Produkte -->
    <div v-if="loading && products.length === 0" class="text-center">
      <p>Lade Artikel...</p>
    </div>
    <div v-if="!loading && products.length === 0" class="text-center">
      <p>Keine Produkte gefunden.</p>
    </div>

    <!-- Liste der Artikel -->
    <div v-else>
      <div class="row">
        <!-- Produktkarten -->
        <div v-for="product in products" :key="product.id" class="col-12 col-md-4 mb-4">
          <!-- Produktkarte auf maximale Breite setzen -->
          <div class="product-card-container">
            <ProductCard :product="product" />
          </div>

          <!-- Buttons für Bearbeiten und Löschen -->
          <div class="text-center mt-2">
            <button @click="editArticle(product)" class="btn btn-warning btn-sm">Bearbeiten</button>
            <button @click="deleteArticle(product.id)" class="btn btn-danger btn-sm ml-2">
              Löschen
            </button>
          </div>
        </div>
      </div>
      <!-- Mehr Tees Button -->
      <div v-if="hasMore && !loading" class="text-center mt-4">
        <button @click="loadMore" class="btn btn-secondary">Mehr Tees</button>
      </div>
      <!-- Ansonsten keine weiteren Produkte -->
      <div v-if="!hasMore && products.length > 0" class="text-center mt-4">
        <p>Keine weiteren Tees verfügbar.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import SearchField from '@/components/SearchField.vue'
import ProductCard from '@/components/ProductCard.vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

// Reaktive Variablen
const products = ref([])
const searchQuery = ref('')
const loading = ref(false)
const currentPage = ref(1)
const pageSize = 9
const hasMore = ref(true)
const router = useRouter()

// API-Aufruf für Produkte
const fetchProducts = async (query = '') => {
  // Reset bei neuer Suchanfrage
  if (query !== searchQuery.value) {
    searchQuery.value = query.trim()
    currentPage.value = 1 // Zurück zur ersten Seite
    products.value = [] // Vorherige Ergebnisse leeren
    hasMore.value = true // Button zurücksetzen
  }

  // Ladezustand aktivieren
  loading.value = true
  try {
    const response = await axios.get('/product', {
      params: {
        search: searchQuery.value || undefined,
        page: currentPage.value,
        size: pageSize,
      },
    })

    // Ergebnisse verarbeiten
    if (currentPage.value === 1) {
      products.value = response.data.products
    } else {
      products.value.push(...response.data.products)
    }

    hasMore.value = response.data.hasMore
  } catch (error) {
    console.error('Fehler beim Laden der Artikel:', error)
  } finally {
    loading.value = false
  }
}

// Produkte laden beim Mounten
onMounted(async () => {
  await fetchProducts()
})

// "Mehr laden"-Funktion
const loadMore = async () => {
  if (hasMore.value) {
    currentPage.value++
    await fetchProducts()
  }
}

// Artikel erstellen
const createNewArticle = () => {
  router.push('/admin/create-article')
}

// Artikel bearbeiten
const editArticle = (article) => {
  router.push(`/admin/edit-article/${article.id}`)
}

// Artikel löschen
const deleteArticle = async (id) => {
  try {
    await axios.delete(`/product/${id}`)
    const index = products.value.findIndex((article) => article.id === id)
    if (index !== -1) {
      // Entferne das gelöschte Produkt aus der Liste
      products.value.splice(index, 1)
    }
  } catch (error) {
    console.error('Fehler beim Löschen des Artikels:', error)
  }
}
</script>

<style scoped>
.admin-dashboard {
  padding: 20px;
}

.text-center button {
  display: inline-block;
  width: auto;
}

.product-card-container {
  width: 100%;
  display: flex;
  justify-content: center;
}

.btn-primary {
  background-color: #c06e52;
  border-color: #c06e52;
  border-radius: 8px;
}
</style>
