<template>
  <div class="order-page">
    <BackButton />
    <h2 class="page-title form-label">Meine Bestellungen</h2>
    <div v-if="loading" class="loading">
      <p>Loading orders...</p>
    </div>
    <div v-if="!loading">
      <div class="search-container">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Suche nach Bestellungen..."
          class="search-input"
        />
      </div>
      <div class="orders-container">
        <section class="active-orders">
          <h3 class="section-title">Aktive Bestellungen</h3>

          <div class="pagination pagination-left">
            <button :disabled="activePage === 1 || activeTotalPages === 0" @click="activePage--">
              Vorherige
            </button>
            <span>Seite {{ activePage }} von {{ activeTotalPages }}</span>
            <button
              :disabled="activePage === activeTotalPages || activeTotalPages === 0"
              @click="activePage++"
            >
              Nächste
            </button>
          </div>

          <div v-if="filteredActiveOrders.length === 0" class="empty">
            <p>Keine aktiven Bestellungen vorhanden.</p>
          </div>
          <div v-else class="order-list">
            <div v-for="order in paginatedActiveOrders" :key="order.id" class="order-item">
              <div class="order-header">
                <p class="order-id"><strong>Order ID:</strong> {{ order.id }}</p>
                <p class="order-status"><strong>Status:</strong> {{ order.orderStatus }}</p>
                <p class="order-total">
                  <strong>Gesamt:</strong> €{{ order.totalAmount.toFixed(2) }}
                </p>
                <p class="order-date">
                  <strong>Bestellt am:</strong> {{ formatDate(order.createdAt) }}
                </p>
              </div>
              <div class="order-details-text">
                <p>
                  <strong>Bezahlmethode:</strong>
                  {{ order.payment?.paymentOption || 'Keine Angaben' }}
                </p>
                <template v-if="order.payment?.paymentOption === 'bank transfer'">
                  <p><strong>IBAN:</strong> {{ order.payment.iban }}</p>
                </template>
                <template v-else-if="order.payment?.paymentOption === 'credit card'">
                  <p><strong>Kreditkartennummer:</strong> {{ order.payment.creditCardNumber }}</p>
                  <p><strong>Ablaufdatum:</strong> {{ order.payment.expiryDate }}</p>
                </template>
                <template v-else-if="order.payment?.paymentOption === 'paypal'">
                  <p><strong>PayPal Email:</strong> {{ order.payment.paypalEmail }}</p>
                </template>
              </div>
              <div class="order-details-text">
                <p><strong>Lieferstatus:</strong> {{ order.shipping.deliveryStatus }}</p>
                <p>
                  <strong>Lieferadresse:</strong>
                  {{ order.shipping.address.street }} {{ order.shipping.address.houseNumber }},
                  {{ order.shipping.address.city }}, {{ order.shipping.address.postalCode }}
                </p>
                <p>
                  <strong>Voraussichtliche Lieferung:</strong>
                  {{ formatDate(order.shipping.estimatedDeliveryDate) }}
                </p>
              </div>
              <div v-if="order.orderProducts.length > 0" class="order-products">
                <p class="products-header"><strong>Produkte:</strong></p>
                <div class="product-list-container">
                  <ul class="product-list">
                    <li
                      v-for="product in order.orderProducts"
                      :key="product.id"
                      class="product-item"
                    >
                      <a :href="`/product/${product.product.id}`" class="product-link">
                        <img
                          :src="product.product.image"
                          :alt="product.product.name"
                          class="product-image"
                        />
                        <div class="product-info">
                          <p class="product-name">{{ product.product.name }}</p>
                          <p class="product-quantity">
                            {{ product.quantity }}x (€{{ product.product.price.toFixed(2) }})
                          </p>
                        </div>
                      </a>
                    </li>
                  </ul>
                </div>
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
        </section>

        <section class="order-history">
          <h3 class="section-title">Bestellhistorie</h3>

          <div class="pagination pagination-right">
            <button :disabled="historyPage === 1 || historyTotalPages === 0" @click="historyPage--">
              Vorherige
            </button>
            <span>Seite {{ historyPage }} von {{ historyTotalPages }}</span>
            <button
              :disabled="historyPage === historyTotalPages || historyTotalPages === 0"
              @click="historyPage++"
            >
              Nächste
            </button>
          </div>

          <div v-if="filteredHistoricalOrders.length === 0" class="empty">
            <p>Keine abgeschlossenen Bestellungen vorhanden.</p>
          </div>
          <div v-else class="order-list">
            <div v-for="order in paginatedHistoricalOrders" :key="order.id" class="order-item">
              <div class="order-header">
                <p class="order-id"><strong>Order ID:</strong> {{ order.id }}</p>
                <p class="order-status"><strong>Status:</strong> {{ order.orderStatus }}</p>
                <p class="order-total">
                  <strong>Gesamt:</strong> €{{ order.totalAmount.toFixed(2) }}
                </p>
                <p class="order-date">
                  <strong>Bestellt am:</strong> {{ formatDate(order.createdAt) }}
                </p>
              </div>
              <div class="order-details-text">
                <p>
                  <strong>Bezahlmethode:</strong>
                  {{ order.payment?.paymentOption || 'Keine Angaben' }}
                </p>
                <template v-if="order.payment?.paymentOption === 'bank transfer'">
                  <p><strong>IBAN:</strong> {{ order.payment.iban }}</p>
                </template>
                <template v-else-if="order.payment?.paymentOption === 'credit card'">
                  <p><strong>Kreditkartennummer:</strong> {{ order.payment.creditCardNumber }}</p>
                  <p><strong>Ablaufdatum:</strong> {{ order.payment.expiryDate }}</p>
                </template>
                <template v-else-if="order.payment?.paymentOption === 'paypal'">
                  <p><strong>PayPal Email:</strong> {{ order.payment.paypalEmail }}</p>
                </template>
              </div>
              <div class="order-details-text">
                <p><strong>Lieferstatus:</strong> {{ order.shipping.deliveryStatus }}</p>
                <p>
                  <strong>Lieferadresse:</strong>
                  {{ order.shipping.address.street }} {{ order.shipping.address.houseNumber }},
                  {{ order.shipping.address.city }}, {{ order.shipping.address.postalCode }}
                </p>
                <p>
                  <strong>Voraussichtliche Lieferung:</strong>
                  {{ formatDate(order.shipping.estimatedDeliveryDate) }}
                </p>
              </div>
              <div v-if="order.orderProducts.length > 0" class="order-products">
                <p class="products-header"><strong>Produkte:</strong></p>
                <div class="product-list-container">
                  <ul class="product-list">
                    <li
                      v-for="product in order.orderProducts"
                      :key="product.id"
                      class="product-item"
                    >
                      <a :href="`/product/${product.product.id}`" class="product-link">
                        <img
                          :src="product.product.image"
                          :alt="product.product.name"
                          class="product-image"
                        />
                        <div class="product-info">
                          <p class="product-name">{{ product.product.name }}</p>
                          <p class="product-quantity">
                            {{ product.quantity }}x (€{{ product.product.price.toFixed(2) }})
                          </p>
                        </div>
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import axios from 'axios'
import BackButton from '@/components/navigation/BackButton.vue'
import Swal from 'sweetalert2'

