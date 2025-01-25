<template>
  <div class="membership-page">
    <!-- Container für die Seite zur Registrierung -->
    <div class="container py-5">
      <div class="row justify-content-center">
        <!-- Zentrales Registrierungsformular im Card-Layout -->
        <div class="col-md-6">
          <div class="card shadow-sm fixed-card">
            <div class="card-body">
              <!-- Titel des Registrierungsformulars -->
              <h2 class="text-center mb-4">Werde Mitglied bei Timeless Tea</h2>

              <!-- Formular zur Registrierung -->
              <form @submit.prevent="register">
                <!-- Eingabefeld für den Vornamen -->
                <div class="mb-3">
                  <label for="firstName" class="form-label">Vorname*</label>
                  <input
                    type="text"
                    v-model="firstName"
                    id="firstName"
                    class="form-control"
                    maxlength="50"
                    required
                  />
                </div>

                <!-- Eingabefeld für den Nachnamen -->
                <div class="mb-3">
                  <label for="lastName" class="form-label">Nachname*</label>
                  <input
                    type="text"
                    v-model="lastName"
                    id="lastName"
                    class="form-control"
                    maxlength="50"
                    required
                  />
                </div>

                <!-- Eingabefeld für die E-Mail-Adresse -->
                <div class="mb-3">
                  <label for="email" class="form-label">E-Mail*</label>
                  <input
                    type="email"
                    v-model="email"
                    id="email"
                    class="form-control"
                    maxlength="100"
                    required
                  />
                </div>

                <!-- Eingabefeld für das Passwort -->
                <div class="mb-3">
                  <label for="password" class="form-label">Passwort*</label>
                  <input
                    type="password"
                    v-model="password"
                    id="password"
                    class="form-control"
                    required
                  />
                </div>

                <!-- Eingabefeld für die Bestätigung des Passworts -->
                <div class="mb-3">
                  <label for="confirmPassword" class="form-label">Passwort bestätigen*</label>
                  <input
                    type="password"
                    v-model="confirmPassword"
                    id="confirmPassword"
                    class="form-control"
                    required
                  />
                </div>

                <!-- Adressfelder -->
                <h4 class="mt-4">Adressenangabe</h4>

                <!-- Land -->
                <div class="mb-3">
                  <label for="country" class="form-label">Land*</label>
                  <input
                    type="text"
                    v-model="country"
                    id="country"
                    class="form-control"
                    maxlength="60"
                    required
                  />
                </div>

                <!-- Bundesland (optional) -->
                <div class="mb-3">
                  <label for="state" class="form-label">Bundesland (optional)</label>
                  <input
                    type="text"
                    v-model="state"
                    id="state"
                    class="form-control"
                    maxlength="50"
                  />
                </div>

                <!-- Stadt -->
                <div class="mb-3">
                  <label for="city" class="form-label">Stadt*</label>
                  <input
                    type="text"
                    v-model="city"
                    id="city"
                    class="form-control"
                    maxlength="50"
                    required
                  />
                </div>

                <!-- Postleitzahl -->
                <div class="mb-3">
                  <label for="postalCode" class="form-label">Postleitzahl*</label>
                  <input
                    type="text"
                    v-model="postalCode"
                    id="postalCode"
                    class="form-control"
                    maxlength="10"
                    required
                  />
                </div>

                <!-- Straße -->
                <div class="mb-3">
                  <label for="street" class="form-label">Straße*</label>
                  <input
                    type="text"
                    v-model="street"
                    id="street"
                    class="form-control"
                    maxlength="30"
                    required
                  />
                </div>

                <!-- Hausnummer -->
                <div class="mb-3">
                  <label for="houseNumber" class="form-label">Hausnummer*</label>
                  <input
                    type="text"
                    v-model="houseNumber"
                    id="houseNumber"
                    class="form-control"
                    maxlength="8"
                    required
                  />
                </div>

                <!-- Adresszusatz (optional) -->
                <div class="mb-3">
                  <label for="addressAddition" class="form-label">Adresszusatz (optional)</label>
                  <input
                    type="text"
                    v-model="addressAddition"
                    id="addressAddition"
                    class="form-control"
                    maxlength="150"
                  />
                </div>

                <!-- Anzeige für Fehlernachrichten -->
                <div v-if="errorMessage" class="alert alert-danger">
                  {{ errorMessage }}
                </div>

                <!-- Button zum Absenden des Formulars -->
                <button type="submit" class="btn btn-primary w-100">Registrieren</button>
              </form>
            </div>
          </div>

          <!-- Link zur Login-Seite für bereits registrierte Benutzer -->
          <p class="text-center mt-3">
            Schon ein Konto?
            <router-link :to="{ name: 'Login' }">Einloggen</router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useUserStore } from '../stores/user'

const userStore = useUserStore()

// Reaktive Variablen für die Eingabefelder (Namen, E-Mail, Passwörter)
const firstName = ref('')
const lastName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const errorMessage = ref('')

// Reaktive Variablen für die Adresse
const country = ref('')
const state = ref('')
const city = ref('')
const postalCode = ref('')
const street = ref('')
const houseNumber = ref('')
const addressAddition = ref('')

// Methode zur Handhabung des Formulars nach Absenden
async function register() {
  // Überprüfung, ob die Passwörter übereinstimmen
  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Die Passwörter stimmen nicht überein!'
    return
  }

  // Hier rufst du den Store auf, um den User mit Adresse zu registrieren
  // Passe die Signatur ggf. an deinen User Store an.
  // Beispielhafter Aufruf mit Objektstruktur:
  try {
    await userStore.signUp({
      firstName: firstName.value,
      lastName: lastName.value,
      emailAddress: email.value, // entsprechend deinem User-Modell: 'emailAddress'
      password: password.value,
      address: {
        country: country.value,
        state: state.value || '', // optional
        city: city.value,
        postalCode: postalCode.value,
        street: street.value,
        houseNumber: houseNumber.value,
        addressAddition: addressAddition.value || '', // optional
      },
      // Falls du Payment-Informationen bereits hier abfragen möchtest, füge sie analog hinzu.
    })

    if (userStore.user) {
      console.log('Erfolgreich registriert und eingeloggt!')
    }

    // Felder nach erfolgreicher Registrierung leeren
    firstName.value = ''
    lastName.value = ''
    email.value = ''
    password.value = ''
    confirmPassword.value = ''
    country.value = ''
    state.value = ''
    city.value = ''
    postalCode.value = ''
    street.value = ''
    houseNumber.value = ''
    addressAddition.value = ''
    errorMessage.value = ''
  } catch (err) {
    // Fehler abfangen und im Frontend anzeigen
    errorMessage.value = err.message || 'Registrierung fehlgeschlagen.'
  }
}
</script>

<style scoped>
/* Stil für die Membership-Seite */
.membership-page {
  background-color: #f9f8f1; /* Heller Hintergrund */
}

/* Stil für die Card-Komponente */
.fixed-card {
  border: 2px solid #4a5043;
  border-radius: 15px;
  background-color: #f1e2c5;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

.fixed-card .card-body {
  padding: 30px;
}

.form-label {
  color: #4a5043;
  font-weight: 600;
}

.form-control {
  border-radius: 8px;
  border-color: #c06e52;
}

.btn-primary {
  background-color: #c06e52;
  border-color: #c06e52;
  border-radius: 8px;
}

.btn-primary:hover {
  background-color: #9f7a56;
  border-color: #9f7a56;
}

.alert {
  margin-top: 10px;
  font-size: 14px;
}
</style>
