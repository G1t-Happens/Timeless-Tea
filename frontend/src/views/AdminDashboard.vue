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
    <div v-if="loading" class="text-center">
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

// Simulierte Artikel-Daten (In der Praxis durch API-Aufruf ersetzen)
const products = ref([])

onMounted(() => {
  loading.value = true
  axios
    .get('/product') // API Call (Beispiel: '/product' ist der Endpoint)
    .then((response) => {
      products.value = response.data // Daten in products speichern
    })
    .catch((error) => {
      console.error('Fehler beim Laden der Artikel:', error)
    })
    .finally(() => {
      loading.value = false
    })
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
const deleteArticle = async (id) => {
  try {
    await axios.delete(`/product/${id}`)
    //Avoid reload => Just slice it
    const index = products.value.findIndex((article) => article.id === id)
    if (index !== -1) {
      products.value.splice(index, 1)
    }
  } catch (error) {
    console.error('Fehler beim Laden des Artikels:', error)
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
