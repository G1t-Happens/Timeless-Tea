<template>
  <transition name="fade-modal">
    <div class="modal-backdrop" v-if="show" @click.self="closeModal">
      <div class="modal-container">
        <h2>Zahlungsmethode festlegen/bearbeiten</h2>

        <!-- Auswahl der Zahlungsoption -->
        <div class="form-group">
          <label for="paymentOption">Zahlungsoption</label>
          <select id="paymentOption" v-model="payment.paymentOption" class="form-control">
            <option value="credit card">Kreditkarte</option>
            <option value="bank transfer">Banküberweisung</option>
            <option value="paypal">PayPal</option>
          </select>
        </div>

        <!-- Felder für Kreditkarte -->
        <div v-if="payment.paymentOption === 'credit card'" class="payment-fields">
          <div class="form-group">
            <label for="creditCardNumber">Kartennummer</label>
            <input
              id="creditCardNumber"
              type="text"
              class="form-control"
              v-model="payment.creditCardNumber"
              placeholder="z.B. 1234 5678 9012 3456"
            />
          </div>
          <div class="form-group">
            <label for="expiryDate">Ablaufdatum</label>
            <input
              id="expiryDate"
              type="text"
              class="form-control"
              v-model="payment.expiryDate"
              placeholder="MM/YY"
            />
          </div>
          <div class="form-group">
            <label for="cvc">CVC</label>
            <input
              id="cvc"
              type="text"
              class="form-control"
              v-model="payment.cvc"
              placeholder="z.B. 123"
            />
          </div>
        </div>

        <!-- Felder für Banküberweisung -->
        <div v-else-if="payment.paymentOption === 'bank transfer'" class="payment-fields">
          <div class="form-group">
            <label for="iban">IBAN</label>
            <input
              id="iban"
              type="text"
              class="form-control"
              v-model="payment.iban"
              placeholder="z.B. DE89370400440532013000"
            />
          </div>
        </div>

        <!-- Felder für PayPal -->
        <div v-else-if="payment.paymentOption === 'paypal'" class="payment-fields">
          <div class="form-group">
            <label for="paypalEmail">PayPal E-Mail</label>
            <input
              id="paypalEmail"
              type="email"
              class="form-control"
              v-model="payment.paypalEmail"
              placeholder="z.B. user@mail.com"
            />
          </div>
        </div>

        <!-- Modal-Aktionen -->
        <div class="modal-actions">
          <button class="btn btn-primary" @click="handleConfirm">Übernehmen</button>
          <button class="btn btn-danger" @click="closeModal">Abbrechen</button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import axios from 'axios'
import { useUserStore } from '@/stores/user'
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  payment: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['close', 'save'])

const userStore = useUserStore()

const closeModal = () => {
  emit('close')
}

const handleConfirm = async () => {
  try {
    // `payment` ist direkt in den `props` eingebunden
    if (props.payment.id) {
      // Wenn eine `id` existiert, dann ist dies ein Update
      const updatedPayment = await updatePayment(props.payment.id, props.payment)
      emit('save', updatedPayment.data)
    } else {
      // Andernfalls ein neuer Payment-Eintrag
      const newPayment = await createPayment(props.payment)
      emit('save', newPayment.data)
    }
    emit('close')
  } catch (error) {
    console.error('Zahlung konnte nicht verarbeitet werden:', error)
  }
}

// Methode zum Erstellen einer neuen Zahlung
async function createPayment(paymentData) {
  try {
    const response = await axios.post(`/payment/create`, {
      userId: userStore.user.id,
      ...paymentData,
    })
    return response
  } catch (error) {
    console.error('Fehler beim Erstellen der Zahlung:', error)
    throw error
  }
}

// Methode zum Aktualisieren einer bestehenden Zahlung
async function updatePayment(paymentId, paymentData) {
  try {
    const response = await axios.put(`/payment/${paymentId}`, paymentData)
    return response
  } catch (error) {
    console.error('Fehler beim Aktualisieren der Zahlung:', error)
    throw error
  }
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 2000;
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-container {
  background: #ffffff;
  padding: 30px;
  border-radius: 8px;
  width: 400px;
  max-width: 90%;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.payment-fields {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* Allgemeine Form-Stile (kannst du anpassen/übernehmen) */
.form-group {
  display: flex;
  flex-direction: column;
}

.form-control {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
}

.form-control:focus {
  border-color: #007bff;
}

.btn {
  padding: 10px 20px;
  font-size: 1rem;
  border-radius: 5px;
  border: none;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background-color: #4a5043;
  color: white;
}

.btn-primary:hover {
  background-color: #9fa86d;
}

.btn-danger {
  background-color: #c06e52;
  color: white;
}

.btn-danger:hover {
  background-color: #c0392b;
}
</style>
