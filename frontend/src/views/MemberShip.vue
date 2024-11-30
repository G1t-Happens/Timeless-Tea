<template>
  <div class="membership-page">
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="card shadow-sm fixed-card">
            <div class="card-body">
              <!-- Titel -->
              <h2 class="text-center mb-4">Werde Mitglied bei Timeless Tea</h2>

              <!-- Registrierungsformular -->
              <form @submit.prevent="handleSubmit">
                <div class="mb-3">
                  <label for="name" class="form-label">Vorname</label>
                  <input type="text" v-model="vorname" id="name" class="form-control" required />
                </div>

                <div class="mb-3">
                  <label for="name" class="form-label">Nachname</label>
                  <input type="text" v-model="nachname" id="name" class="form-control" required />
                </div>

                <div class="mb-3">
                  <label for="email" class="form-label">E-Mail</label>
                  <input type="email" v-model="email" id="email" class="form-control" required />
                </div>

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

                <!-- Fehleranzeige -->
                <div v-if="errorMessage" class="alert alert-danger">
                  {{ errorMessage }}
                </div>

                <button type="submit" class="btn btn-primary w-100">Registrieren</button>
              </form>
            </div>
          </div>

          <!-- Mitglied werden Hinweis -->
          <p class="text-center mt-3">Schon ein Konto? <a href="/login">Einloggen</a></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const vorname = ref('')
const nachname = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const errorMessage = ref('')

const handleSubmit = () => {
  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Die Passwörter stimmen nicht überein!'
    return
  }

  // Beispiel für eine erfolgreiche Registrierung (hier kannst du deine Logik für die Registrierung hinzufügen)
  console.log('Benutzer registriert:', {
    vorname: vorname.value,
    nachname: nachname.value,
    email: email.value,
    password: password.value,
  })

  // Leere Felder nach erfolgreicher Registrierung (optional)
  vorname.value = ''
  nachname.value = ''
  email.value = ''
  password.value = ''
  confirmPassword.value = ''
  errorMessage.value = ''
}
</script>

<style scoped>
.membership-page {
  background-color: #f9f8f1;
}

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
