<template>
  <transition name="fade-modal">
    <div class="modal-backdrop" v-if="show" @click.self="closeModal">
      <div class="modal-container">
        <h2>Zahlungsmethode festlegen/bearbeiten</h2>

        <!-- Auswahl der Zahlungsoption -->
        <div class="form-group">
          <label for="paymentOption">Zahlungsoption</label>
          <select id="paymentOption" v-model="localPayment.paymentOption" class="form-control">
            <option value="credit card">Kreditkarte</option>
            <option value="bank transfer">Banküberweisung</option>
            <option value="paypal">PayPal</option>
          </select>
        </div>

        <!-- Felder für Kreditkarte -->
        <div v-if="localPayment.paymentOption === 'credit card'" class="payment-fields">
          <div class="form-group">
            <label for="creditCardNumber">Kartennummer</label>
            <input
              id="creditCardNumber"
              type="text"
              class="form-control"
              v-model="localPayment.creditCardNumber"
              placeholder="z.B. 1234 5678 9012 3456"
            />
          </div>
          <div class="form-group">
            <label for="expiryDate">Ablaufdatum</label>
            <input
              id="expiryDate"
              type="text"
              class="form-control"
              v-model="localPayment.expiryDate"
              placeholder="MM/YY"
            />
          </div>
          <div class="form-group">
            <label for="cvc">CVC</label>
            <input
              id="cvc"
              type="text"
              class="form-control"
              v-model="localPayment.cvc"
              placeholder="z.B. 123"
            />
          </div>
        </div>

        <!-- Felder für Banküberweisung -->
        <div v-else-if="localPayment.paymentOption === 'bank transfer'" class="payment-fields">
          <div class="form-group">
            <label for="iban">IBAN</label>
            <input
              id="iban"
              type="text"
              class="form-control"
              v-model="localPayment.iban"
              placeholder="z.B. DE89370400440532013000"
            />
          </div>
        </div>

        <!-- Felder für PayPal -->
        <div v-else-if="localPayment.paymentOption === 'paypal'" class="payment-fields">
          <div class="form-group">
            <label for="paypalEmail">PayPal E-Mail</label>
            <input
              id="paypalEmail"
              type="email"
              class="form-control"
              v-model="localPayment.paypalEmail"
              placeholder="z.B. user@mail.com"
            />
          </div>
        </div>

        <!-- Modal-Aktionen -->
        <div class="modal-actions">
          <button class="btn btn-primary" @click="handleConfirm" :disabled="isConfirmDisabled">
            Übernehmen
          </button>
          <button class="btn btn-danger" @click="closeModal">Abbrechen</button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { computed, reactive, watch } from 'vue'
import axios from 'axios'

const emit = defineEmits(['close', 'save'])
const localPayment = reactive({})
const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  payment: {
    type: Object,
    required: true,
    default: () => ({}),
  },
  userId: {
    type: Number,
    required: true, // Die `userId` muss übergeben werden
  },
})

// Syncronisiere `localPayment` mit der Prop
watch(
  () => props.payment,
  (newPayment) => {
    Object.assign(localPayment, newPayment || {})
  },
  { immediate: true },
)

const isConfirmDisabled = computed(() => {
  if (!localPayment.paymentOption) return true

  switch (localPayment.paymentOption) {
    case 'credit card':
      return !localPayment.creditCardNumber || !localPayment.expiryDate || !localPayment.cvc
    case 'bank transfer':
      return !localPayment.iban
    case 'paypal':
      return !localPayment.paypalEmail
    default:
      return true
  }
})

const closeModal = () => {
  emit('close')
}

const handleConfirm = async () => {
  try {
    const paymentData = {
      ...localPayment,
    }

    paymentData.user = props.userId

    let result
    if (localPayment.id) {
      // Zahlungsmethode aktualisieren
      result = await updatePayment(localPayment.id, paymentData)
    } else {
      // Neue Zahlungsmethode erstellen
      result = await createPayment(paymentData)
    }

    emit('save', result.data) // Emit der neuen/aktualisierten Zahlungsmethode
    resetPayment() // Eingabefelder zurücksetzen
    emit('close')
  } catch (error) {
    console.error('Fehler beim Speichern der Zahlungsmethode:', error)
  }
}

const resetPayment = () => {
  Object.assign(localPayment, {
    paymentOption: '',
    creditCardNumber: '',
    iban: '',
    paypalEmail: '',
    expiryDate: '',
  })
}

// Methode zum Erstellen einer neuen Zahlung
async function createPayment(paymentData) {
  try {
    return await axios.post(`/payment/create`, paymentData)
  } catch (error) {
    console.error('Fehler beim Erstellen der Zahlung:', error)
  }
}

// Methode zum Aktualisieren einer bestehenden Zahlung
async function updatePayment(paymentId, paymentData) {
  try {
    return await axios.patch(`/payment/${paymentId}`, paymentData)
  } catch (error) {
    console.error('Fehler beim Aktualisieren der Zahlung:', error)
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
