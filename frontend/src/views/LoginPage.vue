<template>
  <div class="login-page">
    <!-- Container für die Login-Seite -->
    <div class="container py-5">
      <div class="row justify-content-center">
        <!-- Zentrales Login-Formular im Card-Layout -->
        <div class="col-md-6">
          <div class="card shadow-sm fixed-card">
            <div class="card-body">
              <!-- Titel des Login-Formulars -->
              <h2 class="text-center mb-4">Einloggen</h2>

              <!-- Formular zur Benutzerauthentifizierung -->
              <form @submit.prevent="login">
                <!-- Eingabefeld für die E-Mail-Adresse -->
                <div class="mb-3">
                  <label for="email" class="form-label">E-Mail</label>
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
                  <label for="password" class="form-label">Passwort</label>
                  <input
                    type="password"
                    v-model="password"
                    id="password"
                    class="form-control"
                    required
                  />
                </div>

                <!-- Login-Button -->
                <button type="submit" class="btn btn-secondary w-100">Einloggen</button>
              </form>
            </div>
          </div>

          <!-- Verweis auf die Registrierungsseite, falls der Nutzer noch kein Konto hat -->
          <p class="text-center mt-3">
            Noch kein Konto?
            <router-link :to="{ name: 'MemberShip' }">Registrieren</router-link>
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

let email = ref('')
let password = ref('')

async function login() {
  await userStore.signIn(email.value, password.value)
  if (useUserStore.user) {
    console.log('Logged in')
  }
}
</script>

<style scoped>
/* Stil für die Login-Seite */
.login-page {
  background-color: #f9f8f1; /* Helles Hintergrund für eine angenehme User-Experience */
}

/* Stil für das Card-Layout des Login-Formulars */
.fixed-card {
  border: 2px solid #4a5043; /* Dunklerer Rand für die Karte */
  border-radius: 15px; /* Abgerundete Ecken */
  background-color: #f1e2c5; /* Helles Gelb für den Hintergrund */
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2); /* Schattierung für das Karten-Layout */
}

/* Padding für den inneren Bereich der Karte */
.fixed-card .card-body {
  padding: 30px;
}

/* Stil für die Formulareingabefelder */
.form-label {
  color: #4a5043; /* Dunkelgrüne Farbe für das Label */
  font-weight: 600; /* Fettgedruckter Text */
}

/* Stil für das Textfeld und Eingabefelder */
.form-control {
  border-radius: 8px; /* Abgerundete Ecken für Eingabefelder */
  border-color: #c06e52; /* Orangefarbener Rand */
}
</style>
