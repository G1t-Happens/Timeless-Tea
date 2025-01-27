<template>
  <div class="edit-user">
    <BackButton />
    <h2 class="page-title form-label">Benutzer bearbeiten</h2>

    <!-- Ladezustand oder fehlende Benutzerinformationen -->
    <div v-if="loading || !user" class="text-center">
      <p>Lade Benutzer...</p>
    </div>

    <!-- Hauptinhalt wird nur gerendert, wenn User verfügbar ist -->
    <div v-else-if="currentUser">
      <form @submit.prevent="handleSave" class="form-container" autocomplete="off">
        <!-- USER-ID -->
        <div v-if="user?.id" class="form-group">
          <label for="userId" class="form-label">User ID</label>
          <div id="userId" class="form-control static-field">{{ user.id }}</div>
        </div>

        <!-- E-Mail -->
        <div v-if="user?.emailAddress" class="form-group">
          <label for="email" class="form-label">E-Mail-Adresse*</label>
          <input
            v-model="user.emailAddress"
            type="email"
            id="email"
            class="form-control"
            maxlength="100"
            required
          />
        </div>

        <!-- Vorname -->
        <div v-if="user?.firstName" class="form-group">
          <label for="firstName" class="form-label">Vorname*</label>
          <input
            v-model="user.firstName"
            type="text"
            id="firstName"
            class="form-control"
            maxlength="50"
            required
          />
        </div>

        <!-- Nachname -->
        <div v-if="user?.lastName" class="form-group">
          <label for="lastName" class="form-label">Nachname*</label>
          <input
            v-model="user.lastName"
            type="text"
            id="lastName"
            class="form-control"
            maxlength="50"
            required
          />
        </div>

        <!-- Admin Toggle (nur für Admins) -->
        <div v-if="currentUser?.isAdmin" class="form-group toggle-switch">
          <label class="form-label" for="isAdmin">Admin</label>
          <label class="switch" aria-labelledby="isAdmin">
            <input v-model="user.isAdmin" type="checkbox" id="isAdmin" />
            <span class="slider round"></span>
          </label>
        </div>

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
        <div v-if="user?.address" class="form-group address-fields">
          <label for="street" class="form-label">Straße*</label>
          <input
            v-model="user.address.street"
            type="text"
            id="street"
            class="form-control"
            maxlength="30"
            required
          />
          <label for="houseNumber" class="form-label">Hausnummer*</label>
          <input
            v-model="user.address.houseNumber"
            type="text"
            id="houseNumber"
            class="form-control"
            maxlength="8"
            required
          />
          <label for="addressAddition" class="form-label">Adresszusatz</label>
          <input
            v-model="user.address.addressAddition"
            type="text"
            id="addressAddition"
            class="form-control"
            maxlength="150"
          />
          <label for="city" class="form-label">Stadt*</label>
          <input
            v-model="user.address.city"
            type="text"
            id="city"
            class="form-control"
            maxlength="50"
            required
          />
          <label for="postalCode" class="form-label">Postleitzahl*</label>
          <input
            v-model="user.address.postalCode"
            type="text"
            id="postalCode"
            class="form-control"
            maxlength="10"
            required
          />
          <label for="country" class="form-label">Land*</label>
          <input
            v-model="user.address.country"
            type="text"
            id="country"
            class="form-control"
            maxlength="60"
            required
          />
        </div>

        <!-- Zahlungsmethoden -->
        <h3 class="form-label">Zahlungsmethoden</h3>
        <div class="form-group">
          <!-- Liste der Zahlungsmethoden anzeigen -->
          <div v-if="user.payments.length > 0">
            <div v-for="payment in user.payments" :key="payment.id" class="payment-summary">
              <div class="payment-info">
                <div class="payment-icon">
                  <i v-if="payment.paymentOption === 'bank transfer'" class="bi bi-bank"></i>
                  <i
                    v-else-if="payment.paymentOption === 'credit card'"
                    class="bi bi-credit-card"
                  ></i>
                  <i v-else-if="payment.paymentOption === 'paypal'" class="bi bi-paypal"></i>
                </div>
                <div class="payment-details">
                  <strong>{{ payment.paymentOption }}</strong>
                  <p v-if="payment.paymentOption === 'bank transfer'">
                    IBAN: {{ obfuscateIban(payment.iban) }}
                  </p>
                  <p v-else-if="payment.paymentOption === 'credit card'">
                    Nummer: {{ obfuscateCreditCard(payment.creditCardNumber) }}<br />
                    Ablaufdatum: {{ formatInputDate(payment.expiryDate) || 'n/a' }}
                  </p>
                  <p v-else-if="payment.paymentOption === 'paypal'">
                    E-Mail: {{ obfuscatePaypalEmail(payment.paypalEmail) }}
                  </p>
                </div>
              </div>
              <div class="payment-actions">
                <button type="button" @click="editPayment(payment)" class="btn btn-primary">
                  Bearbeiten
                </button>
                <button type="button" @click="deletePayment(payment.id)" class="btn btn-secondary">
                  Löschen
                </button>
              </div>
            </div>
          </div>
          <div v-else>
            <p>Keine Zahlungsmethoden hinterlegt.</p>
          </div>

          <!-- Button zum Öffnen des Payment-Modals -->
          <button
            type="button"
            class="btn btn-primary"
            style="margin-top: 5px"
            @click="openPaymentModal"
          >
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
            v-if="currentUser?.isAdmin && user?.id"
            type="button"
            @click="deleteUser(user.id)"
            class="btn btn-secondary"
          >
            Löschen
          </button>
        </div>
      </form>
      <!-- PaymentModal für Bearbeitung/Erstellung von Zahlungsmethoden -->
      <PaymentModal
        v-if="showPaymentModal"
        :show="showPaymentModal"
        :payment="editingPayment"
        :userId="user.id"
        @close="closePaymentModal"
        @save="savePayment"
      />
    </div>
    <!-- Fallback bei fehlendem currentUser -->
    <div v-else class="text-center">
      <p>Fehler: Benutzerinformationen konnten nicht geladen werden.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import BackButton from '@/components/navigation/BackButton.vue'
