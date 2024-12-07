<template>
  <div>
    <main class="container my-2">
      <!-- Suchfeld Komponente -->
      <SearchField />

      <!-- Trennlinie -->
      <hr class="dashed-line" />

      <!-- Mitgliedssektion -->
      <MembershipSection />

      <!-- Trennlinie -->
      <hr class="dashed-line" />

      <!-- Sektion für beliebteste Teesorten -->
      <section class="products-section">
        <h2 class="text-center headline-title mb-4">Unsere beliebtesten Teesorten</h2>
        <div class="row">
          <!-- Produktkarten mit den 6 besten Produkten anhand der Bewertung -->
          <ProductCard v-for="product in topProducts" :key="product.id" :product="product" />
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import SearchField from '@/components/SearchField.vue'
import MembershipSection from '@/components/MembershipSection.vue'
import ProductCard from '@/components/ProductCard.vue'
import { onMounted, ref, computed } from 'vue'
import axios from 'axios'

const products = ref([])
const loading = ref(false)

// Funktion zum Laden der Produkte von der API
const fetchProducts = () => {
  loading.value = true
  axios
    .get('/product')
    .then((response) => {
      products.value = response.data.products
    })
    .catch((error) => {
      console.error('Fehler beim Laden der Artikel:', error)
    })
    .finally(() => {
      loading.value = false
    })
}

onMounted(fetchProducts)

// Berechnete Eigenschaft für die Top 6 Produkte basierend auf 'averageRating'
const topProducts = computed(() => {
  return products.value
    .slice()
    .sort((a, b) => b.averageRating - a.averageRating) // Sortieren nach 'averageRating' absteigend
    .slice(0, 6)
})
</script>

<style scoped>
.container {
  max-width: 960px;
  margin: auto;
}

.dashed-line {
  border-top: 2px dashed #c06e52;
  margin: 20px 0;
}

.products-section {
  margin-top: 20px;
}

.text-center {
  text-align: center;
}

.row {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
}

.headline-title {
  margin-bottom: 20px;
}
</style>
