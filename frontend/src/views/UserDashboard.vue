<template>
  <div class="user-dashboard">
    <div class="header">
      <h2 class="text-center user-title">User Dashboard</h2>
    </div>

    <!-- Navigation Buttons -->
    <div class="navigation mb-4">
      <button @click="navigateToOrders" class="btn navigation-btn">Meine Bestellungen</button>
      <button @click="navigateToFavorites" class="btn navigation-btn">Meine Favoriten</button>
    </div>

    <!-- Suchfeld für Artikel -->
    <div class="search-section mb-4">
      <SearchField
        v-model="searchQuery"
        @search="fetchArticles"
        placeholder="Artikel suchen..."
        :showFilter="true"
      />
    </div>

    <!-- Ladezustand oder keine Produkte -->
    <div v-if="loading.articles && articles.length === 0" class="text-center">
      <p>Lade Artikel...</p>
    </div>
    <div v-if="!loading.articles && articles.length === 0" class="text-center">
      <p>Keine Produkte gefunden.</p>
    </div>

    <!-- Liste der Artikel -->
    <div v-else>
      <div class="row row-cols-lg-4">
        <!-- Produktkarten -->
        <div v-for="product in articles" :key="product.id" class="col mb-4">
          <ProductCard :product="product" />
        </div>
      </div>
      <!-- Mehr Tees Button -->
      <div v-if="hasMore.articles && !loading.articles" class="text-center mt-4">
        <button @click="loadMoreArticles" class="btn btn-secondary">Mehr Tees</button>
      </div>
      <!-- Keine weiteren Produkte -->
      <div v-if="!hasMore.articles && articles.length > 0" class="text-center mt-4">
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

const router = useRouter()

// Navigation zu Bestellungen
const navigateToOrders = () => {
  router.push('/user/order')
}

// Navigation zu Favoriten
const navigateToFavorites = () => {
  router.push('/user/favorite')
}

// Artikel-Daten
const articles = ref([])
const searchQuery = ref('')
const loading = ref({ articles: false })
const localArticleFilters = ref({ categories: [], price: 0, rating: 0, page: 1, size: 8 })
const currentArticlePage = ref(1)
const pageSize = 8
const hasMore = ref({ articles: true })

// Artikel laden
const fetchArticles = async ({
  query = searchQuery.value,
  filters = localArticleFilters.value,
} = {}) => {
  if (query !== searchQuery.value) {
    searchQuery.value = query.trim()
    currentArticlePage.value = 1
    articles.value = []
    hasMore.value.articles = true
  }

  if (filters && JSON.stringify(filters) !== JSON.stringify(localArticleFilters.value)) {
    localArticleFilters.value = { ...filters }
    currentArticlePage.value = 1
  }

  loading.value.articles = true

  const categoriesParam =
    filters.categories && filters.categories.length > 0 ? filters.categories.join(',') : undefined
  const priceParam = filters.price && filters.price !== 0 ? filters.price : undefined

  try {
    const response = await axios.get('/product', {
      params: {
        search: query || undefined,
        categories: categoriesParam,
        price: priceParam,
        rating: filters.rating || undefined,
        page: currentArticlePage.value,
        size: pageSize,
      },
    })

    if (currentArticlePage.value === 1) {
      articles.value = response.data.products
    } else {
      articles.value.push(...response.data.products)
    }

    hasMore.value.articles = response.data.hasMore
  } catch (error) {
    console.error('Fehler beim Laden der Artikel:', error)
    alert('Fehler beim Laden der Artikel.')
  } finally {
    loading.value.articles = false
  }
}

// Mehr Artikel laden
const loadMoreArticles = async () => {
  if (hasMore.value.articles) {
    currentArticlePage.value++
    await fetchArticles({ query: searchQuery.value, filters: localArticleFilters.value })
  }
}

// Initiales Laden der Artikel
onMounted(() => {
  fetchArticles()
})
</script>

<style scoped>
.user-title {
  font-size: 2.5rem;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 2px;
  text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  margin-top: 20px;
}

/* Navigation Buttons */
.navigation {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
  padding-bottom: 50px;
}

.navigation-btn {
  font-size: 1.2rem;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: 12px 25px;
  border-radius: 10px;
  border: transparent;
  background: linear-gradient(135deg, #d4b483, #c06e52);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  color: #f1e2c5;
  text-align: center;
}

.navigation-btn:hover {
  background: linear-gradient(135deg, #c06e52, #d4b483);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
  transform: translateY(-3px);
  color: white;
}

.navigation-btn:active {
  transform: translateY(1px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  color: white;
}

.row {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

.text-center button {
  display: inline-block;
  width: auto;
}

.btn-secondary {
  background-color: #6c757d; /* Einheitlich Grau */
  color: white;
  border: none;
  padding: 10px 20px;
  margin-bottom: 15px;
  border-radius: 8px;
  transition: background-color 0.3s ease;
}

.btn-secondary:hover {
  background-color: #8f4c37;
}

.btn-secondary:active {
  background-color: #d4b483;
}
</style>