import PaymentModal from '@/components/PaymentModal.vue'
import Swal from 'sweetalert2'

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

//Date Formatierung
const formatInputDate = (date) => {
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

// Passwort-Sichtbarkeit ein-/ausblenden
const togglePasswordVisibility = (state) => {
  showPassword.value = state
}

// Admins können auf beliebigen User zugreifen, nicht Admins nur auf die eigenen Daten
onMounted(async () => {
  const userId = route.params.id || currentUser.value.id
  await fetchUser(userId)
})

//Userdaten laden anhand der id
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
    await Swal.fire({
      title: 'Benutzer konnte nicht geladen werden.',
      icon: 'error',
      confirmButtonText: 'OK',
    })
  } finally {
    loading.value = false
  }
}

//User loeschen
const deleteUser = async (id) => {
  const result = await Swal.fire({
    title: 'User löschen?',
    text: 'Möchten Sie diesen User wirklich löschen? Dieser Vorgang kann nicht rückgängig gemacht werden.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Ja, löschen',
    cancelButtonText: 'Abbrechen',
  })

  if (result.isConfirmed) {
    try {
      await axios.delete(`/api/user/${id}`)
      await Swal.fire({
        title: 'Gelöscht',
        text: 'Der User wurde erfolgreich gelöscht.',
        icon: 'success',
        confirmButtonText: 'OK',
      })
      await router.push({ name: 'AdminDashboard' })
    } catch (error) {
      console.error('Fehler beim Löschen des Users:', error)
      await Swal.fire({
        title: 'Fehler beim Löschen des Users.',
        icon: 'error',
        confirmButtonText: 'OK',
      })
    }
  }
}

/**
 * ALLES in einem PATCH-Call
 */
const handleSave = async () => {
  if (passwordMismatch.value) {
    await Swal.fire({
      title: 'Passwörter stimmen nicht überein.',
      icon: 'error',
      confirmButtonText: 'OK',
    })
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
    await Swal.fire({
      title: 'Benutzerdaten erfolgreich aktualisiert!',
      icon: 'success',
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
    })
    router.go()
  } catch (error) {
    console.error('Fehler beim Speichern des Benutzers:', error)
    await Swal.fire({
      title: 'Fehler beim Speichern der Benutzerdaten.',
      icon: 'error',
      confirmButtonText: 'OK',
    })
  }
}

// Zahlungsmethoden bearbeiten
const editPayment = (payment) => {
  editingPayment.value = { ...payment } // Kopiere das ausgewählte Payment-Objekt vollständig
  showPaymentModal.value = true // Öffne das Modal
}

// Zahlungsmethode löschen
const deletePayment = async (paymentId) => {
  const result = await Swal.fire({
    title: 'Zahlungsmethode löschen?',
    text: 'Möchten Sie diese Zahlungsmethode wirklich löschen? Dieser Vorgang kann nicht rückgängig gemacht werden.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Ja, löschen',
    cancelButtonText: 'Abbrechen',
  })

  if (result.isConfirmed) {
    await axios.delete(`/api/payment/${paymentId}`)
    user.value.payments = user.value.payments.filter((payment) => payment.id !== paymentId)
    await Swal.fire({
      title: 'Gelöscht',
      text: 'Die Zahlungsmethode wurde erfolgreich gelöscht.',
      icon: 'success',
      confirmButtonText: 'OK',
    })
  }
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
    closePaymentModal()
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

.payment-summary {
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 15px;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.payment-summary:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);
}

.payment-info {
  display: flex;
  gap: 20px;
  align-items: center;
}

.payment-icon {
  font-size: 2rem;
  color: #4a5043;
}

.payment-details {
  flex: 1;
  color: #333;
}

.payment-details strong {
  font-size: 1.2rem;
  color: #000;
}

.payment-details p {
  margin: 5px 0;
  font-size: 0.9rem;
  color: #666;
}

.payment-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.payment-actions .btn {
  padding: 8px 15px;
  font-size: 0.9rem;
  border-radius: 6px;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

.payment-actions .btn-primary {
  background-color: #4a5043;
  color: #fff;
  border: none;
}

.payment-actions .btn-primary:hover {
  background-color: #3d4438;
}

.payment-actions .btn-secondary {
  background-color: #e9ecef;
  color: #333;
  border: 1px solid #ccc;
}

.payment-actions .btn-secondary:hover {
  background-color: #dcdcdc;
  color: #000;
}

/* Responsiveness */
@media (min-width: 768px) {
  .payment-summary {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  .payment-actions {
    justify-content: flex-start;
  }
}

.button-group {
  display: flex;
  gap: 20px;
  flex-wrap: wrap; /* Ermöglicht Zeilenumbruch */
  justify-content: center; /* Zentriert die Buttons */
}

.button-group button {
  flex: 1; /* Lässt Buttons gleichmäßig wachsen */
  min-width: 100px; /* Verhindert, dass Buttons zu klein werden */
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
