<template>
  <div class="edit-user">
    <!-- Verwende die BackButton-Komponente -->
    <BackButton />

    <!-- Titel für die Bearbeitungsseite -->
    <h2 class="page-title form-label">Benutzer bearbeiten</h2>

    <!-- Ladeanzeige während der Datenabfrage -->
    <div v-if="loading" class="text-center">
      <p>Lade Benutzer...</p>
    </div>

    <!-- Formular zur Bearbeitung des Benutzers -->
    <div v-else>
      <form @submit.prevent="handleSave" class="form-container">
        <!-- Bildvorschau (optional) -->
        <div v-if="user.profileImage" class="image-preview">
          <img :src="user.profileImage" alt="Vorschau des Profilbildes" class="preview-image" />
        </div>

        <!-- Eingabefeld für die E-Mail-Adresse -->
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

        <!-- Vornamen -->
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

        <!-- Nachnamen -->
        <div class="form-group">
          <label for="lastName" class="form-label">Nachname</label>
          <input v-model="user.lastName" type="text" id="lastName" class="form-control" required />
        </div>

        <!-- Toggle-Switch für Admin-Status -->
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

          <label for="city" class="form-label">Stadt</label>
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

        <!-- Zahlungsmethode (optional) -->
        <div class="form-group">
          <h3 class="form-label">Zahlungsmethode</h3>
          <button class="dropdown-button" type="button" @click="toggleDropdown('payment')">
            ▾ Zahlungsmethode bearbeiten
          </button>
          <div v-if="activeDropdown === 'payment'" class="dropdown-menu">
            <div class="payment-fields">
              <div class="form-group">
                <label for="paymentOption" class="form-label">Zahlungsoption</label>
                <select
                  v-model="user.payment.paymentOption"
                  id="paymentOption"
                  class="form-control"
                >
                  <option value="credit card">Kreditkarte</option>
                  <option value="bank transfer">Banküberweisung</option>
                  <option value="paypal">PayPal</option>
                </select>
              </div>
              <div class="form-group">
                <label for="currency" class="form-label">Währung</label>
                <input
                  v-model="user.payment.currency"
                  type="text"
                  id="currency"
                  class="form-control"
                />
              </div>
              <div class="form-group">
                <label for="iban" class="form-label">IBAN</label>
                <input v-model="user.payment.iban" type="text" id="iban" class="form-control" />
              </div>
            </div>
          </div>
        </div>

        <!-- Button-Gruppe für Speichern und Löschen -->
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
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import BackButton from '@/components/navigation/BackButton.vue'

const userStore = useUserStore()
const currentUser = computed(() => userStore.user)
const route = useRoute()
const router = useRouter()
const loading = ref(true)
const activeDropdown = ref(null)
const basePath = computed(() => (currentUser.value?.isAdmin ? '/admin' : '/user'))
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
    paymentOption: 'Rechnung',
    currency: 'EUR',
    iban: '',
  },
  profileImage: null, // Falls du Bilder verwaltest
})

// Daten laden
onMounted(async () => {
  await fetchUser(route.params.id)
})

const fetchUser = async (id) => {
  loading.value = true
  try {
    const response = await axios.get(`/user/${id}`)
    user.value = response.data
  } catch (error) {
    console.error('Fehler beim Laden des Benutzers:', error)
  } finally {
    loading.value = false
  }
}

//Benutzer Updaten
const handleSave = async () => {
  try {
    const updatedData = {
      emailAddress: user.value.emailAddress,
      firstName: user.value.firstName,
      lastName: user.value.lastName,
      isAdmin: user.value.isAdmin,
      address: user.value.address,
    }

    // PATCH /user/:id
    await axios.patch(`/user/${user.value.id}`, updatedData)

    // Erfolgreich gespeichert => z.B. zurück zur Admin-Übersicht
    await router.push(basePath.value)
  } catch (error) {
    console.error('Fehler beim Speichern des Benutzers:', error)
    alert('Fehler beim Speichern des Benutzers')
  }
}

// Benutzer löschen
const deleteUser = async (id) => {
  const confirmed = window.confirm('Möchten Sie diesen Benutzer wirklich löschen?')
  if (!confirmed) return

  try {
    await axios.delete(`/user/${id}`)
    await router.push(basePath.value)
  } catch (error) {
    console.error('Fehler beim Löschen des Benutzers:', error)
  }
}

// Dropdowns ein-/ausklappen
const toggleDropdown = (dropdown) => {
  activeDropdown.value = activeDropdown.value === dropdown ? null : dropdown
}
</script>

<style scoped>
/* Stil für den Hauptcontainer */
.edit-user {
  padding: 30px;
  max-width: 800px;
  margin: 0 auto;
  background-color: #fff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

.image-preview {
  margin-top: 10px;
  text-align: center;
}

.preview-image {
  width: 100%; /* Passt die Breite des Bildes an den Container an */
  max-width: 100%; /* Begrenzung auf die maximale Breite des Containers */
  max-height: 400px; /* Begrenzung auf eine maximale Höhe */
  border: 1px solid #ddd;
  border-radius: 8px;
  object-fit: contain; /* Zeigt das gesamte Bild an, ohne etwas abzuschneiden */
  display: block; /* Zentriert das Bild im Container */
  margin: 0 auto; /* Zentrierung für das Bild */
  background-color: #f8f9fa; /* Optional: Hintergrundfarbe für Leerflächen */
}

/* Titel */
.page-title {
  text-align: center;
  margin-bottom: 30px;
  font-size: 1.8rem;
  color: #333;
}

/* Form-Container */
.form-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

/* Formulareingabefelder */
.form-group {
  display: flex;
  flex-direction: column;
}

.form-label {
  font-weight: bold;
  color: #333;
}

.form-control {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
}

.form-control:focus {
  border-color: #007bff;
  outline: none;
}

/* Button-Stile */
button {
  padding: 10px 20px;
  font-size: 1rem;
  border-radius: 5px;
  transition: all 0.3s ease;
  border: none;
  display: flex; /* Buttons nebeneinander anordnen */
  flex: 1;
  justify-content: center;
  text-align: center;
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

/* Dropdown-Menü */
.dropdown-button {
  padding: 8px 15px;
  background-color: #f8f9fa;
  border: 1px solid #ccc;
  border-radius: 5px;
  cursor: pointer;
  display: inline-flex;
  justify-content: space-between;
  align-items: center;
}

.dropdown-menu {
  background: #f9f9f9;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 10px;
  position: absolute;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 300px;
  margin-top: 5px;
}

.address-fields,
.payment-fields {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}

/* Stil für den Toggle-Switch */
.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
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

/* Runde Slider-Kanten */
.slider.round {
  border-radius: 34px;
}

.slider.round:before {
  border-radius: 50%;
}

/* Optional: Farben anpassen */
.switch input:checked + .slider {
  background-color: #4a5043; /* Farbe wenn aktiviert */
}

.switch input:checked + .slider:before {
  background-color: white;
}

/* Button-Group */
.button-group {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}
</style>
