<template>
  <div>
    <!-- Hauptinhalt -->
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
          <!-- Produktkarten max 6 -->
          <ProductCard
            v-for="product in products.slice(0, 6)"
            :key="product.id"
            :product="product"
          />
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import SearchField from '@/components/SearchField.vue'
import MembershipSection from '@/components/MembershipSection.vue'
import ProductCard from '@/components/ProductCard.vue'
import { onMounted, ref } from 'vue'
import axios from 'axios'

// Produkte als reaktive Referenz definieren
const products = ref([]) // Anfangs leer, wird später gefüllt

// Loading-Zustand definieren, falls du ihn brauchst
const loading = ref(false)

// API Call und Datenladen im onMounted Hook
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
</script>

<style scoped>
/* Stil für die gestrichelte Linie */
.dashed-line {
  border: 0;
  border-top: 2px dashed #c06e52; /* Gestreifte Linie */
  width: 100%; /* Dehnt die Linie über die gesamte Breite des Bildschirms */
  margin: 20px 0; /* Abstand nach oben und unten */
}

/* Stil für die Textzentrierung */
.text-center {
  text-align: center;
}
</style>