const orders = ref([])
const loading = ref(false)
const searchQuery = ref('')
const activePage = ref(1)
const historyPage = ref(1)
const itemsPerPage = 5

const fetchOrders = async () => {
  loading.value = true
  try {
    const { data } = await axios.get('/api/order/detail')
    orders.value = data
  } catch (error) {
    console.error('Error loading orders:', error)
    await Swal.fire({
      title: 'Fehler',
      text: error.response?.data?.error || 'Ein unbekannter Fehler ist aufgetreten.',
      icon: 'error',
      confirmButtonText: 'OK',
    })
  } finally {
    loading.value = false
  }
}

const sortedOrders = computed(() => {
  return [...orders.value].sort((a, b) => b.updatedAt - a.updatedAt)
})

const activeOrders = computed(() => {
  return sortedOrders.value.filter((order) => ['open', 'processing'].includes(order.orderStatus))
})

const historicalOrders = computed(() => {
  return sortedOrders.value.filter((order) =>
    ['failed', 'successful', 'refunded', 'canceled'].includes(order.orderStatus),
  )
})

const filteredActiveOrders = computed(() => {
  return activeOrders.value.filter(
    (order) =>
      order.id.toString().includes(searchQuery.value) ||
      order.orderProducts.some((product) =>
        product.product.name.toLowerCase().includes(searchQuery.value.toLowerCase()),
      ),
  )
})

const filteredHistoricalOrders = computed(() => {
  return historicalOrders.value.filter(
    (order) =>
      order.id.toString().includes(searchQuery.value) ||
      order.orderProducts.some((product) =>
        product.product.name.toLowerCase().includes(searchQuery.value.toLowerCase()),
      ),
  )
})

