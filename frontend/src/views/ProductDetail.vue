<template>
  <div class="product-detail">
    <!-- Verwende die BackButton-Komponente -->
    <div class="back-button-wrapper">
      <BackButton class="back-button" />
    </div>

    <div v-if="loading" class="loading">Lade Produktdetails...</div>
    <div v-else class="product-container">
      <!-- Bildbereich -->
      <div class="image-section" @click="openImageModal">
        <img :src="product.image" :alt="product.name" class="product-image" />
      </div>

      <!-- Info-Panel -->
      <div class="info-card">
        <h2>{{ product.name }}</h2>
        <p v-if="product.id" class="product-id">Artikelnummer: {{ product.id }}</p>
        <div v-if="product.productCategories" class="categories">
          <span v-for="category in product.productCategories" :key="category.id" class="badge">
            {{ category.name }}
          </span>
        </div>
        <div v-if="product.averageRating" class="rating">
          <span v-for="n in fullStars" :key="'full-' + n">⭐</span>
          <span v-for="n in emptyStars" :key="'empty-' + n">☆</span>
          <small>({{ product.reviews }} Bewertungen)</small>
        </div>
        <p v-if="product.price" class="price">Preis: {{ product.price }}€</p>
        <p v-if="product.description">{{ product.description }}</p>
        <div class="actions">
          <label for="quantity-input" class="quantity-label">Menge in Gramm (g):</label>
          <input
            id="quantity-input"
            type="number"
            v-model="quantity"
            min="50"
            step="50"
            class="quantity-input"
            placeholder="Menge (g)"
          />
          <!-- Warenkorb Button mit Icon -->
          <button @click="addToCart" class="btn">
            <i class="bi bi-cart-fill"></i> In den Warenkorb
          </button>
        </div>
        <!-- Wunschzettel Button mit Herz-Icon -->
        <button class="btn secondary"><i class="bi bi-heart-fill"></i> Auf den Wunschzettel</button>
      </div>
    </div>

    <!-- Allgemeine Infos Panel -->
    <ArticleInfoPanel />

    <!-- Modal für Vollbildbild -->
    <div v-if="showImageModal" class="image-modal" @click="closeImageModal">
      <img :src="product.image" :alt="product.name" class="modal-image" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import ArticleInfoPanel from '@/components/ArticleInfoPanel.vue'
import BackButton from '@/components/navigation/BackButton.vue'

const router = useRouter()
const route = useRoute()
const product = ref(null)
const loading = ref(true)
const quantity = ref(50)
const showImageModal = ref(false) // Zustand für das Modal

const productId = route.params.id

const fullStars = computed(() => Math.floor(product.value?.averageRating || 0))
const emptyStars = computed(() => 5 - fullStars.value)

const fetchProduct = async () => {
  try {
    const { data } = await axios.get(`/product/${productId}`)
    product.value = data
  } catch {
    alert('Produktdetails konnten nicht geladen werden.')
    await router.push('/')
  } finally {
    loading.value = false
  }
}

const addToCart = () => {
  if (quantity.value < 50 || quantity.value % 50 !== 0) {
    alert('Bitte gültige Menge (50g Schritte) eingeben.')
    return
  }
  alert(`${quantity.value}g ${product.value.name} in den Warenkorb gelegt.`)
}

// Öffnen und Schließen des Modals
const openImageModal = () => {
  showImageModal.value = true
}

const closeImageModal = () => {
  showImageModal.value = false
}

onMounted(fetchProduct)
</script>

<style scoped>
.product-detail {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

/* Wrapper für den BackButton */
.back-button-wrapper {
  display: flex;
  justify-content: flex-start; /* BackButton nach links ausrichten */
  margin-bottom: 5px;
  width: 100%; /* Breite des Containers */
  box-sizing: border-box; /* Padding einbeziehen */
}

/* Style für den Button */
.back-button {
  max-width: 150px; /* Begrenze die Breite */
  text-align: left;
}

.product-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  max-width: 1200px; /* Feste maximale Breite */
  width: 100%;
  gap: 20px;
  flex-wrap: nowrap;
  transition: all 0.3s ease-in-out;
}

.image-section {
  flex: 1;
  display: flex;
  justify-content: center;
  cursor: pointer;
}

.product-image {
  width: 600px; /* Feste Breite bei größeren Viewports */
  height: 400px; /* Feste Höhe bei größeren Viewports */
  max-width: 100%; /* Skaliert bei kleineren Viewports */
  object-fit: cover;
  border-radius: 10px;
  transition:
    transform 0.3s ease-in-out,
    width 0.3s ease-in-out,
    height 0.3s ease-in-out;
}

.product-image:hover {
  transform: scale(1.05);
}

.info-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  transition:
    flex 0.3s ease-in-out,
    padding 0.3s ease-in-out;
}

/* Modal für das Bild */
.image-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  cursor: pointer;
}

.modal-image {
  max-width: 90%;
  max-height: 90%;
  border-radius: 10px;
}

/* Kategorien */
.categories {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.badge {
  background: #9fa86d;
  color: #fff;
  padding: 5px 10px;
  border-radius: 10px;
  font-size: 14px;
}

/* Sternebewertung */
.rating {
  display: flex;
  align-items: center;
  gap: 5px;
}

.price {
  font-weight: bold;
  font-size: 18px;
  color: #c06e52;
}

/* Aktionen */
.actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.quantity-label {
  font-weight: bold;
  margin-bottom: 5px;
}

.quantity-input {
  width: 100%;
  padding: 8px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 8px;
  text-align: center;
}

.btn {
  padding: 10px 15px;
  font-size: 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  background: #c06e52;
  color: #fff;
}

.btn.secondary {
  background: #9fa86d;
}

/* Responsive Anpassungen */
@media (max-width: 768px) {
  .product-container {
    flex-direction: column;
    align-items: center;
  }

  .image-section,
  .info-card {
    flex: 1 1 100%;
  }

  .product-image {
    width: 100%; /* Passt sich dynamisch der Breite des Containers an */
    height: auto; /* Beibehaltung des Seitenverhältnisses */
  }
}
</style>
