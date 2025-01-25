<template>
  <header class="py-2">
    <div class="header-container">
      <!-- Einstellungen -->
      <div class="position-relative icon-wrapper" ref="settingsContainerRef">
        <img
          src="@/assets/icons/settings.webp"
          width="63"
          height="63"
          alt="Settings"
          class="round-icon-responsive"
          @click="handleSettingsIconClick"
        />

        <!-- Settings-Popup -->
        <transition name="fade">
          <div v-if="showSettingsPopup" ref="settingsPopupRef" class="settings-popup" @click.stop>
            <router-link
              v-for="link in filteredLinks"
              :key="link.label"
              :to="{ name: link.componentName }"
              class="popup-link"
            >
              {{ link.label }}
            </router-link>
          </div>
        </transition>
      </div>

      <!-- Banner Logo -->
      <div class="logo-center">
        <router-link to="/">
          <button class="btn btn-image" type="button">
            <img
              src="@/assets/images/banner_logo.webp"
              width="324"
              height="123"
              class="banner-logo-responsive"
              alt="Tea Logo"
            />
          </button>
        </router-link>
      </div>

      <!-- Account/Logout + Warenkorb -->
      <div class="d-flex align-items-center position-relative">
        <!-- Account-Icon -->
        <img
          :src="currentAccountIcon"
          :class="['round-icon-responsive']"
          width="63"
          height="63"
          alt="Account-Icon"
          @click="handleAccountIconClick"
          class="icon-wrapper"
          ref="accountContainerRef"
        />

        <!-- Logout-Popup -->
        <transition name="fade">
          <div v-if="user && showLogoutPopup" ref="popupRef" class="logout-popup" @click.stop>
            <button @click="logout" class="btn btn-danger">Abmelden</button>
          </div>
        </transition>

        <!-- Wishlist -->
        <div class="position-relative icon-wrapper">
          <router-link :to="{ name: 'WishList' }" class="wishlist-link" @click="closeCart">
            <img
              :src="currentWishlistIcon"
              width="63"
              height="63"
              alt="Wishlist Icon"
              class="round-icon-responsive"
            />
            <span v-if="wishlistStore.itemCount > 0" class="cart-count">
              {{ wishlistStore.itemCount }}
            </span>
          </router-link>
        </div>

        <!-- Shopping Cart -->
        <div class="position-relative icon-wrapper" @click="toggleCart">
          <img
            :src="currentCartIcon"
            width="63"
            height="63"
            alt="ShoppingCart"
            class="round-icon-responsive"
          />
          <span v-if="cartStore.totalItems > 0" class="cart-count">{{ cartStore.totalItems }}</span>
        </div>

        <!-- Warenkorb Popup -->
        <transition name="fade">
          <div v-if="showCart" class="cart-popup" @click.stop>
            <div v-if="cartStore.items.length === 0" class="empty-cart">
              <p>Ihr Warenkorb ist leer.</p>
            </div>
            <div v-else>
              <ul>
                <li v-for="item in cartStore.items" :key="item.id" class="cart-item">
                  <img :src="item.image" alt="Produktbild" class="cart-item-image" />
                  <div class="cart-item-details">
                    <p class="cart-item-name">{{ item.name }}</p>
                    <p>{{ item.productQuantity }} Artikel - je {{ item.price }}€</p>
                  </div>
                  <button @click="removeItem(item.id)" class="remove-button">Entfernen</button>
                </li>
              </ul>
              <div class="cart-total">
                <p>Gesamt: {{ cartStore.totalAmount }}€</p>
                <router-link :to="{ name: 'ShoppingCart' }" class="btn to-cart" @click="closeCart">
                  Zum Warenkorb
                </router-link>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user.js'
import { useCartStore } from '@/stores/shoppingCart.js'
import { useWishlistStore } from '@/stores/wishlist.js'
import accountIcon from '@/assets/icons/account.webp'
import accountLoggedInIcon from '@/assets/icons/accountLoggedIn.webp'
import wishlistIcon from '@/assets/icons/wishlist.webp'
import wishlistIconFull from '@/assets/icons/wishListFull.webp'
import shopingcartIcon from '@/assets/icons/shopingcart.webp'
import shoppingCartFullIcon from '@/assets/icons/shoppingCartFull.webp'
import Swal from 'sweetalert2'

