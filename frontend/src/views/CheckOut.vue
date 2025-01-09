<template>
  <div class="checkout">
    <h1 class="checkout-title">Checkout</h1>
    <BackButton />

    <div v-if="cartStore.items.length === 0" class="empty-cart">
      <p>Ihr Warenkorb ist leer.</p>
      <router-link to="/" class="btn btn-primary">Zurück zum Shop</router-link>
    </div>

    <div v-else class="checkout-container">
      <!-- Bestellübersicht -->
      <div class="order-summary">
        <h2>Bestellübersicht</h2>
        <table class="summary-table">
          <thead>
            <tr>
              <th>Produkt</th>
              <th>Artikel</th>
              <th>Preis (€)</th>
              <th>Gesamt (€)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in cartStore.items" :key="item.productId">
              <td>{{ item.name }}</td>
              <td>{{ item.quantity }}</td>
              <td>{{ item.price.toFixed(2) }}</td>
              <td>{{ (item.price * item.quantity).toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
        <div class="summary-total">
          <strong>Gesamtsumme: {{ cartStore.totalAmount }} €</strong>
        </div>
      </div>

      <!-- Benutzerdetails (Rechnungsadresse) -->
      <div class="user-details">
        <h2>Rechnungsadresse</h2>
        <p class="edit-hint">
          <strong>Hinweis:</strong>
          Falls Sie Ihre Rechnungsadresse ändern möchten, können Sie das
          <router-link :to="`/user/edit-user/${userStore.user.id}`">hier</router-link>
          erledigen.
        </p>
        <div class="detail-item">
          <label for="firstName">Vorname:</label>
          <input id="firstName" type="text" v-model="user.firstName" disabled />
        </div>
        <div class="detail-item">
          <label for="lastName">Nachname:</label>
          <input id="lastName" type="text" v-model="user.lastName" disabled />
        </div>
        <div class="detail-item">
          <label for="email">E-Mail:</label>
          <input id="email" type="email" v-model="user.emailAddress" disabled />
        </div>
        <div class="detail-item">
          <label for="country">Land:</label>
          <input id="country" type="text" v-model="user.address.country" disabled />
        </div>
        <div class="detail-item">
          <label for="postalCode">Postleitzahl:</label>
          <input id="postalCode" type="text" v-model="user.address.postalCode" disabled />
        </div>
        <div class="detail-item">
          <label for="city">Stadt:</label>
          <input id="city" type="text" v-model="user.address.city" disabled />
        </div>
        <div class="detail-item">
          <label for="street">Straße:</label>
          <input id="street" type="text" v-model="user.address.street" disabled />
        </div>
        <div class="detail-item">
          <label for="houseNumber">Hausnummer:</label>
          <input id="houseNumber" type="text" v-model="user.address.houseNumber" disabled />
        </div>
      </div>

      <!-- Zahlungsmethode -->
      <div class="payment-method">
        <h2>Zahlungsmethode</h2>
        <p class="edit-hint">
          <strong>Hinweis:</strong>
          Falls Sie Ihre Zahlungsmethode ändern möchten, können Sie das
          <router-link :to="`/user/edit-user/${userStore.user.id}`">hier</router-link>
          erledigen.
        </p>
        <div v-if="user.payment && user.payment.paymentOption">
          <p>Option: {{ user.payment.paymentOption }}</p>
          <div v-if="user.payment.paymentOption === 'bank transfer'">
            <p>IBAN: {{ obfuscatedIban }}</p>
          </div>
          <div v-else-if="user.payment.paymentOption === 'credit card'">
            <p>Kreditkartennummer: {{ obfuscatedCardNumber }}</p>
            <p>Ablaufdatum: {{ user.payment.expiryDate || 'n/a' }}</p>
          </div>
          <div v-else-if="user.payment.paymentOption === 'paypal'">
            <p>PayPal E-Mail: {{ obfuscatedPaypalEmail }}</p>
          </div>
        </div>
        <div v-else>
          <p>
            Keine Zahlungsmethode hinterlegt. Bitte
            <router-link :to="`/user/edit-user/${userStore.user.id}`">
              hinterlegen Sie Ihre Zahlungsdaten!
            </router-link>
            .
          </p>
        </div>
      </div>

      <!-- Versandinformationen -->
      <div class="shipping-info">
        <h2>Versandinformationen</h2>
        <div class="checkbox-wrapper">
          <input type="checkbox" id="use-billing-as-shipping" v-model="useBillingAsShipping" />
          <label for="use-billing-as-shipping">
            Versandadresse ist identisch mit der Rechnungsadresse
          </label>
        </div>
        <div v-if="useBillingAsShipping">
          <p>Die Versandadresse entspricht der oben angegebenen Rechnungsadresse.</p>
        </div>
        <div v-else>
          <div class="detail-item">
            <label for="ship-country">Land*:</label>
            <input id="ship-country" type="text" v-model="shippingAddress.country" />
          </div>
          <div class="detail-item">
            <label for="ship-postal-code">Postleitzahl*:</label>
            <input id="ship-postal-code" type="text" v-model="shippingAddress.postalCode" />
          </div>
          <div class="detail-item">
            <label for="ship-city">Stadt*:</label>
            <input id="ship-city" type="text" v-model="shippingAddress.city" />
          </div>
          <div class="detail-item">
            <label for="ship-street">Straße*:</label>
            <input id="ship-street" type="text" v-model="shippingAddress.street" />
          </div>
          <div class="detail-item">
            <label for="ship-house-number">Hausnummer*:</label>
            <input id="ship-house-number" type="text" v-model="shippingAddress.houseNumber" />
          </div>
          <div class="detail-item">
            <label for="ship-addition">Adresszusatz (optional):</label>
            <input id="ship-addition" type="text" v-model="shippingAddress.addressAddition" />
          </div>
          <div class="detail-item">
            <label for="ship-state">Bundesland (optional):</label>
            <input id="ship-state" type="text" v-model="shippingAddress.state" />
          </div>
        </div>
      </div>

      <!-- Bestellung abschicken -->
      <div class="checkout-actions">
        <button @click="openConfirmationModal" class="btn btn-success" :disabled="!canCheckout">
          Bestellung abschicken
        </button>
      </div>
    </div>

    <!-- PaymentModal -->
    <PaymentModal :show="showPaymentModal" :payment="user.payment" @close="closePaymentModal" />

    <!-- OrderConfirmationModal -->
    <OrderConfirmationModal
      :show="showConfirmationModal"
      :user="user"
      :cartItems="cartStore.items"
      :totalAmount="Number(cartStore.totalAmount)"
      :payment="user.payment"
      :useBillingAsShipping="useBillingAsShipping"
      :shippingAddress="shippingAddress"
      @close="closeConfirmationModal"
      @confirm="handleConfirmOrder"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useCartStore } from '@/stores/shoppingCart.js'
import { useUserStore } from '@/stores/user.js'
import { useRouter } from 'vue-router'
import axios from 'axios'
import BackButton from '@/components/navigation/BackButton.vue'
import PaymentModal from '@/components/PaymentModal.vue'
import OrderConfirmationModal from '@/components/OrderConfirmationModal.vue'

const cartStore = useCartStore()
const userStore = useUserStore()
const router = useRouter()

const user = ref({
  id: null,
  emailAddress: '',
  firstName: '',
  lastName: '',
  address: {
    id: null,
    street: '',
    houseNumber: '',
    addressAddition: '',
    city: '',
    postalCode: '',
    country: '',
  },
  payment: {
    paymentOption: null,
    iban: null,
    creditCardNumber: null,
    expiryDate: null,
    cvc: null,
    paypalEmail: null,
  },
})

const showPaymentModal = ref(false)
const showConfirmationModal = ref(false)
const useBillingAsShipping = ref(true)
const shippingAddress = ref({
  id: null,
  street: '',
  houseNumber: '',
  addressAddition: '',
  city: '',
  postalCode: '',
  state: '',
  country: '',
})

const canCheckout = computed(() => {
  return cartStore.items.length > 0 && userStore.user && user.value.address && user.value.payment
})
const closePaymentModal = () => {
  showPaymentModal.value = false
}

const openConfirmationModal = () => {
  showConfirmationModal.value = true
}
const closeConfirmationModal = () => {
  showConfirmationModal.value = false
}

const handleConfirmOrder = async () => {
  closeConfirmationModal()
  await submitOrder()
}

const fetchUser = async () => {
  try {
    const response = await axios.get(`/user/${userStore.user.id}`)
    user.value = response.data
  } catch (error) {
    console.error('Fehler beim Laden des Benutzers:', error)
  }
}

onMounted(async () => {
  await fetchUser()
})

watch(useBillingAsShipping, (newVal) => {
  if (newVal) {
    shippingAddress.value = {
      id: null,
      street: '',
      houseNumber: '',
      addressAddition: '',
      city: '',
      postalCode: '',
      state: '',
      country: '',
    }
  }
})

const obfuscatedCardNumber = computed(() => {
  if (!user.value.payment.creditCardNumber) return 'n/a'
  const last4 = user.value.payment.creditCardNumber.slice(-4)
  return '**** **** **** ' + last4
})

const obfuscatedIban = computed(() => {
  if (!user.value.payment.iban) return 'n/a'
  const iban = user.value.payment.iban.replace(/\s/g, '')
  if (iban.length <= 6) return iban
  return iban.slice(0, 4) + ' **** **** ' + iban.slice(-2)
})

const obfuscatedPaypalEmail = computed(() => {
  if (!user.value.payment.paypalEmail) return 'n/a'
  const [localPart, domain] = user.value.payment.paypalEmail.split('@')
  if (!domain) return user.value.payment.paypalEmail
  const obfuscatedLocal = localPart[0] + '****'
  return obfuscatedLocal + '@' + domain
})

//TODO: add backend endpoint und erstelle die bestellung ( backend price validation !)
const submitOrder = async () => {
  if (!canCheckout.value) {
    alert('Bitte stellen Sie sicher, dass alle erforderlichen Informationen ausgefüllt sind.')
    return
  }

  try {
    const finalShippingAddressId = useBillingAsShipping.value ? user.value.address.id : null

    const orderData = {
      totalAmount: parseFloat(cartStore.totalAmount),
      orderStatus: 'open',
      user: userStore.user.id,
      payment: user.value.payment.id,
      shipping: finalShippingAddressId,
      orderProducts: cartStore.items.map((item) => ({
        product: item.productId,
        quantity: item.quantity,
      })),
      newShippingAddress: useBillingAsShipping.value ? null : { ...shippingAddress.value },
    }

    await axios.post('/order', orderData)
    alert('Bestellung erfolgreich aufgegeben!')
    cartStore.clearCart()
    await router.push('/orders')
  } catch (error) {
    console.error('Fehler beim Abschicken der Bestellung:', error)
    if (error.response && error.response.data && error.response.data.error) {
      alert(`Fehler: ${error.response.data.error}`)
    } else {
      alert('Fehler beim Abschicken der Bestellung.')
    }
  }
}
</script>

<style scoped>
.checkout {
  max-width: 1200px;
  margin: 40px auto;
  padding: 0 20px;
}

.checkout-title {
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

.checkout-container {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.order-summary,
.user-details,
.payment-method,
.shipping-info {
  background-color: #f9f9f9;
  padding: 20px 25px;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.order-summary h2,
.user-details h2,
.payment-method h2,
.shipping-info h2 {
  margin-bottom: 15px;
  color: #333;
}

.summary-table {
  width: 100%;
  border-collapse: collapse;
}

.summary-table th,
.summary-table td {
  border: 1px solid #ddd;
  padding: 12px 15px;
  text-align: center;
}

.summary-table th {
  background-color: #eaeaea;
  color: #333;
}

.summary-total {
  text-align: right;
  margin-top: 15px;
  font-size: 1.2rem;
  color: #c06e52;
}

.detail-item {
  display: flex;
  flex-direction: column;
  margin-bottom: 15px;
}

.detail-item label {
  font-weight: bold;
  margin-bottom: 5px;
  color: #555;
}

.detail-item input,
.detail-item textarea {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  resize: vertical;
  background-color: #fff;
}

.payment-method p,
.shipping-info p {
  margin: 5px 0;
  color: #555;
}

.checkbox-wrapper {
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: bold;
  color: #555;
}

.edit-hint {
  margin-bottom: 15px;
  font-size: 0.95rem;
  line-height: 1.4;
}

.edit-hint a {
  font-weight: bold;
  color: #0056b3; /* oder was dir gefällt */
}

.checkout-actions {
  text-align: center;
}

.btn {
  padding: 12px 25px;
  font-size: 1rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin: 10px;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover {
  background-color: #0069d9;
}

.btn-success {
  background-color: #4a5043;
  color: white;
}

.btn-success:hover {
  background-color: #9fa86d;
}
</style>
