<template>
  <div class="edit-user">
    <BackButton />
    <h2 class="page-title form-label">Benutzer bearbeiten</h2>

    <div v-if="loading || !user" class="text-center">
      <p>Lade Benutzer...</p>
    </div>

    <div v-else>
      <!-- Hauptformular -->
      <form @submit.prevent="handleSave" class="form-container" autocomplete="off">
        <!-- USER-ID -->
        <div class="form-group">
          <label for="userId" class="form-label">User ID</label>
          <div id="userId" class="form-control static-field">{{ user.id }}</div>
        </div>

        <!-- E-Mail -->
        <div class="form-group">
          <label for="email" class="form-label">E-Mail-Adresse</label>
          <input
            v-model="user.emailAddress"
            type="email"
            id="email"
            class="form-control"
            required
          />
        </div>

        <!-- Vorname -->
        <div class="form-group">
          <label for="firstName" class="form-label">Vorname</label>
          <input
            v-model="user.firstName"
            type="text"
            id="firstName"
            class="form-control"
            required
          />
        </div>

        <!-- Nachname -->
        <div class="form-group">
          <label for="lastName" class="form-label">Nachname</label>
          <input v-model="user.lastName" type="text" id="lastName" class="form-control" required />
        </div>

        <!-- Admin Toggle (nur für Admins) -->
        <div v-if="currentUser.isAdmin" class="form-group toggle-switch">
          <label class="form-label" for="isAdmin">Admin</label>
          <label class="switch" aria-labelledby="isAdmin">
            <input v-model="user.isAdmin" type="checkbox" id="isAdmin" />
            <span class="slider round"></span>
          </label>
        </div>

        <!-- Passwort ändern -->
        <!-- Passwort ändern -->
        <h3 class="form-label">Passwort ändern</h3>
        <div class="form-group password-fields">
          <!-- Dummy-Feld -->
          <input type="text" style="display: none" autocomplete="username" />

          <!-- Neues Passwort -->
          <label for="newPassword" class="form-label">Neues Passwort</label>
          <div class="password-input-group">
            <input
              v-model="newPassword"
              :type="showPassword ? 'text' : 'password'"
              id="newPassword"
              class="form-control"
              placeholder="Neues Passwort"
              autocomplete="off"
            />
            <button
              type="button"
              class="btn btn-show-password"
              @mousedown="togglePasswordVisibility(true)"
              @mouseup="togglePasswordVisibility(false)"
              @mouseleave="togglePasswordVisibility(false)"
            >
              <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
            </button>
          </div>

          <!-- Passwort-Bestätigung -->
          <label for="confirmPassword" class="form-label">Passwort bestätigen</label>
          <div class="password-input-group">
            <input
              v-model="confirmPassword"
              :type="showPassword ? 'text' : 'password'"
              id="confirmPassword"
              class="form-control"
              placeholder="Passwort bestätigen"
              autocomplete="off"
            />
            <button
              type="button"
              class="btn btn-show-password"
              @mousedown="togglePasswordVisibility(true)"
              @mouseup="togglePasswordVisibility(false)"
              @mouseleave="togglePasswordVisibility(false)"
            >
              <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
            </button>
          </div>

          <p v-if="passwordMismatch" class="error-text">Die Passwörter stimmen nicht überein.</p>
        </div>

        <!-- Adressfelder -->
        <h3 class="mt-4 form-label">Adressenangabe</h3>
        <div class="form-group address-fields">
          <label for="street" class="form-label">Straße*</label>
          <input v-model="user.address.street" type="text" id="street" class="form-control" />
          <label for="houseNumber" class="form-label">Hausnummer*</label>
          <input
            v-model="user.address.houseNumber"
            type="text"
            id="houseNumber"
            class="form-control"
          />
          <label for="addressAddition" class="form-label">Adresszusatz</label>
          <input
            v-model="user.address.addressAddition"
            type="text"
            id="addressAddition"
            class="form-control"
          />
          <label for="city" class="form-label">Stadt*</label>
          <input v-model="user.address.city" type="text" id="city" class="form-control" />
          <label for="postalCode" class="form-label">Postleitzahl*</label>
          <input
            v-model="user.address.postalCode"
            type="text"
            id="postalCode"
            class="form-control"
          />
          <label for="country" class="form-label">Land*</label>
          <input v-model="user.address.country" type="text" id="country" class="form-control" />
        </div>

        <!-- Zahlungsmethoden: Alle Methoden anzeigen und bearbeiten -->
        <div class="form-group">
          <h3 class="form-label">Zahlungsmethoden</h3>

          <!-- Liste der Zahlungsmethoden anzeigen -->
          <div v-if="user.payments.length > 0">
            <div v-for="payment in user.payments" :key="payment.id" class="payment-summary">
              <strong>{{ payment.paymentOption }}</strong>
              <div v-if="payment.paymentOption === 'bank transfer'">
                <p>IBAN: {{ obfuscateIban(payment.iban) }}</p>
              </div>
              <div v-else-if="payment.paymentOption === 'credit card'">
                <p>Nummer: {{ obfuscateCreditCard(payment.creditCardNumber) }}</p>
                <p>Ablaufdatum: {{ payment.expiryDate || 'n/a' }}</p>
              </div>
              <div v-else-if="payment.paymentOption === 'paypal'">
                <p>E-Mail: {{ obfuscatePaypalEmail(payment.paypalEmail) }}</p>
              </div>
              <button type="button" @click="editPayment(payment)" class="btn btn-edit-payment">
                Bearbeiten
              </button>
              <button
                type="button"
                @click="deletePayment(payment.id)"
                class="btn btn-delete-payment"
              >
                Löschen
              </button>
            </div>
          </div>
          <div v-else>
            <p>Keine Zahlungsmethoden hinterlegt.</p>
          </div>

          <!-- Button zum Öffnen des Payment-Modals -->
          <button type="button" class="btn btn-secondary" @click="openPaymentModal">
            Zahlungsmethode hinzufügen
          </button>
        </div>

        <!-- Trennlinie für Abschnitt -->
        <hr class="section-divider" />

        <!-- Speichern/Löschen -->
        <div class="button-group">
          <button type="submit" class="btn btn-primary" :disabled="!isFormChanged">
            Speichern
          </button>
          <button
            v-if="currentUser.isAdmin"
            type="button"
            @click="deleteUser(user.id)"
            class="btn btn-danger"
          >
            Löschen
          </button>
        </div>
      </form>
    </div>

    <!-- PaymentModal für Bearbeitung/Erstellung -->
    <PaymentModal
      v-if="showPaymentModal"
      :show="showPaymentModal"
      :payment="editingPayment"
      :userId="user.id"
      @close="closePaymentModal"
      @save="savePayment"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import BackButton from '@/components/navigation/BackButton.vue'