// Initialisieren der Stores und Router
const userStore = useUserStore()
const cartStore = useCartStore()
const wishlistStore = useWishlistStore()
const router = useRouter()
const user = computed(() => userStore.user)

// Popup-Refs
const showSettingsPopup = ref(false)
const showLogoutPopup = ref(false)
const showCart = ref(false)
const settingsPopupRef = ref(null)
const settingsContainerRef = ref(null)
const popupRef = ref(null)
const accountContainerRef = ref(null)

// Alle möglichen Links mit ComponentName
const links = [
  { label: 'Dashboard', componentName: 'AdminDashboard' },
  { label: 'Dashboard', componentName: 'UserDashboard' },
  { label: 'Meine Bestellungen', componentName: 'OrderDetail' },
  { label: 'Wunschliste', componentName: 'WishList' },
  { label: 'Kontoeinstellungen', componentName: 'UserEditUser' },
]

// Gefilterte Links basierend auf Benutzerrolle
const filteredLinks = computed(() => {
  if (!user.value) {
    return [
      { label: 'Warenkorb', componentName: 'ShoppingCart' },
      { label: 'Wunschliste', componentName: 'WishList' },
    ]
  }
  return links.filter((link) => {
    if (link.componentName === 'AdminDashboard') {
      return user.value.isAdmin
    }
    if (link.componentName === 'UserDashboard') {
      return !user.value.isAdmin
    }
    return true
  })
})

// Account-Icon dynamisch auswählen
const currentAccountIcon = computed(() => {
  return user.value ? accountLoggedInIcon : accountIcon
})

// Wishlist-Icon dynamisch auswählen
const currentWishlistIcon = computed(() => {
  return wishlistStore.itemCount > 0 ? wishlistIconFull : wishlistIcon
})

// Cart-Icon dynamisch auswählen
const currentCartIcon = computed(() => {
  return cartStore.totalItems > 0 ? shoppingCartFullIcon : shopingcartIcon
})

// Toggle Warenkorb Popup
const toggleCart = () => {
  if (showLogoutPopup.value) {
    showLogoutPopup.value = false
  }
  showCart.value = !showCart.value
}

function closeCart() {
  showCart.value = false
}

// Entfernen eines Artikels aus dem Warenkorb
const removeItem = (productId) => {
  cartStore.removeFromCart(productId)
}

// Globale Klick-Listener registrieren
const handleGlobalClick = (event) => {
  const target = event.target
  if (
    showSettingsPopup.value &&
    settingsPopupRef.value &&
    !settingsContainerRef.value.contains(target)
  ) {
    showSettingsPopup.value = false
  }

  if (showLogoutPopup.value && popupRef.value && !accountContainerRef.value.contains(target)) {
    showLogoutPopup.value = false
  }

  if (showCart.value && !target.closest('.cart-popup') && !target.closest('.icon-wrapper')) {
    showCart.value = false
  }
}

onMounted(() => {
  window.addEventListener('click', handleGlobalClick)
})

onBeforeUnmount(() => {
  window.removeEventListener('click', handleGlobalClick)
})

// Einstellungen-Icon klicken
const handleSettingsIconClick = () => {
  showSettingsPopup.value = !showSettingsPopup.value
}

// Account-Icon klicken
const handleAccountIconClick = () => {
  if (showCart.value) {
    showCart.value = false
  }
  if (!user.value) {
    router.push({ name: 'Login' })
  } else {
    showLogoutPopup.value = !showLogoutPopup.value
  }
}

// Logout-Funktion
const logout = async () => {
  try {
    await userStore.logout()
    showLogoutPopup.value = false
    await router.push({ name: 'LandingPage' })
  } catch (error) {
    console.error('Fehler beim Logout:', error)
    await Swal.fire({
      title: 'Fehler beim Logout!',
      text: error.response?.data?.error || 'Ein unbekannter Fehler ist aufgetreten.',
      icon: 'error',
      confirmButtonText: 'OK',
    })
  }
}
</script>

