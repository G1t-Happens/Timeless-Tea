<template>
  <transition name="fade-modal">
    <div class="modal-backdrop" v-if="show" @click.self="close">
      <div class="modal-container">
        <h2>Bestellzusammenfassung</h2>

        <div class="order-summary">
          <h3>Produkte</h3>
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
              <tr v-for="item in cartItems" :key="item.id">
                <td>{{ item.name }}</td>
                <td>{{ item.productQuantity }}</td>
                <td>{{ item.price.toFixed(2) }}</td>
                <td>{{ (item.price * item.productQuantity).toFixed(2) }}</td>
              </tr>
            </tbody>
          </table>
          <div class="summary-total">
            <strong>Gesamtsumme: {{ totalAmount.toFixed(2) }} €</strong>
          </div>
        </div>

        <div class="user-info">
          <h3>Rechnungsadresse</h3>
          <p>{{ user.firstName }} {{ user.lastName }}</p>
          <p>{{ user.emailAddress }}</p>
          <p>
            {{ user.address.street }} {{ user.address.houseNumber }}, {{ user.address.postalCode }}
            {{ user.address.city }},
            {{ user.address.country }}
          </p>
        </div>

        <div class="payment-info">
          <h3>Zahlungsmethode</h3>
          <p v-if="payment && payment.paymentOption">
            Option: {{ payment.paymentOption }}<br />
            <span v-if="payment.paymentOption === 'bank transfer'"> IBAN: {{ payment.iban }} </span>
            <span v-else-if="payment.paymentOption === 'credit card'">
              Kreditkartennummer: **** **** **** {{ payment.creditCardNumber.slice(-4) }}<br />
              Ablaufdatum: {{ payment.expiryDate || 'n/a' }}
            </span>
            <span v-else-if="payment.paymentOption === 'paypal'">
              PayPal E-Mail: {{ payment.paypalEmail }}
            </span>
          </p>
          <p v-else>Keine Zahlungsmethode hinterlegt.</p>
        </div>

        <div class="shipping-info">
          <h3>Versandinformationen</h3>
          <div v-if="useBillingAsShipping">
            <p>Die Versandadresse entspricht der Rechnungsadresse.</p>
          </div>
          <div v-else>
            <p>
              {{ shippingAddress.street }} {{ shippingAddress.houseNumber }},
              {{ shippingAddress.postalCode }} {{ shippingAddress.city }},
              {{ shippingAddress.country }}
            </p>
            <p v-if="shippingAddress.addressAddition">
              Zusatz: {{ shippingAddress.addressAddition }}
            </p>
            <p v-if="shippingAddress.state">Bundesland: {{ shippingAddress.state }}</p>
          </div>
        </div>

        <div class="modal-actions">
          <button class="btn btn-success" @click="confirmOrder">Bestellung bestätigen</button>
          <button class="btn btn-danger" @click="close">Abbrechen</button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
defineProps({
  show: { type: Boolean, required: true },
  user: { type: Object, required: true },
  cartItems: { type: Array, required: true },
  totalAmount: { type: Number, required: true },
  payment: { type: Object, required: false },
  useBillingAsShipping: { type: Boolean, required: true },
  shippingAddress: { type: Object, required: true },
})
const emit = defineEmits(['close', 'confirm'])

const close = () => emit('close')
const confirmOrder = () => emit('confirm')
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 2100;
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-container {
  background: #ffffff;
  padding: 30px;
  border-radius: 8px;
  width: 800px;
  max-width: 90%;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-height: 90vh;
  overflow-y: auto;
}

.summary-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 15px;
}

.summary-table th,
.summary-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
}

.summary-total {
  text-align: right;
  margin-top: 10px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
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
</style>