import PaymentModal from '@/components/PaymentModal.vue'

const userStore = useUserStore()
const currentUser = computed(() => userStore.user)
const route = useRoute()
const router = useRouter()
const loading = ref(true)
const newPassword = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showPaymentModal = ref(false)
const editingPayment = ref(null)
const originalUser = ref(null)

// Lokales User-Objekt und Kopie für Vergleich
const user = ref({
  id: null,
  emailAddress: '',
  firstName: '',
  lastName: '',
  isAdmin: false,
  address: {
    id: null,
    street: '',
    houseNumber: '',
    addressAddition: '',
    city: '',
    postalCode: '',
    country: '',
  },
  payments: [],
})

const isFormChanged = computed(() => {
  const addressChanged =
    JSON.stringify(user.value.address) !== JSON.stringify(originalUser.value.address)
  const generalChanged = JSON.stringify(user.value) !== JSON.stringify(originalUser.value)

  const passwordChanged =
    newPassword.value !== '' &&
    confirmPassword.value !== '' &&
    newPassword.value === confirmPassword.value

  return (generalChanged || addressChanged || passwordChanged) && !passwordMismatch.value
})

// Berechnete Eigenschaft für Passwortvergleich
const passwordMismatch = computed(
  () => newPassword.value && confirmPassword.value && newPassword.value !== confirmPassword.value,
)

