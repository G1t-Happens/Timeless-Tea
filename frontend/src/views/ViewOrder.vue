<template>
  <div class="view-order" v-if="order">
    <BackButton />
    <h2 class="page-title">Bestellung #{{ order.id }}</h2>
    <div class="page-title">
      <span :class="['status', order.orderStatus]">{{ getStatusLabel(order.orderStatus) }}</span>
    </div>
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

      <!-- Bestellstatus bearbeiten -->
      <section class="info-section">
        <h3>Status der Bestellung</h3>
        <form @submit.prevent="saveOrderStatus">
          <div class="form-group">
            <label for="orderStatus">Bestellstatus:</label>
            <select id="orderStatus" v-model="editableOrderStatus" required>
              <option value="open">Offen</option>
              <option value="processing">In Bearbeitung</option>
              <option value="successful">Erfolgreich</option>
              <option value="failed">Fehlgeschlagen</option>
              <option value="refunded">Erstattet</option>
              <option value="canceled">Storniert</option>
            </select>
          </div>
          <button
            type="submit"
            class="btn"
            :disabled="!isOrderStatusChanged"
            :class="{ 'btn-disabled': !isOrderStatusChanged }"
          >
            Aktualisieren
          </button>
        </form>
      </section>

      <!-- Versandinformationen -->
      <section class="info-section">
        <h3>Versandinformationen</h3>
        <form @submit.prevent="saveShippingInfo">
          <div class="form-group">
            <label for="carrier">Versanddienst:</label>
            <input type="text" id="carrier" v-model="editableShipping.carrier" required />
          </div>
          <div class="form-group">
            <label for="deliveryStatus">Lieferstatus:</label>
            <select id="deliveryStatus" v-model="editableShipping.deliveryStatus" required>
              <option value="not shipped">Nicht versandt</option>
              <option value="shipped">Versandt</option>
              <option value="delivered">Geliefert</option>
            </select>
          </div>
          <div class="form-group">
            <label for="estimatedDeliveryDate">Geschätztes Lieferdatum:</label>
            <input
              type="date"
              id="estimatedDeliveryDate"
              v-model="editableShipping.estimatedDeliveryDate"
              required
            />
          </div>
          <div class="form-group">
            <label for="shippingDate">Versanddatum:</label>
            <input type="date" id="shippingDate" v-model="editableShipping.shippingDate" required />
          </div>
          <button
            type="submit"
            class="btn"
            :disabled="!isShippingChanged"
            :class="{ 'btn-disabled': !isShippingChanged }"
          >
            Aktualisieren
          </button>
        </form>
        <hr class="section-divider" />
        <h4>Lieferadresse</h4>
        <form @submit.prevent="saveDeliveryAddress">
          <div class="form-group">
            <label for="country">Land:</label>
            <input type="text" id="country" v-model="editableAddress.country" required />
          </div>
          <div class="form-group">
            <label for="state">Bundesland(optional):</label>
            <input type="text" id="state" v-model="editableAddress.state" />
          </div>
          <div class="form-group">
            <label for="city">Stadt:</label>
            <input type="text" id="city" v-model="editableAddress.city" required />
          </div>
          <div class="form-group">
            <label for="postalCode">Postleitzahl:</label>
            <input type="text" id="postalCode" v-model="editableAddress.postalCode" required />
          </div>
          <div class="form-group">
            <label for="street">Straße:</label>
            <input type="text" id="street" v-model="editableAddress.street" required />
          </div>
          <div class="form-group">
            <label for="houseNumber">Hausnummer:</label>
            <input type="text" id="houseNumber" v-model="editableAddress.houseNumber" required />
          </div>
          <div class="form-group" v-if="order.shipping.address.addressAddition">
            <label for="addressAddition">Zusatz:</label>
            <input type="text" id="addressAddition" v-model="editableAddress.addressAddition" />
          </div>
          <button
            type="submit"
            class="btn"
            :disabled="!isAddressChanged"
            :class="{ 'btn-disabled': !isAddressChanged }"
          >
            Aktualisieren
          </button>
        </form>
      </section>

      <!-- Zahlungsinformationen -->
      <section class="info-section">
        <h3>Zahlungsinformationen</h3>
        <form @submit.prevent="savePaymentInfo">
          <div class="form-group">
            <label for="paymentOption">Zahlungsmethode:</label>
            <select id="paymentOption" v-model="editablePayment.paymentOption" required>
              <option value="credit card">Kreditkarte</option>
              <option value="paypal">PayPal</option>
              <option value="bank transfer">Banküberweisung</option>
            </select>
          </div>

          <div v-if="editablePayment.paymentOption === 'credit card'">
            <div class="form-group">
              <label for="creditCardNumber">Kreditkartennummer:</label>
              <input
                type="text"
                id="creditCardNumber"
                v-model="editablePayment.creditCardNumber"
                required
              />
            </div>
            <div class="form-group">
              <label for="expiryDate">Ablaufdatum:</label>
              <input type="month" id="expiryDate" v-model="editablePayment.expiryDate" required />
            </div>
          </div>

          <div v-if="editablePayment.paymentOption === 'paypal'">
            <div class="form-group">
              <label for="paypalEmail">PayPal Email:</label>
              <input type="email" id="paypalEmail" v-model="editablePayment.paypalEmail" required />
            </div>
          </div>

          <div v-if="editablePayment.paymentOption === 'bank transfer'">
            <div class="form-group">
              <label for="iban">IBAN:</label>
              <input type="text" id="iban" v-model="editablePayment.iban" required />
            </div>
          </div>

          <button
            type="submit"
            class="btn"
            :disabled="!isPaymentChanged"
            :class="{ 'btn-disabled': !isPaymentChanged }"
          >
            Aktualisieren
          </button>
        </form>
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
import { ref, onMounted, reactive, computed } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import BackButton from '@/components/navigation/BackButton.vue'
import Swal from 'sweetalert2'

