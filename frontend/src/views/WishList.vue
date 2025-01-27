<template>
  <div class="wishlist-container">
    <!-- Titel -->
    <h1 class="wishlist-title">Meine Wunschliste</h1>

    <!-- Wenn Artikel vorhanden sind: Button zum Hinzufügen aller Artikel in den Warenkorb -->
    <div v-if="wishlistItems.length" class="wishlist-actions">
      <button class="btn btn-primary" @click="moveAllToCart">Alle Produkte in den Warenkorb</button>
    </div>

    <!-- Transition Group für ein weiches Ein-/Ausblenden der Artikel -->
    <transition-group name="fade" tag="div" class="wishlist-grid" v-if="wishlistItems.length">
      <!-- Iteration über jeden Artikel in der Wunschliste -->
      <div v-for="item in wishlistItems" :key="item.id" class="wishlist-item">
        <div class="product-card" :class="{ 'product-card-deleted': item.isDeleted }">
          <router-link
            :to="{ name: 'ProductDetail', params: { id: item.id } }"
            class="product-content-link"
          >
            <!-- Produktbild -->
            <img :src="item.image" class="product-image" alt="Produktbild" />

            <!-- Produktinformationen -->
            <div class="product-info">
              <!-- Name -->
              <h2 class="product-title">{{ item.name }}</h2>

              <!-- Kategorien-Badges -->
              <div class="product-categories">
                <span
                  v-for="category in item.productCategories || []"
                  :key="category.id"
                  class="badge category-badge"
                >
                  {{ category.name }}
                </span>
              </div>

              <!-- Sternebewertung -->
              <div class="product-rating">
                <!-- Voll-Sterne -->
                <img
                  v-for="n in fullStars(item.averageRating)"
                  :key="'full-star-' + n"
                  src="../../src/assets/icons/starFull.webp"
                  alt="Voller Stern"
                  class="star-icon"
                />
                <!-- Leere Sterne -->
                <img
                  v-for="n in emptyStars(item.averageRating)"
                  :key="'empty-star-' + n"
                  src="../../src/assets/icons/starEmpty.webp"
                  alt="Leerer Stern"
                  class="star-icon"
                />
                <span class="rating-text">({{ item.reviews }} Bewertungen)</span>
              </div>

              <!-- Preis -->
              <p class="product-price">Ab {{ item.price }} € erhältlich</p>

              <!-- Beschreibung (gekürzt) -->
              <p class="product-description">
                {{ truncatedDescription(item.description) }}
              </p>
            </div>
          </router-link>

          <!-- Aktionen (in den Warenkorb, entfernen) -->
          <div class="product-actions">
            <button class="btn btn-outline-primary" @click.prevent="moveToCart(item)">
              <i class="bi bi-cart-plus"></i> Warenkorb
            </button>
            <button class="btn btn-outline-danger" @click.prevent="removeFromWishlist(item.id)">
              <i class="bi bi-trash"></i> Entfernen
            </button>
          </div>
        </div>
      </div>
    </transition-group>

    <!-- Fallback, wenn keine Artikel in der Wunschliste sind -->
    <div v-else class="wishlist-empty">Deine Wunschliste ist leer.</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useCartStore } from '@/stores/shoppingCart.js'
import { useWishlistStore } from '@/stores/wishlist.js'
import Swal from 'sweetalert2'

// Stores
const cartStore = useCartStore()
const wishlistStore = useWishlistStore()

// Computed Property: Wishlist-Items
const wishlistItems = computed(() => wishlistStore.items)

// Produkt entfernen
const removeFromWishlist = (productId) => {
  wishlistStore.removeFromWishlist(productId)
  Swal.fire({
    backdrop: false,
    title: 'Artikel von der Wunschliste entfernt!',
    text: `Artikel wurde von der Wunschliste entfernt.`,
    icon: 'success',
    showConfirmButton: false,
    timer: 1500,
    timerProgressBar: true,
  })
}

// Produkt in den Warenkorb verschieben
const moveToCart = (product) => {
  cartStore.addToCart(product, 1)
  wishlistStore.removeFromWishlist(product.id)
  Swal.fire({
    backdrop: false,
    title: 'Artikel dem Warenkorb hinzugefügt!',
    text: `1 Artikel: "${product.name}" wurde dem Warenkorb hinzugefügt.`,
    icon: 'success',
    showConfirmButton: false,
    timer: 1500,
    timerProgressBar: true,
  })
}

// Alle Produkte in den Warenkorb verschieben
const moveAllToCart = async () => {
  const result = await Swal.fire({
    backdrop: false,
    title: 'Alle Artikel in den Warenkorb?',
    text: 'Möchten Sie wirklich alle Artikel in den Warenkorb verschieben?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Ja, alle verschieben',
    cancelButtonText: 'Abbrechen',
  })

  if (result.isConfirmed) {
    wishlistItems.value.forEach((item) => cartStore.addToCart(item, 1))
    wishlistStore.clearWishlist()
  }
}

// Sterne-Anzeige
const fullStars = (rating) => Math.floor(rating)
const emptyStars = (rating) => 5 - Math.floor(rating)

// Beschreibung kürzen
const truncatedDescription = (description = '') => {
  const maxLength = 100
  return description.length > maxLength ? description.slice(0, maxLength) + '...' : description
}
</script>