// Passwort-Sichtbarkeit ein-/ausblenden
const togglePasswordVisibility = (state) => {
  showPassword.value = state
}

// Admins können auf beliebigen User zugreifen, nicht Admins nur auf die eigenen Daten
onMounted(async () => {
  const userId = route.params.id || currentUser.value.id
  await fetchUser(userId)
})

/**
 * User-Daten laden
 */
const fetchUser = async (id) => {
  loading.value = true
  try {
    const { data } = await axios.get(`/api/user/${id}`)
    user.value = {
      ...user.value, // Behalte die Standardstruktur bei
      ...data, // Überschreibe mit den API-Daten
      address: {
        ...user.value.address, // Behalte Standardstruktur der Adresse
        ...data.address, // Überschreibe mit den API-Daten
      },
      payments: data.payments || [], // Stelle sicher, dass Zahlungen immer ein Array sind
    }
    originalUser.value = JSON.parse(JSON.stringify(user.value))
  } catch (error) {
    console.error('Fehler beim Laden des Benutzers:', error)
    alert('Benutzer konnte nicht geladen werden.')
  } finally {
    loading.value = false
  }
}

const deleteUser = async (id) => {
  const confirmed = window.confirm('Möchten Sie diesen User wirklich löschen?')
  if (!confirmed) {
    return
  }
  try {
    await axios.delete(`/api/user/${id}`)
    await router.push({ name: 'AdminDasboard' })
  } catch (error) {
    console.error('Fehler beim Löschen des Users:', error)
    alert('Fehler beim Löschen des Users.')
  }
}

/**
 * ALLES in einem PATCH-Call
 */
const handleSave = async () => {
  if (passwordMismatch.value) {
    alert('Passwörter stimmen nicht überein.')
    return
  }

  const updatedUserData = {
    emailAddress: user.value.emailAddress,
    firstName: user.value.firstName,
    lastName: user.value.lastName,
    isAdmin: user.value.isAdmin,
    address: user.value.address,
    password: newPassword.value || undefined,
  }

  try {
    await axios.patch(`/api/user/${user.value.id}`, updatedUserData)
    alert('Benutzerdaten erfolgreich aktualisiert!')
    router.go()
  } catch (error) {
    console.error('Fehler beim Speichern des Benutzers:', error)
    alert('Fehler beim Speichern der Benutzerdaten')
  }
}

// Zahlungsmethoden bearbeiten
const editPayment = (payment) => {
  editingPayment.value = { ...payment } // Kopiere das ausgewählte Payment-Objekt vollständig
  showPaymentModal.value = true // Öffne das Modal
}

// Zahlungsmethode löschen
const deletePayment = async (paymentId) => {
  const confirmed = window.confirm('Möchten Sie diese Zahlungsmethode wirklich löschen?')
  if (!confirmed) return
  await axios.delete(`/api/payment/${paymentId}`)
  user.value.payments = user.value.payments.filter((payment) => payment.id !== paymentId)
}

// Payment-Modal öffnen/schließen
const openPaymentModal = () => {
  // Zurücksetzen der `editingPayment`, um sicherzustellen, dass alte Daten nicht vorhanden sind
  editingPayment.value = {
    paymentOption: '',
    creditCardNumber: '',
    iban: '',
    paypalEmail: '',
    expiryDate: '',
  }
  showPaymentModal.value = true // Öffne das Modal
}

const closePaymentModal = () => {
  showPaymentModal.value = false
}

