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
                  <label for="name" class="form-label">Vorname</label>
                  <input type="text" v-model="firstName" id="name" class="form-control" required />
                </div>

                <!-- Eingabefeld für den Nachnamen -->
                <div class="mb-3">
                  <label for="name" class="form-label">Nachname</label>
                  <input type="text" v-model="lastName" id="name" class="form-control" required />
                </div>

                <!-- Eingabefeld für die E-Mail-Adresse -->
                <div class="mb-3">
                  <label for="email" class="form-label">E-Mail</label>
                  <input type="email" v-model="email" id="email" class="form-control" required />
                </div>

                <!-- Eingabefeld für das Passwort -->
                <div class="mb-3">
                  <label for="password" class="form-label">Passwort</label>
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
                  <label for="confirmPassword" class="form-label">Passwort bestätigen</label>
                  <input
                    type="password"
                    v-model="confirmPassword"
                    id="confirmPassword"
                    class="form-control"
                    required
                  />
                </div>

                <!-- Anzeige für Fehlernachrichten (z.B. wenn Passwörter nicht übereinstimmen) -->
                <div v-if="errorMessage" class="alert alert-danger">
                  {{ errorMessage }}
                </div>

                <!-- Button zum Absenden des Formulars -->
                <button type="submit" class="btn btn-primary w-100">Registrieren</button>
              </form>
            </div>
          </div>

          <!-- Link zur Login-Seite für bereits registrierte Benutzer -->
          <p class="text-center mt-3">Schon ein Konto? <a href="/login">Einloggen</a></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useUserStore } from "../stores/user";
const userStore = useUserStore();
// Reaktive Variablen für die Eingabefelder (Vorname, Nachname, E-Mail, Passwort, Passwortbestätigung, Fehlernachricht)
const firstName = ref('')
const lastName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const errorMessage = ref('')

// Methode zur Handhabung des Formulars nach Absenden
async function register() {
  // Überprüfung, ob die Passwörter übereinstimmen
  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Die Passwörter stimmen nicht überein!' // Fehlernachricht setzen
    return
  }

  userStore.signUp(firstName.value, lastName.value, email.value, password.value);
  if (useUserStore.user) {
    console.log("Logged in")
  }

  // Felder nach erfolgreicher Registrierung leeren (optional)
  firstName.value = ''
  lastName.value = ''
  email.value = ''
  password.value = ''
  confirmPassword.value = ''
  errorMessage.value = '' // Fehlernachricht zurücksetzen
}
</script>

<style scoped>
/* Stil für die Membership-Seite */
.membership-page {
  background-color: #f9f8f1; /* Helles Hintergrund für eine angenehme User-Experience */
}

/* Stil für die Card-Komponente */
.fixed-card {
  border: 2px solid #4a5043; /* Dunkelgrüner Rand für die Card */
  border-radius: 15px; /* Abgerundete Ecken */
  background-color: #f1e2c5; /* Helles Gelb für den Hintergrund */
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2); /* Schattierung für das Card-Layout */
}

/* Innenabstand der Card */
.fixed-card .card-body {
  padding: 30px;
}

/* Stil für die Formulareingabefelder (Labels) */
.form-label {
  color: #4a5043; /* Dunkelgrüne Farbe für das Label */
  font-weight: 600; /* Fettgedruckter Text */
}

/* Stil für die Eingabefelder */
.form-control {
  border-radius: 8px; /* Abgerundete Ecken für Eingabefelder */
  border-color: #c06e52; /* Orangefarbener Rand */
}

/* Stil für den Button */
.btn-primary {
  background-color: #c06e52; /* Orangefarbener Hintergrund */
  border-color: #c06e52; /* Orangefarbener Rand */
  border-radius: 8px; /* Abgerundete Ecken */
}

/* Hover-Effekt für den Button */
.btn-primary:hover {
  background-color: #9f7a56; /* Dunkleres Orange beim Hover */
  border-color: #9f7a56; /* Dunklerer Rand beim Hover */
}

/* Stil für die Fehlernachricht (alert) */
.alert {
  margin-top: 10px; /* Abstand nach oben */
  font-size: 14px; /* Kleinere Schriftgröße für die Fehlernachricht */
}
</style>
