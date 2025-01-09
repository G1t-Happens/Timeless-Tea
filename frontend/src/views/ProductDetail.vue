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
        <p v-if="product.price" class="price">
          Preis: {{ formattedPrice }}€ - {{ product.quantity }}g
        </p>
        <!-- Zusätzliche Preisangaben -->
        <p class="point-out-info">Preis inkl. 7% MwSt. zzgl. Versand</p>
        <p class="content-info">Inhalt: {{ product.quantity }}g ({{ pricePerKg }}€ / kg)</p>
        <p v-if="product.description">{{ product.description }}</p>
        <div class="actions">
          <label for="quantity" class="point-out-info">Menge:</label>
          <div class="quantity-selector">
            <button @click="decreaseQuantity" :disabled="quantity <= 1" class="quantity-button">
              -
            </button>
            <span class="quantity-display">{{ quantity }}</span>
            <button @click="increaseQuantity" class="quantity-button">+</button>
          </div>
          <!-- Warenkorb Button mit Icon -->
          <button @click="addToCart" class="btn">
            <i class="bi bi-cart-fill"></i> In den Warenkorb
          </button>
        </div>
        <!-- Wunschzettel Button mit Herz-Icon -->
        <button class="btn secondary" @click="toggleWishlist">
          <i :class="isWished ? 'bi bi-heart-fill' : 'bi bi-heart'"></i> Auf den Wunschzettel
        </button>
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
import { useCartStore } from '@/stores/shoppingCart.js'
import { useWishlistStore } from '@/stores/wishlist.js'

// Initialisieren der Stores und Router
const cartStore = useCartStore()
const wishlistStore = useWishlistStore()
const router = useRouter()
const route = useRoute()

// Reaktive Zustände
const product = ref(null)
const loading = ref(true)
const quantity = ref(1)
const showImageModal = ref(false) // Zustand für das Modal

const productId = route.params.id

// Berechnete Eigenschaften
const fullStars = computed(() => Math.floor(product.value?.averageRating || 0))
const emptyStars = computed(() => 5 - fullStars.value)

// Formatierer für Preise
const formatter = new Intl.NumberFormat('de-DE', {
  style: 'decimal',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

// Berechnete Eigenschaft: Formatierter Preis
const formattedPrice = computed(() => {
  return product.value && product.value.price ? formatter.format(product.value.price) : '0,00'
})

// Berechnete Eigenschaft: Preis pro Einheit
// Preis pro Kilogramm berechnen (als Zahl)
const pricePerKg = computed(() => {
  if (product.value.price && product.value.quantity) {
    const pricePerGram = product.value.price / product.value.quantity
    const pricePerKilogram = pricePerGram * 1000
    return parseFloat(pricePerKilogram.toFixed(2)) // Rückgabe als Zahl
  }
  return 0.0
})

// Zustände für den Wunschzettel
const isWished = computed(() => wishlistStore.isWished(productId))

// Funktion zum Abrufen der Produktdetails
const fetchProduct = async () => {
  try {
    const { data } = await axios.get(`/product/${productId}`)
    product.value = data
  } catch (error) {
    console.error('Fehler beim Laden der Produktdetails:', error)
    alert('Produktdetails konnten nicht geladen werden.')
    await router.push('/')
  } finally {
    loading.value = false
  }
}

// Funktionen zur Mengensteuerung
const increaseQuantity = () => {
  quantity.value += 1
}

const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value -= 1
  }
}

// Funktion zum Hinzufügen zum Warenkorb
const addToCart = () => {
  if (quantity.value < 1 || !Number.isInteger(quantity.value)) {
    alert('Bitte eine gültige Menge (mindestens 1 Einheit) eingeben.')
    return
  }
  cartStore.addToCart(product.value, quantity.value)
  alert(`${quantity.value} Einheit(en) von ${product.value.name} in den Warenkorb gelegt.`)
}

// Funktionen zum Öffnen und Schließen des Modals
const openImageModal = () => {
  showImageModal.value = true
}

const closeImageModal = () => {
  showImageModal.value = false
}

// Funktionen zum Wunschzettel
const toggleWishlist = () => {
  wishlistStore.toggleWishlist(productId)
  if (wishlistStore.isWished(productId)) {
    alert(`${product.value.name} wurde zum Wunschzettel hinzugefügt.`)
  } else {
    alert(`${product.value.name} wurde vom Wunschzettel entfernt.`)
  }
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

/* Zusätzliche Preisangaben */
.point-out-info {
  font-weight: bold;
  font-size: 14px;
  color: #555; /* Dezente Farbe */
  margin-bottom: 4px;
}

.content-info {
  font-size: 14px;
  color: #555; /* Dezente Farbe */
  margin-bottom: 8px;
}

/* Sternebewertung */
.rating {
  display: flex;
  align-items: center;
  gap: 5px;
}

/* Stil für die Preisangabe */
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

/* Stil für die Mengensteuerung */
.quantity-selector {
  display: flex;
  align-items: center;
  gap: 20px;
}

.quantity-button {
  width: 70px;
  height: 50px;
  background-color: #9fa86d;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 20px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.quantity-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.quantity-button:hover:not(:disabled) {
  background-color: #7a844b;
}

.quantity-display {
  font-size: 16px;
  min-width: 20px;
  text-align: center;
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

/* Stil für die Wunschzettel-Buttons */
.btn {
  padding: 10px 15px;
  font-size: 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  background: #c06e52;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: background-color 0.3s ease;
}

.btn:hover {
  background: #a35b42;
}

.btn.secondary {
  background: #9fa86d;
}

.btn.secondary:hover {
  background: #7a844b;
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
