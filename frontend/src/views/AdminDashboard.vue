<template>
  <div class="admin-dashboard">
    <h2 class="text-center mb-4">Admin Dashboard</h2>

    <!-- Suchfeld für Artikel -->
    <div class="search-section mb-4">
      <SearchField v-model="searchQuery" @search="fetchProducts" placeholder="Artikel suchen..." />
    </div>

    <!-- Button zum Hinzufügen eines neuen Artikels -->
    <div class="text-center mt-4 mb-4">
      <button @click="createNewArticle" class="btn btn-primary" style="width: 100%">
        Neuen Artikel erstellen
      </button>
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
      <div class="row row-cols-lg-4">
        <!-- Produktkarten -->
        <div v-for="product in products" :key="product.id" class="col mb-4">
          <div>
            <ProductCard :product="product" />
          </div>

          <!-- Buttons für Bearbeiten und Löschen -->
          <div class="text-center mb-5 cardset-admin-button">
            <button @click="editArticle(product)" class="btn btn-warning btn-sm">Bearbeiten</button>
            <button @click="deleteArticle(product.id)" class="btn btn-danger btn-sm">
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
const localFilters = ref({ categories: [], price: 0, rating: 0, page: 1, size: 8 })
const loading = ref(false)
const currentPage = ref(1)
const pageSize = 8
const hasMore = ref(true)
const router = useRouter()

// API-Aufruf für Produkte mit Pagination und Filtern
const fetchProducts = async ({ query, filters }) => {
  // Reset bei neuer Suchanfrage
  if (query !== searchQuery.value) {
    searchQuery.value = query.trim()
    currentPage.value = 1
    products.value = []
    hasMore.value = true
  }

  // Überprüfen, ob sich die Filter geändert haben und falls ja changen
  if (filters && JSON.stringify(filters) !== JSON.stringify(localFilters.value)) {
    localFilters.value = { ...filters } // Filter aktualisieren
    currentPage.value = 1 // Seite zurücksetzen, wenn die Filter geändert wurden
  }

  // Ladezustand aktivieren
  loading.value = true

  // Kategorien als kommagetrennte Liste formatieren
  const categoriesParam = filters.categories ? filters.categories.join(',') : undefined

  try {
    const response = await axios.get('/product', {
      params: {
        search: query || undefined,
        categories: categoriesParam || undefined,
        price: filters.price || undefined,
        rating: filters.rating || undefined,
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
  await fetchProducts({ query: '', filters: localFilters.value })
})

// "Mehr laden"-Funktion
const loadMore = async () => {
  if (hasMore.value) {
    currentPage.value++
    await fetchProducts({ query: searchQuery.value, filters: localFilters.value })
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
      // Entferne das gelöschte Produkt aus der Liste(Frontend) nach dem API - Call
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

.cardset-admin-button {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.text-center button {
  display: inline-block;
  width: auto;
}

/* Buttons und Karten zentrieren */
.row {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

/* Stil für den Button */
.btn-primary {
  background-color: #c06e52; /* Orangefarbener Hintergrund */
  border-color: #c06e52; /* Orangefarbener Rand */
  border-radius: 8px; /* Abgerundete Ecken */
}

/* Stil für den Hover-Zustand */
.btn-primary:hover {
  background-color: #a35a44; /* Dunkleres Orange beim Hover */
  border-color: #a35a44; /* Dunklerer Rand beim Hover */
}

/* Stil für den Active- (Klick-) Zustand */
.btn-primary:active {
  background-color: #8f4c37; /* Noch dunkleres Orange bei Klick */
  border-color: #8f4c37; /* Noch dunklerer Rand bei Klick */
}

/* Optional: Stil für den Fokus-Zustand (wenn der Button fokussiert wird) */
.btn-primary:focus {
  box-shadow: 0 0 0 0.2rem rgba(192, 110, 82, 0.5); /* Ein sanfter Schatten beim Fokussieren */
}
</style>
