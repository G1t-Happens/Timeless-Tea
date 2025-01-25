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
          <div class="form-group" :class="{ 'has-error': errors.creditCardNumber }">
            <label for="creditCardNumber">Kartennummer</label>
            <input
              id="creditCardNumber"
              type="text"
              class="form-control"
              v-model="localPayment.creditCardNumber"
              placeholder="z.B. 1234567890123456"
              @input="validateCreditCardNumber"
            />
            <!-- Fehlermeldung direkt anzeigen -->
            <span v-if="errors.creditCardNumber" class="error">
              {{ errors.creditCardNumber }}
            </span>
          </div>

          <div class="form-group" :class="{ 'has-error': errors.expiryDate }">
            <label for="expiryDate">Ablaufdatum</label>
            <input
              id="expiryDate"
              type="date"
              class="form-control"
              v-model="expiryDate"
              placeholder="YYYY-MM-DD"
              @blur="validateExpiryDate"
            />
            <span v-if="errors.expiryDate" class="error">
              {{ errors.expiryDate }}
            </span>
          </div>

          <div class="form-group" :class="{ 'has-error': errors.cvc }">
            <label for="cvc">CVC</label>
            <input
              id="cvc"
              type="text"
              class="form-control"
              v-model="localPayment.cvc"
              placeholder="z.B. 123"
              @input="validateCVC"
            />
            <span v-if="errors.cvc" class="error">
              {{ errors.cvc }}
            </span>
          </div>
        </div>

        <!-- Felder für Banküberweisung -->
        <div v-else-if="localPayment.paymentOption === 'bank transfer'" class="payment-fields">
          <div class="form-group" :class="{ 'has-error': errors.iban }">
            <label for="iban">IBAN</label>
            <input
              id="iban"
              type="text"
              class="form-control"
              v-model="localPayment.iban"
              placeholder="z.B. DE89370400440532013000"
              @input="validateIBAN"
            />
            <span v-if="errors.iban" class="error">
              {{ errors.iban }}
            </span>
          </div>
        </div>

        <!-- Felder für PayPal -->
        <div v-else-if="localPayment.paymentOption === 'paypal'" class="payment-fields">
          <div class="form-group" :class="{ 'has-error': errors.paypalEmail }">
            <label for="paypalEmail">PayPal E-Mail</label>
            <input
              id="paypalEmail"
              type="email"
              class="form-control"
              v-model="localPayment.paypalEmail"
              placeholder="z.B. user@mail.com"
              @input="validatePayPalEmail"
            />
            <span v-if="errors.paypalEmail" class="error">
              {{ errors.paypalEmail }}
            </span>
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
import Swal from 'sweetalert2'

// Events / Props
const emit = defineEmits(['close', 'save'])
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
    required: true,
  },
})

// Lokaler Payment State
const localPayment = reactive({})

// Fehlerobjekt für Inline-Validierung
const errors = reactive({
  creditCardNumber: '',
  expiryDate: '',
  cvc: '',
  iban: '',
  paypalEmail: '',
})

// Payment-Prop direkt synchronisieren
watch(
  () => props.payment,
  (newPayment) => {
    Object.assign(localPayment, newPayment || {})
  },
  { immediate: true },
)

// Computed für disable-Button
const isConfirmDisabled = computed(() => {
  if (!localPayment.paymentOption) return true

  switch (localPayment.paymentOption) {
    case 'credit card':
      return (
        // Felder dürfen nicht leer sein
        !localPayment.creditCardNumber ||
        !localPayment.expiryDate ||
        !localPayment.cvc ||
        // Und sie dürfen keine Fehlermeldung enthalten
        !!errors.creditCardNumber ||
        !!errors.expiryDate ||
        !!errors.cvc
      )

    case 'bank transfer':
      return !localPayment.iban || !!errors.iban

    case 'paypal':
      return !localPayment.paypalEmail || !!errors.paypalEmail

    default:
      return true
  }
})

// Ablaufdatum als Computed (wie gehabt)
const expiryDate = computed({
  get() {
    return localPayment.expiryDate ? formatInputDate(localPayment.expiryDate) : ''
  },
  set(value) {
    localPayment.expiryDate = value
  },
})

