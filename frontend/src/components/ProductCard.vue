<template>
  <router-link :to="{ name: 'ProductDetail', params: { id: product.id } }" class="product-card">
    <div :class="['product-card', { 'product-card-deleted': product.isDeleted }]">
      <div class="card mb-1 shadow-sm">
        <!-- Produktbild -->
        <img :src="product.image" class="card-img-top" alt="Produktbild" />
        <div class="card-body">
          <!-- Produktname -->
          <h5 class="card-title">{{ product.name }}</h5>

          <!-- Kategorien als Badges -->
          <div class="categories-section mb-3">
            <span
              v-for="category in product.productCategories"
              :key="category.id"
              class="badge category-badge"
            >
              {{ category.name }}
            </span>
          </div>

          <!-- Sternebewertung -->
          <div class="card-icons">
            <img
              v-for="n in fullStars"
              :key="'full-star-' + n"
              src="../../src/assets/icons/starFull.webp"
              alt="Voller Stern"
              class="card-rating"
            />
            <img
              v-for="n in emptyStars"
              :key="'empty-star-' + n"
              src="../../src/assets/icons/starEmpty.webp"
              alt="Leerer Stern"
              class="card-rating"
            />
            <p>({{ product.reviews }})</p>
          </div>

          <!-- Preis -->
          <p class="card-text">Ab {{ product.price }}€ erhältlich</p>

          <!-- Produktbeschreibung -->
          <div class="product-description">
            <p class="card-text">{{ truncatedDescription }}</p>
          </div>
        </div>

        <!-- Buttons für "Like" und "In den Warenkorb" -->
        <div class="bottom-buttons">
          <!-- Like-Button -->
          <button @click.stop.prevent="toggleWishlist" class="btn btn-image" type="button">
            <!-- Dynamischer Icon-Wechsel abhängig davon, ob das Produkt in der Wishlist ist -->
            <img
              :src="
                isWished
                  ? '../../src/assets/icons/likeFull.webp'
                  : '../../src/assets/icons/likeEmpty.webp'
              "
              alt="Wishlist Icon"
              class="card-button me-4"
            />
          </button>

          <!-- In den Warenkorb legen -->
          <button @click.stop.prevent="toggleCart" class="btn btn-image" type="button">
            <img
              :src="
                isInShoppingCart
                  ? '../../src/assets/icons/shoppingCartFull.webp'
                  : '../../src/assets/icons/shopingcart.webp'
              "
              alt="Zum Einkaufswagen hinzufügen"
              class="card-button"
            />
          </button>
        </div>
      </div>
    </div>
  </router-link>
</template>

<script setup>
import { computed } from 'vue'
import { useCartStore } from '@/stores/shoppingCart.js'
import { useWishlistStore } from '@/stores/wishlist.js'
import Swal from 'sweetalert2'

// Initialisieren der Stores
const cartStore = useCartStore()
const wishlistStore = useWishlistStore()

// Props
const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
})

// Computed: Produkt in Wishlist/Cart?
const isWished = computed(() => wishlistStore.isWished(props.product.id))
const isInShoppingCart = computed(() => cartStore.isInShoppingCart(props.product.id))

// Computed: Sterne
const fullStars = computed(() => Math.floor(props.product.averageRating))
const emptyStars = computed(() => 5 - fullStars.value)

// Beschreibung kürzen
const truncatedDescription = computed(() => {
  const maxLength = 100
  const description = props.product.description || ''
  return description.length > maxLength ? description.slice(0, maxLength) + '...' : description
})

