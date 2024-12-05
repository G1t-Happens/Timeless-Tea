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
          <!-- Produktkarten -->
          <ProductCard
            v-for="product in getTopRatedProducts()"
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
import { ref } from 'vue'

// Beispielhafte Produktdaten - Hier normal backend api call
const products = ref([
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

// Methode, um die beliebtesten 6 Produkte zu erhalten
const getTopRatedProducts = () => {
  return products.value.sort((a, b) => b.rating - a.rating).slice(0, 6)
}
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