// Datum formatieren
function formatInputDate(date) {
  if (!date) return ''
  const parsedDate = new Date(date)
  if (isNaN(parsedDate.getTime())) {
    console.warn('Ungültiges Datum:', date)
    return ''
  }
  const year = parsedDate.getFullYear()
  const month = String(parsedDate.getMonth() + 1).padStart(2, '0')
  const day = String(parsedDate.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// ========== VALIDIERUNGSFUNKTIONEN ==========

// Kreditkartennummer: Nur Ziffern, 13–19 Stellen
function validateCreditCardNumber() {
  const val = (localPayment.creditCardNumber || '').replace(/\s+/g, '') // Leerzeichen entfernen
  if (!val) {
    errors.creditCardNumber = ''
    return
  }
  if (!/^\d{13,19}$/.test(val)) {
    errors.creditCardNumber = 'Bitte eine gültige Kreditkartennummer (13–19 Ziffern) eingeben'
  } else {
    errors.creditCardNumber = ''
  }
}

// Datum: Muss gültig sein und in der Zukunft liegen (optional)
function validateExpiryDate() {
  const val = localPayment.expiryDate
  if (!val) {
    errors.expiryDate = ''
    return
  }
  const parsed = new Date(val)
  if (isNaN(parsed.valueOf())) {
    errors.expiryDate = 'Ungültiges Datum'
    return
  }
  // Optional: In der Vergangenheit liegendes Datum abfangen
  const now = new Date()
  if (parsed < now) {
    errors.expiryDate = 'Das Ablaufdatum darf nicht in der Vergangenheit liegen'
  } else {
    errors.expiryDate = ''
  }
}

// CVC: 3–4 Ziffern
function validateCVC() {
  const val = localPayment.cvc
  if (!val) {
    errors.cvc = ''
    return
  }
  if (!/^\d{3,4}$/.test(val)) {
    errors.cvc = 'Bitte einen gültigen CVC (3–4 Ziffern) eingeben'
  } else {
    errors.cvc = ''
  }
}

// IBAN: 15–34 alphanumerische Zeichen
function validateIBAN() {
  const val = localPayment.iban
  if (!val) {
    errors.iban = ''
    return
  }
  if (!/^[A-Za-z0-9]{15,34}$/.test(val)) {
    errors.iban = 'Bitte eine gültige IBAN (15–34 alphanumerische Zeichen) eingeben'
  } else {
    errors.iban = ''
  }
}

// PayPal Email: Muss ein valid-Email-Pattern matchen
function validatePayPalEmail() {
  const val = localPayment.paypalEmail
  if (!val) {
    errors.paypalEmail = ''
    return
  }
  // Einfacher E-Mail-Regex
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!re.test(val)) {
    errors.paypalEmail = 'Bitte eine gültige E-Mail-Adresse eingeben'
  } else {
    errors.paypalEmail = ''
  }
}

// Modal schließen
function closeModal() {
  emit('close')
}

// Speichern
async function handleConfirm() {
  try {
    // Beispielhafter "Vor dem Submit" Check:
    // Wenn noch Fehler vorliegen, abbrechen
    if (
      errors.creditCardNumber ||
      errors.expiryDate ||
      errors.cvc ||
      errors.iban ||
      errors.paypalEmail
    ) {
      return Swal.fire({
        title: 'Bitte alle Fehler beheben',
        icon: 'warning',
        confirmButtonText: 'OK',
      })
    }

    const paymentData = { ...localPayment }
    paymentData.user = props.userId

    let result
    if (localPayment.id) {
      // Zahlungsmethode aktualisieren
      result = await updatePayment(localPayment.id, paymentData)
    } else {
      // Neue Zahlungsmethode erstellen
      result = await createPayment(paymentData)
    }
    emit('save', result.data)
    emit('close')
    resetPayment()

    if (localPayment.id) {
      await Swal.fire({
        title: 'Zahlungsmethode aktualisiert!',
        text: 'Zahlungsmethode wurde erfolgreich aktualisiert.',
        icon: 'success',
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
      })
    } else {
      await Swal.fire({
        title: 'Zahlungsmethode erstellt!',
        text: 'Zahlungsmethode wurde erfolgreich erstellt.',
        icon: 'success',
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
      })
    }
  } catch (error) {
    console.error('Fehler beim Speichern der Zahlungsmethode:', error)
    await Swal.fire({
      title: 'Fehler beim Speichern der Zahlungsmethode!',
      text: error.response?.data?.error || 'Ein unbekannter Fehler ist aufgetreten.',
      icon: 'error',
      confirmButtonText: 'OK',
    })
  }
}

// Reset des PaymentModals
function resetPayment() {
  Object.assign(localPayment, {
    paymentOption: '',
    creditCardNumber: '',
    expiryDate: '',
    cvc: '',
    iban: '',
    paypalEmail: '',
  })
  // Auch Fehlermeldungen zurücksetzen
  Object.assign(errors, {
    creditCardNumber: '',
    expiryDate: '',
    cvc: '',
    iban: '',
    paypalEmail: '',
  })
}

// Payment-APIs
async function createPayment(paymentData) {
  try {
    return await axios.post(`/api/payment/create`, paymentData)
  } catch (error) {
    console.error('Fehler beim Erstellen der Zahlung:', error)
    await Swal.fire({
      title: 'Fehler beim Erstellen der Zahlung!',
      text: error.response?.data?.error || 'Ein unbekannter Fehler ist aufgetreten.',
      icon: 'error',
      confirmButtonText: 'OK',
    })
  }
}

async function updatePayment(paymentId, paymentData) {
  try {
    return await axios.patch(`/api/payment/${paymentId}`, paymentData)
  } catch (error) {
    console.error('Fehler beim Aktualisieren der Zahlung:', error)
    await Swal.fire({
      title: 'Fehler beim Aktualisieren der Zahlung!',
      text: error.response?.data?.error || 'Ein unbekannter Fehler ist aufgetreten.',
      icon: 'error',
      confirmButtonText: 'OK',
    })
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

.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
}

/* Beispiel-Fehlerzustand: Umrandung rot, wenn Fehler vorhanden */
.has-error input {
  border-color: #e74c3c !important;
}

.error {
  color: #e74c3c;
  font-size: 0.9rem;
  margin-top: 5px;
}

/* Button-Stile (Beispiel) */
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
