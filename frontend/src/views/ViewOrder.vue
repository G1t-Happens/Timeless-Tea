<template>
  <div class="view-order" v-if="order">
    <BackButton />
    <header class="order-header">
      <h2 class="page-title">Bestellung #{{ order.id }}</h2>
      <span :class="['status', order.orderStatus]">{{ getStatusLabel(order.orderStatus) }}</span>
    </header>

    <main>
      <!-- Gesamtübersicht -->
      <section class="order-summary">
        <div class="summary-card">
          <h3>Bestellübersicht</h3>
          <ul>
            <li>
              <span>Gesamtbetrag:</span>
              <span>{{ formatCurrency(order.totalAmount) }}</span>
            </li>
            <li>
              <span>Erstellt:</span>
              <span>{{ formatDate(order.createdAt) }}</span>
            </li>
            <li>
              <span>Aktualisiert:</span>
              <span>{{ formatDate(order.updatedAt) }}</span>
            </li>
          </ul>
        </div>
      </section>

      <!-- Benutzerinformationen -->
      <section class="info-section">
        <h3>Benutzerinformationen</h3>
        <ul>
          <li><strong>Benutzer ID:</strong> {{ order.user.id }}</li>
          <li><strong>Vorname:</strong> {{ order.user.firstName }}</li>
          <li><strong>Nachname:</strong> {{ order.user.lastName }}</li>
          <li><strong>Email:</strong> {{ order.user.emailAddress }}</li>
        </ul>
      </section>

      <!-- Versandinformationen -->
      <section class="info-section">
        <h3>Versandinformationen</h3>
        <ul>
          <li><strong>Versanddienst:</strong> {{ order.shipping.carrier }}</li>
          <li><strong>Lieferstatus:</strong> {{ order.shipping.deliveryStatus }}</li>
          <li>
            <strong>Lieferdatum:</strong> {{ formatDate(order.shipping.estimatedDeliveryDate) }}
          </li>
          <li><strong>Versanddatum:</strong> {{ formatDate(order.shipping.shippingDate) }}</li>
        </ul>
        <hr class="section-divider" />
        <h4>Lieferadresse</h4>
        <ul class="address">
          <li><strong>Land:</strong> {{ order.shipping.address.country }}</li>
          <li><strong>Stadt:</strong> {{ order.shipping.address.city }}</li>
          <li><strong>Postleitzahl:</strong> {{ order.shipping.address.postalCode }}</li>
          <li><strong>Straße:</strong> {{ order.shipping.address.street }}</li>
          <li><strong>Hausnummer:</strong> {{ order.shipping.address.houseNumber }}</li>
          <li v-if="order.shipping.address.addressAddition">
            <strong>Zusatz:</strong>
            {{ order.shipping.address.addressAddition }}
          </li>
        </ul>
      </section>

      <!-- Zahlungsinformationen -->
      <section class="info-section">
        <h3>Zahlungsinformationen</h3>
        <ul>
          <li><strong>Zahlungsmethode:</strong> {{ order.payment.paymentOption }}</li>
          <template v-if="order.payment.paymentOption === 'credit card'">
            <li>
              <strong>Kreditkartennummer:</strong> {{ maskCard(order.payment.creditCardNumber) }}
            </li>
            <li><strong>Ablaufdatum:</strong> {{ order.payment.expiryDate }}</li>
          </template>
          <template v-if="order.payment.paymentOption === 'paypal'">
            <li><strong>PayPal Email:</strong> {{ order.payment.paypalEmail }}</li>
          </template>
          <template v-if="order.payment.paymentOption === 'bank transfer'">
            <li><strong>IBAN:</strong> {{ order.payment.iban }}</li>
          </template>
        </ul>
      </section>

      <!-- Produkte -->
      <section class="products-section">
        <h3>Produkte</h3>
        <div class="product-list">
          <div v-for="product in order.orderProducts" :key="product.id" class="product-card">
            <img :src="product.product.image" :alt="product.product.name" />
            <div class="product-info">
              <h4>{{ product.product.name }}</h4>
              <p>{{ product.product.description }}</p>
              <ul>
                <li><strong>Preis:</strong> {{ formatCurrency(product.product.price) }}</li>
                <li><strong>Menge:</strong> {{ product.quantity }}</li>
                <li>
                  <strong>Gesamt:</strong>
                  {{ formatCurrency(product.product.price * product.quantity) }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </main>
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

// Map status to user-friendly labels
const getStatusLabel = (status) => {
  const labels = {
    open: 'Offen',
    processing: 'In Bearbeitung',
    successful: 'Erfolgreich',
    failed: 'Fehlgeschlagen',
    canceled: 'Storniert',
  }
  return labels[status] || status
}

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
    const { data } = await axios.get(`/api/order/${orderId}`) // API-Aufruf
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
/* Allgemeine Layout-Stile */
.view-order {
  font-family: 'Arial', sans-serif;
  padding: 20px;
  max-width: 1000px;
  margin: auto;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.page-title {
  font-size: 2rem;
  font-weight: bold;
  color: #4a4a4a;
}

.status {
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: bold;
  text-transform: capitalize;
  color: white;
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
  background-color: #e74c3c;
}

.status.canceled {
  background-color: #eb3b5a;
}

/* Stile für Sektionen */
.info-section,
.products-section,
.order-summary {
  margin-bottom: 20px;
  padding: 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.info-section h3,
.products-section h3,
.order-summary h3 {
  margin-bottom: 20px;
  font-size: 1.5rem;
  color: #333;
}

.info-section ul,
.products-section ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.info-section ul li,
.products-section ul li {
  margin-bottom: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1rem;
  color: #555;
}

.address li {
  font-size: 0.9rem;
  color: #666;
}

/* Produkte */
.product-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.product-card {
  display: flex;
  background: #f9f9f9;
  padding: 15px;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  gap: 15px;
  align-items: flex-start;
}

.product-card img {
  width: 100px;
  height: auto;
  border-radius: 8px;
  object-fit: cover;
}

.product-info h4 {
  font-size: 1.2rem;
  margin-bottom: 10px;
  color: #333;
}

.product-info ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.product-info ul li {
  font-size: 0.9rem;
  margin-bottom: 5px;
  color: #666;
}

/* Ladezustand */
.loading {
  text-align: center;
  font-size: 1.5rem;
  margin-top: 50px;
}
</style>
