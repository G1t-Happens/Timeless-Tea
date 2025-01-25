<template>
  <div class="cart">
    <h1 class="cart-title">Ihr Warenkorb</h1>
    <BackButton />

    <div v-if="cartStore.items.length === 0" class="empty-cart">
      <p>Ihr Warenkorb ist leer.</p>
      <router-link :to="{ name: 'LandingPage' }" class="btn btn-success"
        >Zurück zum Shop
      </router-link>
    </div>

    <div v-else class="cart-content">
      <table class="cart-table">
        <thead>
          <tr>
            <th>Produkt</th>
            <th>Artikel</th>
            <th>Preis (€)</th>
            <th>Gesamt (€)</th>
            <th>Aktion</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in cartStore.items" :key="item.id">
            <td class="product-info">
              <img :src="item.image" :alt="item.name" class="product-image" />
              <router-link
                :to="{ name: 'ProductDetail', params: { id: item.id } }"
                class="product-link"
              >
                {{ item.name }}
              </router-link>
            </td>
            <td>
              <input
                type="number"
                v-model.number="item.productQuantity"
                min="1"
                max="1000"
                step="1"
                @change="handleQuantityChange(item)"
                class="quantity-input"
              />
            </td>
            <td>{{ item.price.toFixed(2) }}</td>
            <td>{{ (item.price * item.productQuantity).toFixed(2) }}</td>
            <td>
              <button @click="removeItem(item.id)" class="btn btn-danger remove-btn">
                Entfernen
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Fehlermeldung bei überschrittener Gesamtsumme -->
      <div v-if="isTotalExceeded" class="error-message">
        <p>Die Gesamtsumme darf 1.000.000 € nicht überschreiten.</p>
      </div>

      <div class="cart-summary">
        <p>
          Gesamtsumme: <strong>{{ cartStore.totalAmount.toFixed(2) }} €</strong>
        </p>
        <button @click="proceedToCheckout" class="btn btn-success" :disabled="isTotalExceeded">
          Zur Kasse
        </button>
        <button @click="clearCart" class="btn btn-secondary">Warenkorb leeren</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useCartStore } from '@/stores/shoppingCart.js'
import BackButton from '@/components/navigation/BackButton.vue'
import Swal from 'sweetalert2'
import { useRouter } from 'vue-router'

const cartStore = useCartStore()
const router = useRouter()

const removeItem = (productId) => {
  cartStore.removeFromCart(productId)
}

const handleQuantityChange = (item) => {
  // Prüfen, ob der Wert eine gültige Zahl ist
  if (isNaN(item.productQuantity)) {
    item.productQuantity = 1
    Swal.fire({
      backdrop: false,
      title: 'Ungültige Eingabe!',
      text: 'Bitte geben Sie eine gültige Zahl ein.',
      icon: 'error',
      confirmButtonText: 'OK',
    })
    cartStore.updateQuantity(item.id, item.productQuantity)
    return
  }

  // Sicherstellen, dass der Wert innerhalb des erlaubten Bereichs liegt (Input Validation mit automatischer Anpassung)
  if (item.productQuantity < 1) {
    item.productQuantity = 1
    Swal.fire({
      backdrop: false,
      title: 'Ungültige Menge!',
      text: 'Die Menge muss mindestens 1 betragen.',
      icon: 'warning',
      confirmButtonText: 'OK',
    })
  } else if (item.productQuantity > 1000) {
    item.productQuantity = 1000
    Swal.fire({
      backdrop: false,
      title: 'Ungültige Menge!',
      text: 'Die maximale Menge ist 1000.',
      icon: 'warning',
      confirmButtonText: 'OK',
    })
  }

  // Aktualisiere die Menge im Warenkorb
  cartStore.updateQuantity(item.id, item.productQuantity)
}

const clearCart = async () => {
  const result = await Swal.fire({
    backdrop: false,
    title: 'Warenkorb leeren?',
    text: 'Möchten Sie wirklich alle Artikel entfernen? Dieser Vorgang kann nicht rückgängig gemacht werden.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Ja, entfernen',
    cancelButtonText: 'Abbrechen',
  })

  if (result.isConfirmed) {
    cartStore.clearCart()
    await Swal.fire({
      backdrop: false,
      title: 'Warenkorb geleert',
      text: 'Der Warenkorb wurde erfolgreich geleert.',
      icon: 'success',
      confirmButtonText: 'OK',
    })
  }
}

// Computed Property für den Gesamtsummen-Check
const isTotalExceeded = computed(() => {
  return cartStore.totalAmount > 1000000
})

// Methode zum Fortfahren zur Kasse
const proceedToCheckout = () => {
  if (isTotalExceeded.value) {
    Swal.fire({
      backdrop: false,
      title: 'Gesamtsumme überschritten!',
      text: 'Die Gesamtsumme darf 1.000.000 € nicht überschreiten.',
      icon: 'error',
      confirmButtonText: 'OK',
    })
  } else {
    router.push({ name: 'CheckOut' })
  }
}
</script>

<style scoped>
.cart {
  max-width: 1200px;
  margin: 40px auto;
  padding: 0 20px;
}

.cart-title {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 30px;
  color: #c06e52;
}

.empty-cart {
  text-align: center;
  margin-top: 50px;
}

.empty-cart p {
  font-size: 1.5rem;
  margin-bottom: 20px;
}

.cart-content {
  overflow-x: auto;
}

.cart-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 30px;
}

.cart-table th,
.cart-table td {
  border: 1px solid #ddd;
  padding: 15px;
  text-align: center;
}

.cart-table th {
  background-color: #f9f9f9;
  color: #333;
}

.product-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.product-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
}

.product-link {
  color: #007bff;
  text-decoration: none;
  font-weight: bold;
}

.product-link:hover {
  text-decoration: underline;
}

.quantity-input {
  width: 80px;
  padding: 5px;
  text-align: center;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.remove-btn {
  background-color: #c06e52;
  color: white;
}

.remove-btn:hover {
  background-color: #8f4c37;
}

.cart-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
}

.cart-summary p {
  font-size: 1.5rem;
}

.btn {
  padding: 10px 20px;
  font-size: 1rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-top: 10px;
}

.btn-success {
  background-color: #4a5043;
  color: white;
}

.btn-success:hover {
  background-color: #9fa86d;
}

.btn-danger {
  background-color: #c06e52;
  color: white;
}

.btn-danger:hover {
  background-color: #8f4c37;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #5a6268;
}

.error-message {
  margin-bottom: 15px;
  color: #d9534f;
  font-weight: bold;
  text-align: center;
}

@media (max-width: 768px) {
  .cart-summary {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .cart-summary p {
    font-size: 1.2rem;
  }
}
</style>