<style scoped>
/* Allgemeine Header-Stile */
header {
  background-image: url('@/assets/images/banner.webp');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

/* Flexibles Container-Layout für den Header ohne Umbrechen */
.header-container {
  display: flex;
  flex-wrap: nowrap; /* Kein Umbrechen */
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0 15px;
}

/* Icon-Wrapper für Abstände und Ausrichtung */
.icon-wrapper {
  margin: 0 5px;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  position: relative;
  flex-shrink: 1; /* Ermöglicht Schrumpfen */
}

/* Bilder mit festen Standardgrößen */
.round-icon-responsive {
  width: 63px; /* Standardbreite für Icons */
  height: auto;
  display: block;
  transition: width 0.5s ease; /* Sanfter Übergang für Breitenänderungen */
}

.banner-logo-responsive {
  width: 324px;
  height: auto;
  display: block;
  transition: width 0.5s ease; /* Sanfter Übergang für Breitenänderungen */
}

/* Hover-Effekt für Icons */
.icon-wrapper:hover .round-icon-responsive,
.round-icon-responsive:hover {
  transform: scale(1.05);
  transition: transform 0.2s ease-in-out;
}

/* Zentrierung des Logos */
.logo-center {
  flex: 1 1 auto;
  text-align: center;
  margin: 10px 0;
}

/* Popup-Stile bleiben unverändert */
.settings-popup {
  position: absolute;
  top: 60px;
  left: 0;
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  padding: 12px 16px;
  z-index: 1000;
  min-width: 200px;
}

.popup-link {
  display: block;
  text-decoration: none;
  color: #333;
  padding: 8px 0;
  font-weight: bold;
  border-bottom: 1px solid #ddd;
  transition: color 0.2s ease;
}

.popup-link:last-child {
  border-bottom: none;
}

.popup-link:hover {
  color: #c06e52;
}

.logout-popup {
  position: absolute;
  top: 100%;
  right: 40%;
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  padding: 12px 16px;
  min-width: 130px;
  z-index: 1000;
}

.logout-popup button {
  width: 100%;
  padding: 8px 12px;
  cursor: pointer;
  border: none;
  border-radius: 4px;
  background-color: #c06e52;
  color: white;
  font-weight: bold;
  transition: background-color 0.2s ease;
}

.logout-popup button:hover {
  background-color: #8f4c37;
}

.cart-popup {
  position: absolute;
  top: 70px;
  right: 10px;
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  padding: 16px;
  z-index: 1000;
  width: 350px;
}

.cart-count {
  position: absolute;
  top: 0;
  right: 0;
  background: red;
  color: white;
  border-radius: 50%;
  padding: 2px 6px;
  font-size: 12px;
}

.cart-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.cart-item-image {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
  margin-right: 10px;
}

.cart-item-details {
  flex: 1;
}

.cart-item-name {
  font-weight: bold;
}

.remove-button {
  background: none;
  font-weight: bold;
  border: none;
  color: red;
  cursor: pointer;
}

.to-cart {
  background-color: #4a5043;
  color: white;
}

.to-cart:hover {
  background-color: #9fa86d;
}

.cart-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  flex-wrap: wrap;
}

.empty-cart {
  text-align: center;
}

/* Medienabfragen für Skalierung der Bilder */
@media (max-width: 1200px) {
  .round-icon-responsive {
    width: 55px;
  }

  .banner-logo-responsive {
    width: 280px;
  }
}

@media (max-width: 1000px) {
  .round-icon-responsive {
    width: 50px;
  }

  .banner-logo-responsive {
    width: 240px;
  }
}

@media (max-width: 800px) {
  .round-icon-responsive {
    width: 45px;
  }

  .banner-logo-responsive {
    width: 200px;
  }
}

@media (max-width: 600px) {
  .round-icon-responsive {
    width: 40px;
  }

  .banner-logo-responsive {
    width: 180px;
  }
}

@media (max-width: 420px) {
  .round-icon-responsive {
    width: 35px;
  }

  .banner-logo-responsive {
    width: 140px;
  }

  /* Margin vom banner logo zu anderen Icons kleiner skalieren */
  .logo-center {
    margin-left: -10px;
    margin-right: -20px;
  }

  /* Abstände der Icons anpassen kleiner skalieren */
  .icon-wrapper {
    margin: 0 3px;
  }
}
</style>
