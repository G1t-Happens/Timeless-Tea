<template>
  <div class="wishlist-page">
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-md-14">
          <div class="card shadow-sm fixed-card">
            <div class="card-body">
              <h2 class="page-title">Meine Wunschliste</h2>

              <!-- Wenn es Wishlist-Items gibt -->
              <div v-if="wishlistItems.length">
                <div class="wishlist-actions text-center mb-4">
                  <button class="btn btn-primary" @click="moveAllToCart">
                    <span>Alle zur Einkaufsliste hinzufügen</span>
                  </button>
                </div>

                <!-- Grid für Produktkarten -->
                <div class="wishlist-grid">
                  <!-- Iteration über jeden Artikel in der Wunschliste -->
                  <div v-for="item in wishlistItems" :key="item.id" class="wishlist-item-container">
                    <div class="product-card">
                      <div
                        class="card mb-4 shadow-sm"
                        :class="{ 'product-card-deleted': item.isDeleted }"
                      >
                        <!-- Produktbild -->
                        <img :src="item.image" class="card-img-top" alt="Produktbild" />
                        <div class="product-card-body">
                          <!-- Produktname -->
                          <h5 class="card-title">{{ item.name }}</h5>

                          <!-- Kategorien-Badges (falls vorhanden) -->
                          <div class="categories-section mb-3">
                            <span
                              v-for="category in item.productCategories || []"
                              :key="category.id"
                              class="badge category-badge"
                            >
                              {{ category.name }}
                            </span>
                          </div>

                          <!-- Sternebewertung -->
                          <div class="card-icons">
                            <img
                              v-for="n in fullStars(item.averageRating)"
                              :key="'full-star-' + n"
                              src="../../src/assets/icons/starFull.png"
                              alt="Voller Stern"
                              class="card-rating"
                            />
                            <img
                              v-for="n in emptyStars(item.averageRating)"
                              :key="'empty-star-' + n"
                              src="../../src/assets/icons/starEmpty.png"
                              alt="Leerer Stern"
                              class="card-rating"
                            />
                            <p>({{ item.reviews }} Bewertungen)</p>
                          </div>

                          <!-- Preis -->
                          <p class="card-text">Ab {{ item.price }} € erhältlich</p>

                          <!-- Gekürzte Produktbeschreibung -->
                          <div class="product-description">
                            <p class="card-text">
                              {{ truncatedDescription(item.description) }}
                            </p>
                          </div>
                        </div>

                        <!-- NEU: Buttons unter der Beschreibung -->
                        <div class="bottom-buttons-wishlist d-flex justify-content-between p-3">
                          <!-- Button: In den Warenkorb legen -->
                          <button
                            class="btn btn-outline-primary d-flex align-items-center"
                            @click.prevent="moveToCart(item)"
                            title="In den Warenkorb"
                          >
                            <i class="bi bi-cart-plus me-1"></i>
                            <span>In den Warenkorb</span>
                          </button>

                          <!-- Button: Aus der Wishlist entfernen -->
                          <button
                            class="btn btn-outline-danger d-flex align-items-center"
                            @click.prevent="removeFromWishlist(item.id)"
                            title="Aus der Wunschliste entfernen"
                          >
                            <i class="bi bi-trash me-1"></i>
                            <span>Entfernen</span>
                          </button>
                        </div>
                        <!-- /Buttons -->
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Fallback, wenn keine Wishlist-Items vorhanden sind -->
              <div v-else class="text-center wishlist-empty">
                <p>Deine Wunschliste ist leer.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useCartStore } from '@/stores/shoppingCart.js'
import { useWishlistStore } from '@/stores/wishlist.js'

const cartStore = useCartStore()
const wishlistStore = useWishlistStore()
const wishlistItems = computed(() => wishlistStore.items)

// Einzelnes Produkt entfernen
const removeFromWishlist = (productId) => {
  wishlistStore.removeFromWishlist(productId)
}

// Einzelnes Produkt in den Warenkorb schieben
const moveToCart = (product) => {
  cartStore.addToCart(product, 1)
  wishlistStore.removeFromWishlist(product.id)
}

// Alle Produkte in den Warenkorb schieben
const moveAllToCart = () => {
  wishlistItems.value.forEach((item) => {
    cartStore.addToCart(item, 1)
  })
  wishlistStore.clearWishlist()
}

// Sterne
const fullStars = (rating) => Math.floor(rating)
const emptyStars = (rating) => 5 - Math.floor(rating)

// Beschreibung kürzen
const truncatedDescription = (description = '') => {
  const maxLength = 100
  return description.length > maxLength ? description.slice(0, maxLength) + '...' : description
}
</script>

<style scoped>
.page-title {
  text-align: center;
  font-size: 1.8rem;
  color: #333;
  font-weight: bold;
  margin-bottom: 30px;
}

.wishlist-page {
  background-color: #f9f8f1;
}

.fixed-card .card-body {
  padding: 30px;
}

.btn-primary {
  background-color: #c06e52;
  border-color: #c06e52;
  border-radius: 8px;
}

.btn-primary:hover {
  background-color: #9f7a56;
  border-color: #9f7a56;
}

/* Grid für die Produktkarten in der Wunschliste */
.wishlist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 50px;
}

.wishlist-empty {
  font-size: 1.2rem;
  color: #666;
  padding: 20px;
  border: 2px dashed #4a5043;
  border-radius: 15px;
  background-color: rgba(255, 255, 255, 0.7);
}

.wishlist-item-container {
  position: relative;
}

.product-card {
  display: flex;
  text-decoration: none;
  flex-direction: column;
  height: 100%;
  width: 100%;
  position: relative;
}

/* Deaktivierte/durchgestrichene Produktkarte */
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
  background-color: #f1e2c5;
}

.product-card-body {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  height: 100%;
  padding: 16px;
  flex-grow: 1;
  overflow: hidden;
  background-color: #f1e2c5;
}

.bottom-buttons-wishlist {
  background-color: #f1e2c5;
  border-top: 2px solid #4a5043;
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
</style>
