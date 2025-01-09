<template>
  <div class="order-page">
    <BackButton />
    <h2 class="page-title form-label">Meine Bestellungen</h2>
    <div v-if="loading" class="loading">
      <p>Loading orders...</p>
    </div>
    <div v-if="!loading && sortedOrders.length === 0" class="empty">
      <p>No orders found.</p>
    </div>
    <div v-else>
      <div class="order-list">
        <div v-for="order in sortedOrders" :key="order.id" class="order-item">
          <div class="order-details">
            <p><strong>Order ID:</strong> {{ order.id }}</p>
            <p><strong>Status:</strong> {{ order.orderStatus }}</p>
            <p><strong>Gesamt:</strong> €{{ order.totalAmount.toFixed(2) }}</p>
            <p><strong>Bestellt am:</strong> {{ formatDate(order.createdAt) }}</p>
            <p><strong>Bezahlmethode:</strong> {{ order.payment.paymentOption }}</p>
            <p><strong>Lieferadresse:</strong> {{ formatAddress(order.user.address) }}</p>
          </div>
          <div class="order-actions">
            <button
              v-if="order.orderStatus !== 'cancel'"
              class="cancel-button"
              @click="cancelOrder(order.id)"
            >
              Bestellung stornieren
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import axios from 'axios'
import BackButton from '@/components/navigation/BackButton.vue'

const orders = ref([])
const user = ref(null)
const loading = ref(false)

const fetchUserAndOrders = async (userId) => {
  loading.value = true
  try {
    const { data } = await axios.get(`/user/${userId}`)
    user.value = data

    // Associate user and payment details with orders
    orders.value = data.orders.map((order) => ({
      ...order,
      user: data, // Include user info in the order
      payment: data.payment, // Include payment info in the order
    }))
  } catch (error) {
    console.error('Error loading user and orders:', error)
    alert('Failed to load user data and orders.')
  } finally {
    loading.value = false
  }
}

const sortedOrders = computed(() => {
  return orders.value.slice().sort((a, b) => {
    if (a.orderStatus === b.orderStatus) {
      return b.createdAt - a.createdAt // Newest first
    }
    return a.orderStatus.localeCompare(b.orderStatus) // Alphabetical
  })
})

const formatDate = (timestamp) => {
  const date = new Date(timestamp)
  return date.toLocaleString()
}

const formatAddress = (address) => {
  return `${address.street} ${address.houseNumber}, ${address.city}, ${address.state}, ${address.country}, ${address.postalCode} (${address.addressAddition})`
}

const cancelOrder = (orderId) => {
  const order = orders.value.find((o) => o.id === orderId)
  if (order) {
    order.orderStatus = 'cancel'
  }
}

// Initial load for user ID 2
fetchUserAndOrders(2)
</script>

<style scoped>
.form-label {
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
}

.page-title {
  text-align: center;
  margin-bottom: 30px;
  font-size: 1.8rem;
  color: #333;
}

.order-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

h1 {
  font-size: 24px;
  margin-bottom: 20px;
}

.loading {
  text-align: center;
  color: #666;
}

.empty {
  text-align: center;
  color: #999;
}

.order-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.order-item {
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 15px;
  background-color: #f9f9f9;
}

.order-details p {
  margin: 5px 0;
}

.order-actions {
  margin-top: 10px;
}

.cancel-button {
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 8px 12px;
  cursor: pointer;
}

.cancel-button:hover {
  background-color: #d32f2f;
}
</style>