<style scoped>
/* Container & Titel */
.wishlist-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px 20px;
  background-color: #faf7f0;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.wishlist-title {
  text-align: center;
  margin-bottom: 30px;
  font-size: 1.8rem;
  color: #4a5043;
  font-weight: bold;
}

/* Aktionen (Button 'Alle Produkte in den Warenkorb') */
.wishlist-actions {
  text-align: center;
  margin-bottom: 20px;
}

/* Grid der Wishlist-Items */
.wishlist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
}

/* Einzelner Artikel */
.wishlist-item {
  list-style: none;
}

/* Produktkarte */
.product-card {
  position: relative; /* Wichtig für die absolute Positionierung von .product-actions */
  display: flex;
  flex-direction: column;
  height: 496px; /* Feste Höhe für ein einheitliches Layout */
  background-color: #ffffff;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #ddd;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s;
}

.product-card:hover {
  transform: translateY(-4px);
}

/* Klickbarer Bereich (Bild + Info) */
.product-content-link {
  display: block; /* Damit der komplette Inhalt klickbar wird */
  text-decoration: none; /* Entfernt die Unterstreichung */
  color: inherit; /* Übernimmt die normale Textfarbe */
}

.product-content-link:hover {
  text-decoration: none;
  color: inherit;
}

/* Gelöschter Zustand (optional) */
.product-card-deleted {
  filter: grayscale(70%);
  opacity: 0.5;
  pointer-events: none;
}

/* Produktbild */
.product-image {
  width: 100%;
  height: 200px; /* Feste Höhe für das Bild */
  object-fit: cover;
  background-color: #f1f1f1;
  flex-shrink: 0;
}

/* Produktinformationen */
.product-info {
  padding: 16px;
  flex: 1 1 auto;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  margin-bottom: 70px; /* Platz für den unten fixierten .product-actions-Bereich */
}

.product-title {
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  color: #333;
}

.product-categories {
  margin-bottom: 8px;
}

.category-badge {
  background-color: #9fa86d;
  color: #ffffff;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  margin-right: 4px;
}

/* Sternebewertung */
.product-rating {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 8px;
}

.star-icon {
  width: 18px;
  height: 18px;
}

.rating-text {
  font-size: 0.9rem;
  color: #666;
}

/* Preis */
.product-price {
  font-weight: bold;
  color: #c06e52;
  margin-bottom: 8px;
}

/* Beschreibung */
.product-description {
  font-size: 0.9rem;
  line-height: 1.3;
  color: #555;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  line-clamp: 5;
  -webkit-line-clamp: 5; /* Beschränkt die Anzeige auf 5 Zeilen */
  -webkit-box-orient: vertical;
  margin-bottom: 0;
}

/* Aktionen am unteren Kartenrand */
.product-actions {
  position: absolute; /* Fixierung am Kartenboden */
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px; /* Feste Höhe für eine einheitliche Größe */
  display: flex;
  justify-content: space-between;
  align-items: center; /* Vertikal zentrierte Buttons */
  padding: 0 12px;
  background-color: #f9f9f9;
  border-top: 1px solid #ddd;
  box-sizing: border-box; /* Padding in die feste Höhe einberechnen */
  flex-shrink: 0;
  gap: 8px;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  border-radius: 5px;
  transition: background-color 0.2s;
  cursor: pointer;
}

.btn i {
  margin-right: 4px;
}

/* Hauptbutton-Farben */
.btn-primary {
  background-color: #4a5043;
  border: none;
  color: #fff;
  padding: 8px 16px;
}

.btn-primary:hover {
  background-color: #9fa86d;
}

/* Outline-Buttons */
.btn-outline-primary {
  background-color: #4a5043;
  border: none;
  border-radius: 4px;
  color: white;
  padding: 6px 12px;
}

.btn-outline-primary:hover {
  background-color: #9fa86d;
  color: #fff;
}

.btn-outline-primary:focus:active,
.btn-outline-primary:active:focus {
  background-color: #9fa86d;
  border-color: #9fa86d;
  box-shadow: none;
}

.btn-outline-danger {
  background-color: #c06e52;
  border: none;
  border-radius: 4px;
  color: white;
  padding: 6px 12px;
}

.btn-outline-danger:hover {
  background-color: #8f4c37;
  color: #fff;
}

.btn-outline-danger:focus:active,
.btn-outline-danger:active:focus {
  background-color: #8f4c37;
  border-color: #8f4c37;
  box-shadow: none;
}

/* Leerer Zustand */
.wishlist-empty {
  text-align: center;
  font-size: 1.1rem;
  color: #666;
  padding: 40px;
}

/* Responsives Verhalten:
   Auf sehr kleinen Geräten (z.B. Smartphones)
   lassen wir die Höhe der Card dynamisch wachsen,
   damit nichts unschön abgeschnitten wird. */
@media (max-width: 576px) {
  .product-card {
    height: auto; /* Erlaubt, dass die Karte größer wird bei viel Inhalt */
  }

  .product-image {
    height: 180px;
  }

  .product-info {
    margin-bottom: 80px; /* Ggf. größerer Abstand, falls Buttons oder Text sonst überlappen */
  }
}
</style>
