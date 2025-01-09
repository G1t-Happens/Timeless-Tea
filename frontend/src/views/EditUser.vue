<template>
  <div class="edit-user">
    <BackButton />
    <h2 class="page-title form-label">Benutzer bearbeiten</h2>

    <div v-if="loading" class="text-center">
      <p>Lade Benutzer...</p>
    </div>

    <div v-else>
      <!-- Hauptformular -->
      <form @submit.prevent="handleSave" class="form-container">
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

        <!-- Zahlungsdaten: Aktuelle Methode + Bearbeiten-Button -->
        <div class="form-group">
          <h3 class="form-label">Zahlungsmethode</h3>

          <!-- Aktuelle Zahlungsmethode anzeigen -->
          <div class="payment-summary">
            <strong>Aktuell:</strong>
            <div v-if="user.payment.paymentOption === 'credit card'">
              <p><strong>Kreditkarte</strong></p>
              <p>Nummer: {{ obfuscatedCardNumber }}</p>
              <p>Ablaufdatum: {{ user.payment.expiryDate || 'n/a' }}</p>
            </div>
            <div v-else-if="user.payment.paymentOption === 'bank transfer'">
              <p><strong>Banküberweisung</strong></p>
              <p>IBAN: {{ obfuscatedIban }}</p>
            </div>
            <div v-else-if="user.payment.paymentOption === 'paypal'">
              <p><strong>PayPal</strong></p>
              <p>E-Mail: {{ obfuscatedPaypalEmail }}</p>
            </div>
            <div v-else>
              <p>Keine Zahlungsmethode hinterlegt.</p>
            </div>
          </div>

          <!-- Button zum Öffnen des Payment-Modals -->
          <button type="button" class="btn btn-secondary" @click="openPaymentModal">
            Zahlungsmethode bearbeiten
          </button>
        </div>

        <!-- Speichern/Löschen -->
        <div class="button-group">
          <button type="submit" class="btn btn-primary">Speichern</button>
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

    <!-- PaymentModal -->
    <PaymentModal :show="showPaymentModal" :payment="user.payment" @close="closePaymentModal" />
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
const showPaymentModal = ref(false)
const basePath = computed(() => (currentUser.value?.isAdmin ? '/admin' : '/user'))

// Lokales User-Objekt
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
  payment: {
    id: null,
    paymentOption: '',
    iban: '',
    creditCardNumber: '',
    expiryDate: '',
    cvc: '',
    paypalEmail: '',
  },
})

//Admins koennen auf beliebigen user per param.id zugreifen, nicht admins nur auf die eigenen user daten
onMounted(async () => {
  const userId = currentUser.value.isAdmin ? route.params.id : currentUser.value.id
  await fetchUser(userId)
})

/**
 * User-Daten laden
 */
const fetchUser = async (id) => {
  loading.value = true
  try {
    const { data } = await axios.get(`/user/${id}`)
    user.value = data

    // Falls kein Payment existiert, init default
    if (!user.value.payment) {
      user.value.payment = {
        id: null,
        paymentOption: '', // leer
        iban: '',
        creditCardNumber: '',
        expiryDate: '',
        cvc: '',
        paypalEmail: '',
      }
    }
  } catch (error) {
    console.error('Fehler beim Laden des Benutzers:', error)
    alert('Benutzer konnte nicht geladen werden.')
  } finally {
    loading.value = false
  }
}

/**
 * ALLES in einem PATCH-Call
 */
const handleSave = async () => {
  try {
    const updatedUserData = {
      emailAddress: user.value.emailAddress,
      firstName: user.value.firstName,
      lastName: user.value.lastName,
      isAdmin: user.value.isAdmin,
      address: user.value.address,
    }

    // Nur wenn der User eine paymentOption ausgewählt hat => Payment anfügen
    if (user.value.payment.paymentOption) {
      updatedUserData.payment = { ...user.value.payment }
    }

    // 1 Patch Call
    await axios.patch(`/user/${user.value.id}`, updatedUserData)

    alert('Benutzerdaten erfolgreich aktualisiert!')
    router.go()
  } catch (error) {
    console.error('Fehler beim Speichern des Benutzers:', error)
    alert('Fehler beim Speichern der Benutzerdaten')
  }
}

// Nur Admin
const deleteUser = async (id) => {
  const confirmed = window.confirm('Möchten Sie diesen Benutzer wirklich löschen?')
  if (!confirmed) return

  try {
    await axios.delete(`/user/${id}`)
    await router.push(basePath.value)
  } catch (error) {
    console.error('Fehler beim Löschen des Benutzers:', error)
    alert('Fehler beim Löschen des Benutzers')
  }
}

// Payment-Modal öffnen/schließen
const openPaymentModal = () => {
  showPaymentModal.value = true
}
const closePaymentModal = () => {
  showPaymentModal.value = false
}

// Obfuskations-Helpers
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
</style>