// Router hook
const route = useRoute()
const order = ref(null) // Bestellung wird hier gespeichert

// Reaktive Objekte für bearbeitbare Felder
const editableOrderStatus = ref('')
const editableShipping = reactive({
  carrier: '',
  deliveryStatus: '',
  estimatedDeliveryDate: '',
  shippingDate: '',
})

const editableAddress = reactive({
  country: '',
  state: '',
  city: '',
  postalCode: '',
  street: '',
  houseNumber: '',
  addressAddition: '',
})

const editablePayment = reactive({
  paymentOption: '',
  creditCardNumber: '',
  expiryDate: '',
  paypalEmail: '',
  iban: '',
})

// Map status to user-friendly labels
const getStatusLabel = (status) => {
  const labels = {
    open: 'Offen',
    processing: 'In Bearbeitung',
    successful: 'Erfolgreich',
    failed: 'Fehlgeschlagen',
    refunded: 'Erstattet',
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
  if (!date) return 'Kein Datum'
  return new Date(date).toLocaleDateString('de-DE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// Computed Properties zur Überprüfung von Änderungen

// Bestellstatus geändert?
const isOrderStatusChanged = computed(() => {
  return editableOrderStatus.value !== (order.value?.orderStatus || '')
})

// Versandinformationen geändert?
const isShippingChanged = computed(() => {
  if (!order.value?.shipping) return false
  return (
    editableShipping.carrier !== order.value.shipping.carrier ||
    editableShipping.deliveryStatus !== order.value.shipping.deliveryStatus ||
    editableShipping.estimatedDeliveryDate !==
      formatInputDate(order.value.shipping.estimatedDeliveryDate) ||
    editableShipping.shippingDate !== formatInputDate(order.value.shipping.shippingDate)
  )
})

// Lieferadresse geändert?
const isAddressChanged = computed(() => {
  if (!order.value?.shipping?.address) return false
  return (
    editableAddress.country !== order.value.shipping.address.country ||
    editableAddress.city !== order.value.shipping.address.city ||
    editableAddress.postalCode !== order.value.shipping.address.postalCode ||
    editableAddress.street !== order.value.shipping.address.street ||
    editableAddress.houseNumber !== order.value.shipping.address.houseNumber ||
    (editableAddress.addressAddition || '') !== (order.value.shipping.address.addressAddition || '')
  )
})

// Zahlungsinformationen geändert?
const isPaymentChanged = computed(() => {
  if (!order.value?.payment) return false
  return (
    editablePayment.paymentOption !== order.value.payment.paymentOption ||
    (editablePayment.paymentOption === 'credit card' &&
      editablePayment.creditCardNumber !== order.value.payment.creditCardNumber) ||
    (editablePayment.paymentOption === 'credit card' &&
      editablePayment.expiryDate !== formatInputMonth(order.value.payment.expiryDate)) ||
    (editablePayment.paymentOption === 'paypal' &&
      editablePayment.paypalEmail !== order.value.payment.paypalEmail) ||
    (editablePayment.paymentOption === 'bank transfer' &&
      editablePayment.iban !== order.value.payment.iban)
  )
})

// Bestellung von der API laden
const fetchOrder = async () => {
  try {
    const orderId = route.params.id // ID aus der URL
    const { data } = await axios.get(`/api/order/${orderId}`) // API-Aufruf
    order.value = data // Daten speichern
    populateEditableFields()
  } catch (error) {
    console.error('Fehler beim Laden der Bestellung:', error)
  }
}

// Reaktive Felder mit den aktuellen Bestelldaten füllen
const populateEditableFields = () => {
  if (order.value) {
    // Bestellstatus
    editableOrderStatus.value = order.value.orderStatus

    // Versandinformationen
    editableShipping.carrier = order.value.shipping.carrier
    editableShipping.deliveryStatus = order.value.shipping.deliveryStatus

    // Konvertiere ISO 8601 oder Timestamp in 'YYYY-MM-DD' für die Date-Eingaben
    editableShipping.estimatedDeliveryDate = formatInputDate(
      order.value.shipping.estimatedDeliveryDate,
    )
    editableShipping.shippingDate = formatInputDate(order.value.shipping.shippingDate)

    // Lieferadresse
    editableAddress.country = order.value.shipping.address.country
    editableAddress.city = order.value.shipping.address.city
    editableAddress.postalCode = order.value.shipping.address.postalCode
    editableAddress.street = order.value.shipping.address.street
    editableAddress.houseNumber = order.value.shipping.address.houseNumber
    editableAddress.addressAddition = order.value.shipping.address.addressAddition || ''

    // Zahlungsinformationen
    editablePayment.paymentOption = order.value.payment.paymentOption
    editablePayment.creditCardNumber = order.value.payment.creditCardNumber || ''
    editablePayment.expiryDate = order.value.payment.expiryDate
      ? formatInputMonth(order.value.payment.expiryDate)
      : ''
    editablePayment.paypalEmail = order.value.payment.paypalEmail || ''
    editablePayment.iban = order.value.payment.iban || ''
  }
}

// Hilfsfunktion zur Formatierung von Datumseingaben (YYYY-MM-DD)
const formatInputDate = (date) => {
  if (!date) return ''

  const parsedDate = new Date(date)

  // Überprüfen, ob das Datum gültig ist
  if (isNaN(parsedDate.getTime())) {
    console.warn('Ungültiges Datum:', date)
    return ''
  }

  const year = parsedDate.getFullYear()
  const month = String(parsedDate.getMonth() + 1).padStart(2, '0')
  const day = String(parsedDate.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

// Hilfsfunktion zur Formatierung von Monatseingaben (YYYY-MM)
const formatInputMonth = (date) => {
  if (!date) return ''
  const parsedDate = new Date(date)
  const year = parsedDate.getFullYear()
  const month = String(parsedDate.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

// Methoden zum Speichern der bearbeiteten Daten
const saveOrderStatus = async () => {
  try {
    const updatedStatus = {
      orderStatus: editableOrderStatus.value,
    }
    await axios.patch(`/api/order/${order.value.id}/status`, updatedStatus)
    order.value.orderStatus = editableOrderStatus.value
    await Swal.fire({
      backdrop: false,
      title: 'Status geupdated!',
      text: `Der Status der Bestellung: "${order.value.id}" wurde erfolgreich geupdated.`,
      icon: 'success',
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
    })
  } catch (error) {
    console.error('Fehler beim Statusupdate der Bestellung:', error)
    await Swal.fire({
      backdrop: false,
      title: 'Fehler beim Statusupdate der Bestellung!',
      text: error.response?.data?.error || 'Ein unbekannter Fehler ist aufgetreten.',
      icon: 'error',
      confirmButtonText: 'OK',
    })
  }
}

const saveShippingInfo = async () => {
  try {
    const updatedShipping = {
      carrier: editableShipping.carrier,
      deliveryStatus: editableShipping.deliveryStatus,
      estimatedDeliveryDate: formatInputDate(
        new Date(editableShipping.estimatedDeliveryDate).toISOString(),
      ),
      shippingDate: formatInputDate(new Date(editableShipping.shippingDate).toISOString()),
    }
    await axios.patch(`/api/order/${order.value.id}/shipping`, updatedShipping)
    order.value.shipping = { ...order.value.shipping, ...updatedShipping }
    await Swal.fire({
      backdrop: false,
      title: 'Versandinformationen geupdated!',
      text: `Die Versandinformation der Bestellung: "${order.value.id}" wurde erfolgreich geupdated.`,
      icon: 'success',
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
    })
  } catch (error) {
    console.error('Fehler beim Updaten der Versandinformation:', error)
    await Swal.fire({
      backdrop: false,
      title: 'Fehler beim Update der Versandinformation der Bestellung!',
      text: error.response?.data?.error || 'Ein unbekannter Fehler ist aufgetreten.',
      icon: 'error',
      confirmButtonText: 'OK',
    })
  }
}

const saveDeliveryAddress = async () => {
  try {
    const updatedAddress = {
      country: editableAddress.country,
      state: editableAddress.state,
      city: editableAddress.city,
      postalCode: editableAddress.postalCode,
      street: editableAddress.street,
      houseNumber: editableAddress.houseNumber,
      addressAddition: editableAddress.addressAddition || null,
    }
    await axios.patch(`/api/order/${order.value.id}/address`, updatedAddress)
    order.value.shipping.address = { ...order.value.shipping.address, ...updatedAddress }
    await Swal.fire({
      backdrop: false,
      title: 'Lieferadresse geupdated!',
      text: `Die Lieferadresse der Bestellung: "${order.value.id}" wurde erfolgreich geupdated.`,
      icon: 'success',
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
    })
  } catch (error) {
    console.error('Fehler beim Updaten der Lieferadresse:', error)
    await Swal.fire({
      backdrop: false,
      title: 'Fehler beim Update der Lieferadresse der Bestellung!',
      text: error.response?.data?.error || 'Ein unbekannter Fehler ist aufgetreten.',
      icon: 'error',
      confirmButtonText: 'OK',
    })
  }
}

const savePaymentInfo = async () => {
  try {
    const updatedPayment = {
      paymentOption: editablePayment.paymentOption,
      creditCardNumber:
        editablePayment.paymentOption === 'credit card' ? editablePayment.creditCardNumber : null,
      expiryDate:
        editablePayment.paymentOption === 'credit card'
          ? new Date(editablePayment.expiryDate + '-01').toISOString()
          : null,
      paypalEmail: editablePayment.paymentOption === 'paypal' ? editablePayment.paypalEmail : null,
      iban: editablePayment.paymentOption === 'bank transfer' ? editablePayment.iban : null,
    }
    await axios.patch(`/api/order/${order.value.id}/payment`, updatedPayment)
    order.value.payment = { ...order.value.payment, ...updatedPayment }
    await Swal.fire({
      backdrop: false,
      title: 'Zahlungsinformationen geupdated!',
      text: `Die Zahlungsinformationen der Bestellung: "${order.value.id}" wurde erfolgreich geupdated.`,
      icon: 'success',
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
    })
  } catch (error) {
    console.error('Fehler beim Update der Zahlungsinformationen:', error)
    await Swal.fire({
      backdrop: false,
      title: 'Fehler beim Update der Zahlungsinformationen der Bestellung!',
      text: error.response?.data?.error || 'Ein unbekannter Fehler ist aufgetreten.',
      icon: 'error',
      confirmButtonText: 'OK',
    })
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
  padding: 30px;
  max-width: 800px;
  margin: 0 auto;
  background-color: #fff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

.page-title {
  font-size: 2rem;
  font-weight: bold;
  color: #4a4a4a;
  text-align: center;
  margin-bottom: 30px;
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

.status.refunded {
  background-color: #8e44ad; /* Beispiel: Lila Farbe für 'Erstattet' */
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

/* Formulare */
form {
  display: flex;
  flex-direction: column;
}

.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 15px;
}

.form-group label {
  margin-bottom: 5px;
  font-weight: bold;
  color: #444;
}

.form-group input,
.form-group select {
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
}

.form-group input:focus,
.form-group select:focus {
  border-color: #3498db;
  outline: none;
}

.btn {
  padding: 10px 15px;
  background-color: #4a5043;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  align-self: flex-start;
  transition: background-color 0.3s ease;
}

.btn:hover {
  background-color: #9fa86d;
}

.btn:active {
  background-color: #9fa86d;
}

/* Ausgegraute Buttons */
.btn-disabled {
  background-color: rgba(75, 80, 67, 0.4);
  cursor: not-allowed;
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

/* Abschnitts-Trenner */
.section-divider {
  margin: 20px 0;
  border: none;
  border-top: 1px solid #eee;
}

/* Responsive Design */
@media (max-width: 768px) {
  .product-card {
    flex-direction: column;
    align-items: center;
  }

  .product-card img {
    width: 80%;
  }

  .form-group {
    width: 100%;
  }
}
</style>
