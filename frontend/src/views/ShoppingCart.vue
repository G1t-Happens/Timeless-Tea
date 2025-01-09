<template>
  <div class="cart">
    <h1 class="cart-title">Ihr Warenkorb</h1>
    <BackButton />

    <div v-if="cartStore.items.length === 0" class="empty-cart">
      <p>Ihr Warenkorb ist leer.</p>
      <router-link to="/" class="btn btn-primary">Zurück zum Shop</router-link>
    </div>

    <div v-else class="cart-content">
      <table class="cart-table">
        <thead>
          <tr>
            <th>Produkt</th>
            <th>Menge (g)</th>
            <th>Preis (€)</th>
            <th>Gesamt (€)</th>
            <th>Aktion</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in cartStore.items" :key="item.productId">
            <td class="product-info">
              <img :src="item.image" :alt="item.name" class="product-image" />
              <router-link :to="`/product/${item.productId}`" class="product-link">
                {{ item.name }}
              </router-link>
            </td>
            <td>
              <input
                type="number"
                v-model.number="item.quantity"
                min="1"
                step="1"
                @change="handleQuantityChange(item)"
                class="quantity-input"
              />
            </td>
            <td>{{ item.price.toFixed(2) }}</td>
            <td>{{ (item.price * item.quantity).toFixed(2) }}</td>
            <td>
              <button @click="removeItem(item.productId)" class="btn btn-danger remove-btn">
                Entfernen
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="cart-summary">
        <p>
          Gesamtsumme: <strong>{{ cartStore.totalAmount }} €</strong>
        </p>
        <router-link to="/checkout" class="btn btn-success">Zur Kasse</router-link>
        <button @click="clearCart" class="btn btn-secondary">Warenkorb leeren</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useCartStore } from '@/stores/shoppingCart.js'
import BackButton from '@/components/navigation/BackButton.vue'

const cartStore = useCartStore()

const removeItem = (productId) => {
  cartStore.removeFromCart(productId)
}

const handleQuantityChange = (item) => {
  if (item.quantity < 1) {
    alert('Bitte gültige Menge eingeben.')
    cartStore.updateQuantity(item.productId, 1)
  }
}

const clearCart = () => {
  if (confirm('Möchten Sie wirklich Ihren gesamten Warenkorb leeren?')) {
    cartStore.clearCart()
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