// In den Warenkorb
const toggleCart = () => {
  if (isInShoppingCart.value) {
    cartStore.removeFromCart(props.product.id)
    Swal.fire({
      title: 'Artikel dem Warenkorb entfernt!',
      text: `1 Artikel: "${props.product.name}" wurde aus dem Warenkorb entfernt.`,
      icon: 'success',
      showConfirmButton: false,
      timer: 1500,
      timerProgressBar: true,
    })
  } else {
    cartStore.addToCart(props.product, 1)
    Swal.fire({
      title: 'Artikel dem Warenkorb hinzugefügt!',
      text: `1 Artikel: "${props.product.name}" wurde dem Warenkorb hinzugefügt.`,
      icon: 'success',
      showConfirmButton: false,
      timer: 1500,
      timerProgressBar: true,
    })
  }
}

// Wishlist togglen
const toggleWishlist = () => {
  if (isWished.value) {
    wishlistStore.removeFromWishlist(props.product.id)
    Swal.fire({
      title: 'Artikel von der Wunschliste entfernt!',
      text: `Artikel: "${props.product.name}" wurde von der Wunschliste entfernt.`,
      icon: 'success',
      showConfirmButton: false,
      timer: 1500,
      timerProgressBar: true,
    })
  } else {
    wishlistStore.addToWishlist(props.product)
    Swal.fire({
      title: 'Artikel der Wunschliste hinzugefügt!',
      text: `Artikel: "${props.product.name}" wurde der Wunschliste hinzugefügt.`,
      icon: 'success',
      showConfirmButton: false,
      timer: 1500,
      timerProgressBar: true,
    })
  }
}
</script>

<style scoped>
.product-card {
  display: flex;
  text-decoration: none;
  flex-direction: column;
  height: 100%;
  width: 100%;
  position: relative;
}

.product-card-deleted {
  filter: grayscale(100%);
  opacity: 0.6;
  pointer-events: none;
}

/* Hintergrund, Schatten und Rand für die Karte */
.card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-radius: 15px;
  background-color: #f1e2c5;
  border: 2px solid #4a5043;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  min-height: 500px;
  max-height: 500px;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.card-img-top {
  height: 200px;
  object-fit: cover;
  border-top-left-radius: 15px;
  border-top-right-radius: 15px;
}

.card-body {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  height: 100%;
  padding: 16px;
  flex-grow: 1;
  overflow: hidden;
}

.card-title {
  font-size: 22pt;
  color: #9fa86d;
  margin-bottom: 8px;
}

.categories-section {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.category-badge {
  background-color: #9fa86d;
  color: #fff;
  padding: 5px 10px;
  font-size: 12px;
  border-radius: 12px;
}

.card-icons {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 8px;
}

/* Basisstil für die Buttons */
.card-button {
  height: 50px;
  width: 50px;
  border-radius: 50%; /* Macht den Button rund */
  display: flex;
  justify-content: center;
  align-items: center;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
  overflow: hidden; /* Verhindert, dass das Bild über den runden Rand hinausgeht */
}

/* Verhindern, dass das Bild das runde Aussehen sprengt */
.card-button img {
  width: 100%;
  height: 100%;
  object-fit: contain; /* Stellt sicher, dass das Bild nicht verzerrt wird */
}

/* Hover-Effekte für die Buttons */
.card-button:hover {
  transform: scale(1.1); /* Vergrößert den Button beim Hover */
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2); /* Fügt einen Schatten hinzu */
}

/* Hover-Effekt nur für den Wishlist-Button */
.card-button.me-4:hover {
  transform: scale(1.1); /* Vergrößert den Like-Button */
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
}

/* Hover-Effekt nur für den Warenkorb-Button */
.card-button:nth-child(2):hover {
  transform: scale(1.1); /* Vergrößert den Warenkorb-Button */
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
}

.card-rating {
  height: 20px;
  width: 20px;
}

.card-text {
  font-size: 14px;
  color: #333;
  margin-bottom: 8px;
}

.product-description {
  flex-grow: 1;
  overflow: hidden;
  max-height: 200px;
}

.bottom-buttons {
  position: absolute;
  bottom: 1px;
  left: 16px;
  right: 16px;
  display: flex;
  justify-content: center;
  gap: 20px;
}
</style>
