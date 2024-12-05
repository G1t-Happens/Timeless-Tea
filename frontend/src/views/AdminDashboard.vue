<template>
  <div class="admin-dashboard">
    <h2 class="text-center mb-4">Admin Dashboard</h2>

    <!-- Suchfeld für Artikel -->
    <div class="search-section mb-4">
      <SearchField v-model="searchQuery" placeholder="Artikel suchen..." />
    </div>

    <!-- Liste der Artikel -->
    <div v-if="loading" class="text-center">
      <p>Lade Artikel...</p>
    </div>

    <div v-else>
      <div class="row">
        <!-- Produktkarten -->
        <div v-for="product in filteredArticles" :key="product.id" class="col-12 col-md-4 mb-4">
          <!-- Produktkarte auf maximale Breite setzen -->
          <div class="product-card-container" style="width: 100%">
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
    </div>

    <!-- Button zum Hinzufügen eines neuen Artikels -->
    <div class="text-center mt-4">
      <button @click="createNewArticle" class="btn btn-primary">Neuen Artikel erstellen</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import SearchField from '@/components/SearchField.vue'
import ProductCard from '@/components/ProductCard.vue'
import { useRouter } from 'vue-router'

const searchQuery = ref('')
const loading = ref(false)
const router = useRouter()

// Simulierte Artikel-Daten (In der Praxis durch API-Aufruf ersetzen)
const articles = ref([
  {
    id: 1,
    name: 'Schwarzer Tee - Earl Grey',
    image: '../../src/assets/images/blackTea.jpg',
    price: 12.3,
    description:
      'Aus den besten Teegärten Asiens: aromatisch, voller Koffein. Fördert Konzentration, Energie und sorgt für wohltuende Genussmomente.',
    rating: 2,
    reviews: 300,
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
    rating: 5,
    reviews: 89,
  },
])

// onMounted(() => {
//   loading.value = true
//     .get('/articles')
//     .then((response) => {
//       articles.value = response.data
//     })
//     .catch((error) => {
//       console.error('Fehler beim Laden der Artikel:', error)
//     })
//     .finally(() => {
//       loading.value = false
//     })
// })

// Gefilterte Artikel basierend auf der Suchanfrage
const filteredArticles = computed(() => {
  if (!searchQuery.value) return articles.value
  return articles.value.filter((article) =>
    article.name.toLowerCase().includes(searchQuery.value.toLowerCase()),
  )
})

// Methode zum Erstellen eines neuen Artikels
const createNewArticle = () => {
  router.push('/admin/create-article')
}

// Methode zum Bearbeiten eines Artikels
const editArticle = (article) => {
  router.push(`/admin/edit-article/${article.id}`)
}

// Methode zum Löschen eines Artikels
const deleteArticle = (id) => {
  const index = articles.value.findIndex((article) => article.id === id)
  if (index !== -1) {
    articles.value.splice(index, 1)
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
</style>
