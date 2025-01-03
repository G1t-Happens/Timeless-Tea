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
            <button @click="editArticle(product)" class="btn btn-warning">Bearbeiten</button>
            <button @click="deleteArticle(product.id)" class="btn btn-danger">Löschen</button>
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

  // Kategorien als kommagetrennte Liste formatieren fuer backend call
  // Bsp: http://localhost:1337/product?categories=1,2,5&page=1&size=3
  const categoriesParam =
    filters.categories && filters.categories.length > 0 ? filters.categories.join(',') : undefined

  // Pruefen ob price !=0 ansonsten undefiend
  const priceParam = ((p) => (p && p !== 0 ? p : undefined))(parseFloat(filters.price))

  try {
    const response = await axios.get('/product', {
      params: {
        search: query || undefined,
        categories: categoriesParam,
        price: priceParam,
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

    // "Mehr laden" aktualisieren
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

  const confirmed = window.confirm("Möchten Sie diesen Artikel wirklich löschen?");
  if (!confirmed) {
    return;
  }

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
  display: flex; /* Buttons nebeneinander anordnen */
  gap: 2px; /* Abstand zwischen den Buttons */
  position: relative; /* Buttons bleiben in ihrem Bereich */
  top: -20px; /* Buttons nach oben verschieben */
  z-index: 1; /* Sicherstellen, dass die Buttons anklickbar bleiben */
}

.cardset-admin-button button {
  flex: 1; /* Jeder Button nimmt gleichmäßig Platz ein */
  padding: 10px 20px; /* Einheitliche Polsterung */
  font-size: 14px; /* Einheitliche Schriftgröße */
  border: none;
  border-radius: 8px; /* Abgerundete Kanten */
  transition: all 0.3s ease; /* Sanfter Übergang bei Hover- und Active-Zuständen */
  text-align: center; /* Text im Button zentrieren */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1)
}

/* Bearbeiten-Button */
.cardset-admin-button .btn-warning {
  background-color: #4a5043; /* Gelbe Farbe */
  color: #fff; /* Weißer Text */
}

.cardset-admin-button .btn-warning:hover {
  background-color: #9fa86d; /* Dunkleres Gelb beim Hover */
}

/* Löschen-Button */
.cardset-admin-button .btn-danger {
  background-color: #C06E52; /* Rote Farbe */
  color: #fff; /* Weißer Text */
}

.cardset-admin-button .btn-danger:hover {
  background-color: #c0392b; /* Dunkleres Rot beim Hover */
}

.cardset-admin-button button:active {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2); /* Schatten verringern bei Klick */
  transform: translateY(2px); /* Leichte Bewegung nach unten */
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
