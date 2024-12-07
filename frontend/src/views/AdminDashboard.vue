<template>
  <div class="admin-dashboard">
    <h2 class="text-center mb-4">Admin Dashboard</h2>

    <!-- Suchfeld für Artikel -->
    <div class="search-section mb-4">
      <SearchField v-model="searchQuery" placeholder="Artikel suchen..." />
    </div>

    <!-- Button zum Hinzufügen eines neuen Artikels -->
    <div class="text-center mt-4 mb-4 w-10">
      <button @click="createNewArticle" class="btn btn-primary">Neuen Artikel erstellen</button>
    </div>

    <!-- Liste der Artikel -->
    <div v-if="loading && products.length === 0" class="text-center">
      <p>Lade Artikel...</p>
    </div>

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
      <div v-if="!hasMore && products.length > 0" class="text-center mt-4">
        <p>Keine weiteren Tees verfügbar.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import SearchField from '@/components/SearchField.vue'
import ProductCard from '@/components/ProductCard.vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const searchQuery = ref('')
const loading = ref(false)
const router = useRouter()
const products = ref([])
const currentPage = ref(1) // Aktuelle Seite
const pageSize = 10 // Anzahl der Artikel pro Seite
const hasMore = ref(true) // Gibt an, ob es mehr Artikel gibt

// Artikel laden (mit Pagination)
const fetchProducts = async () => {
  if (loading.value) return // Mehrfachklick verhindern
  loading.value = true

  try {
    const response = await axios.get('http://localhost:1337/product', {
      params: {
        page: currentPage.value, // Die aktuelle Seite
        size: pageSize, // Anzahl der Artikel pro Seite
      },
    })

    console.log('API Response:', response.data) // Debugging: Zeigt die API-Antwort

    // Prüfen, ob die Antwort die erwarteten Daten enthält
    if (response.data && Array.isArray(response.data.products)) {
      products.value.push(...response.data.products) // Produkte zur Liste hinzufügen
      currentPage.value++ // Nächste Seite vorbereiten
      hasMore.value = response.data.hasMore // Prüfen, ob es weitere Artikel gibt
    } else {
      console.error('Unerwartetes API-Antwortformat:', response.data)
    }
  } catch (error) {
    console.error('Fehler beim Laden der Artikel:', error.message)
  } finally {
    loading.value = false
  }
}

// Erste Daten laden
onMounted(fetchProducts)

// Methode/Routing zum Erstellen eines neuen Artikels
const createNewArticle = () => {
  router.push('/admin/create-article')
}

// Methode/Routing zum Bearbeiten eines Artikels
const editArticle = (article) => {
  router.push(`/admin/edit-article/${article.id}`)
}

// Methode zum Löschen eines Artikels
const deleteArticle = async (id) => {
  try {
    await axios.delete(`http://localhost:1337/product/${id}`)
    // Um reload/neuen Fetch zu sparen einfach splicen im frontend
    const index = products.value.findIndex((article) => article.id === id)
    if (index !== -1) {
      products.value.splice(index, 1)
    }
  } catch (error) {
    console.error('Fehler beim Löschen des Artikels:', error.message)
  }
}

// Mehr Artikel laden
const loadMore = () => {
  fetchProducts()
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
