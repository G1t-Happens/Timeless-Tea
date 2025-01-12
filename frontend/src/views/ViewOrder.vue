<template>
  <div class="view-order" v-if="order">
    <!-- Verwende die BackButton-Komponente -->
    <BackButton />
    <div class="order-header">
      <h2 class="page-title">Bestellung ID: {{ order.id }}</h2>
      <span :class="['status', order.orderStatus]">{{ order.orderStatus }}</span>
    </div>

    <div class="order-overview">
      <p><strong>Gesamtbetrag:</strong> {{ formatCurrency(order.totalAmount) }}</p>
      <p><strong>Erstellt am:</strong> {{ formatDate(order.createdAt) }}</p>
      <p><strong>Aktualisiert am:</strong> {{ formatDate(order.updatedAt) }}</p>
    </div>

    <div class="order-sections">
      <!-- Benutzerinformationen -->
      <section class="order-section">
        <h2>Benutzerinformationen</h2>
        <div class="info-grid">
          <p><strong>Vorname:</strong> {{ order.user.firstName }}</p>
          <p><strong>Nachname:</strong> {{ order.user.lastName }}</p>
          <p><strong>Email:</strong> {{ order.user.emailAddress }}</p>
        </div>
      </section>

      <!-- Versandinformationen -->
      <section class="order-section">
        <h2>Versandinformationen</h2>
        <div class="info-grid">
          <p><strong>Versanddienst:</strong> {{ order.shipping.carrier }}</p>
          <p><strong>Lieferstatus:</strong> {{ order.shipping.deliveryStatus }}</p>
          <p>
            <strong>Voraussichtliches Lieferdatum:</strong>
            {{ formatDate(order.shipping.estimatedDeliveryDate) }}
          </p>
          <p><strong>Versanddatum:</strong> {{ formatDate(order.shipping.shippingDate) }}</p>
        </div>
      </section>

      <!-- Zahlungsinformationen -->
      <section class="order-section">
        <h2>Zahlungsinformationen</h2>
        <div class="info-grid">
          <p><strong>Zahlungsmethode:</strong> {{ order.payment.paymentOption }}</p>
          <template v-if="order.payment.paymentOption === 'credit card'">
            <p>
              <strong>Kreditkartennummer:</strong> {{ maskCard(order.payment.creditCardNumber) }}
            </p>
            <p><strong>Ablaufdatum:</strong> {{ order.payment.expiryDate }}</p>
          </template>
          <template v-if="order.payment.paymentOption === 'paypal'">
            <p><strong>PayPal Email:</strong> {{ order.payment.paypalEmail }}</p>
          </template>
          <template v-if="order.payment.paymentOption === 'bank transfer'">
            <p><strong>IBAN:</strong> {{ order.payment.iban }}</p>
          </template>
        </div>
      </section>

      <!-- Produktinformationen -->
      <section class="order-section">
        <h2>Produkte</h2>
        <div class="product-list">
          <div v-for="product in order.orderProducts" :key="product.id" class="product-item">
            <img :src="product.product.image" :alt="product.product.name" />
            <div>
              <h3>{{ product.product.name }}</h3>
              <p><strong>Beschreibung:</strong> {{ product.product.description }}</p>
              <p><strong>Preis:</strong> {{ formatCurrency(product.product.price) }}</p>
              <p><strong>Menge:</strong> {{ product.quantity }}</p>
              <p>
                <strong>Gesamt:</strong>
                {{ formatCurrency(product.product.price * product.quantity) }}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
  <div v-else class="loading">
    <p>Bestelldaten werden geladen...</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import BackButton from '@/components/navigation/BackButton.vue'

// Router hook
const route = useRoute()
const order = ref(null) // Bestellung wird hier gespeichert

// Hilfsfunktionen für Formatierungen
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount)
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('de-DE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const maskCard = (cardNumber) => {
  return cardNumber?.replace(/\d{12}(\d{4})/, '**** **** **** $1') || 'Keine Daten'
}

// Bestellung von der API laden
const fetchOrder = async () => {
  try {
    const orderId = route.params.id // ID aus der URL
    const { data } = await axios.get(`/order/${orderId}`) // API-Aufruf
    order.value = data // Daten speichern
  } catch (error) {
    console.error('Fehler beim Laden der Bestellung:', error)
  }
}

// Daten beim Laden der Komponente holen
onMounted(() => {
  fetchOrder()
})
</script>

<style scoped>
/* Titel */
.page-title {
  text-align: center;
  margin-top: 30px;
  font-size: 1.8rem;
  color: #333;
}

.view-order {
  padding: 20px;
  max-width: 1200px;
  margin: auto;
  font-family: Arial, sans-serif;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.order-header h1 {
  font-size: 2rem;
  margin: 0;
  color: #333;
}

.status {
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 1rem;
  font-weight: bold;
  text-transform: capitalize;
  color: #fff;
}

.status.open {
  background-color: #f7b731;
}

.status.processing {
  background-color: #3498db;
}

.status.successful {
  background-color: #20bf6b;
}

.status.failed {
  background-color: #eb3b5a;
}

.status.canceled {
  background-color: #95a5a6;
}

.order-overview {
  margin-bottom: 20px;
  font-size: 1.1rem;
}

.order-overview p {
  margin: 0;
  line-height: 1.8;
  color: #555;
}

.order-sections {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.order-section {
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
}

.order-section h2 {
  margin-top: 0;
  color: #333;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 10px;
}

.product-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.product-item {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.product-item img {
  max-width: 150px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.product-item h3 {
  margin: 0 0 10px;
  font-size: 1.25rem;
}

.loading {
  text-align: center;
  margin-top: 50px;
  font-size: 1.5rem;
  color: #555;
}
</style>