const paginatedActiveOrders = computed(() => {
  const start = (activePage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredActiveOrders.value.slice(start, end)
})

const paginatedHistoricalOrders = computed(() => {
  const start = (historyPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredHistoricalOrders.value.slice(start, end)
})

const activeTotalPages = computed(() => {
  return Math.ceil(filteredActiveOrders.value.length / itemsPerPage)
})

const historyTotalPages = computed(() => {
  return Math.ceil(filteredHistoricalOrders.value.length / itemsPerPage)
})

const formatDate = (timestamp) => {
  const date = new Date(timestamp)
  return date.toLocaleDateString('de-DE')
}

const cancelOrder = async (orderId) => {
  try {
    const order = orders.value.find((o) => o.id === orderId)
    if (!order) {
      Swal.fire({
        title: 'Bestellung nicht gefunden',
        text: 'Die angegebene Bestellung existiert nicht.',
        icon: 'warning',
        confirmButtonText: 'OK',
      })
      return
    }

    if (!['open', 'processing'].includes(order.orderStatus)) {
      Swal.fire({
        title: 'Stornierung nicht möglich',
        text: 'Nur offene oder in Bearbeitung befindliche Bestellungen können storniert werden.',
        icon: 'info',
        confirmButtonText: 'OK',
      })
      return
    }

    const result = await Swal.fire({
      title: 'Bestellung stornieren?',
      text: 'Möchten Sie diese Bestellung wirklich stornieren? Dies kann nicht rückgängig gemacht werden.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Ja, stornieren',
      cancelButtonText: 'Abbrechen',
    })

    if (!result.isConfirmed) {
      return
    }

    await axios.patch(`/api/order/${orderId}/cancel`)
    order.orderStatus = 'canceled'

    await Swal.fire({
      title: 'Erfolgreich storniert',
      text: 'Die Bestellung wurde erfolgreich storniert.',
      icon: 'success',
      confirmButtonText: 'OK',
    })
  } catch (error) {
    console.error('Fehler beim Stornieren der Bestellung:', error)
    await Swal.fire({
      title: 'Fehler',
      text: error.response?.data?.error || 'Die Bestellung konnte nicht storniert werden.',
      icon: 'error',
      confirmButtonText: 'OK',
    })
  }
}

fetchOrders()
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
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.loading {
  text-align: center;
  color: #666;
}

.empty {
  text-align: center;
  color: #999;
}

.section-title {
  text-align: center;
  font-size: 1.5rem;
  margin-top: 20px;
  margin-bottom: 20px;
  color: #555;
}

.orders-container {
  display: flex;
  justify-content: space-between;
  gap: 20px;
}

.order-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 100%;
}

.order-item {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  background-color: #fff;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.order-item:hover {
  transform: translateY(-5px);
}

.order-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 15px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.order-details-text {
  margin-top: 10px;
  font-size: 14px;
  color: #555;
  border-top: 1px solid #eee;
  padding-top: 10px;
}

.order-products {
  margin-top: 15px;
}

.products-header {
  margin-bottom: 10px;
  font-size: 16px;
  font-weight: bold;
}

.product-list-container {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 10px;
  background-color: #fafafa;
}

.product-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.product-item {
  display: flex;
  align-items: center;
  gap: 15px;
}

.product-link {
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 10px;
  color: inherit;
}

.product-link:hover .product-name {
  text-decoration: underline;
}

.product-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
}

.product-info {
  flex: 1;
}

.product-name {
  font-weight: bold;
  margin: 0;
}

.product-quantity {
  margin: 0;
  font-size: 14px;
  color: #666;
}

.order-actions {
  margin-top: 20px;
  text-align: right;
}

.cancel-button {
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 10px 15px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.cancel-button:hover {
  background-color: #d32f2f;
}

.search-container {
  margin-bottom: 20px;
  text-align: center;
}

.search-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 20px;
}

.pagination-left {
  justify-content: center;
  margin-bottom: 7px;
}

.pagination-right {
  justify-content: center;
  margin-bottom: 7px;
}

.pagination button {
  padding: 10px 15px;
  border: 1px solid #ddd;
  background-color: #f5f5f5;
  cursor: pointer;
  border-radius: 5px;
  transition: background-color 0.2s;
}

.pagination button:disabled {
  background-color: #ddd;
  cursor: not-allowed;
}

.pagination span {
  font-size: 16px;
}
</style>