// Zahlungsmethode speichern
const savePayment = async (newPayment) => {
  try {
    if (editingPayment.value.id) {
      // Existierende Zahlungsmethode aktualisieren
      const index = user.value.payments.findIndex(
        (payment) => payment.id === editingPayment.value.id,
      )
      if (index !== -1) {
        user.value.payments[index] = newPayment // Aktualisiere das Payment in der Liste
      }
    } else {
      // Neue Zahlungsmethode hinzufügen
      user.value.payments.push(newPayment)
    }
    await fetchUser(user.value.id)
    closePaymentModal()
  } catch (error) {
    console.error('Fehler beim Speichern der Zahlungsmethode:', error)
  }
}

// Obfuskations-Helpers
const obfuscateCreditCard = (cardNumber) => {
  if (!cardNumber) return 'n/a'
  const last4 = cardNumber.slice(-4)
  return '**** **** **** ' + last4
}

const obfuscateIban = (iban) => {
  if (!iban) return 'n/a'
  const cleanIban = iban.replace(/\s/g, '')
  if (cleanIban.length <= 6) return cleanIban
  return cleanIban.slice(0, 4) + ' **** **** ' + cleanIban.slice(-2)
}

const obfuscatePaypalEmail = (email) => {
  if (!email) return 'n/a'
  const [localPart, domain] = email.split('@')
  if (!domain) return email
  return localPart[0] + '****' + '@' + domain
}
</script>

<style scoped>
.edit-user {
  padding: 30px;
  max-width: 800px;
  margin: 0 auto;
  background-color: #fff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

.page-title {
  text-align: center;
  margin-bottom: 30px;
  font-size: 1.8rem;
  color: #333;
}

.static-field {
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  padding: 10px;
  border-radius: 4px;
  font-size: 1rem;
  color: #6c757d;
}

.form-container {
  display: grid;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-label {
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
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

.address-fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

/* Payment-Anzeige */
.payment-summary {
  background-color: #f8f9f9;
  border: 1px solid #eaeaea;
  border-radius: 6px;
  padding: 10px;
  margin-bottom: 10px;
}

.payment-summary p {
  margin: 0 0 5px;
}

.btn-edit-payment {
  margin-right: 10px;
  color: white;
  background-color: #6c757d;
}

.btn-edit-payment:hover {
  background-color: #5a6268;
}

.btn-delete-payment {
  color: white;
  background-color: #c06e52;
}

.btn-delete-payment:hover {
  background-color: #c0392b;
}

/* Zusätzliche Symbole für Bearbeiten und Löschen */
.btn-edit-payment:before {
  content: '✎\00a0';
  font-size: 18px;
}

.btn-delete-payment:before {
  content: '✖\00a0';
  font-size: 18px;
}

.btn {
  padding: 10px 20px;
  font-size: 1rem;
  border-radius: 5px;
  transition: all 0.3s ease;
  border: none;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
}

.btn-primary {
  background-color: #4a5043;
  color: white;
  margin-right: 10px;
}

.btn-primary:hover {
  background-color: #9fa86d;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #5a6268;
}

.btn-danger {
  background-color: #c06e52;
  color: white;
}

.btn-danger:hover {
  background-color: #c0392b;
}

.button-group {
  display: flex;
  gap: 10px;
}

.toggle-switch {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
  margin-left: 10px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.4s;
  border-radius: 34px;
}

.slider:before {
  position: absolute;
  content: '';
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #4a5043;
}

input:focus + .slider {
  box-shadow: 0 0 1px #4a5043;
}

input:checked + .slider:before {
  transform: translateX(26px);
}

.password-fields {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.password-input-group {
  position: relative;
  display: flex;
  align-items: center;
}

.password-input-group .form-control {
  flex: 1;
  padding-right: 40px;
}

.password-input-group .btn-show-password {
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
}

.error-text {
  color: #c0392b;
  font-size: 0.9rem;
}
</style>
