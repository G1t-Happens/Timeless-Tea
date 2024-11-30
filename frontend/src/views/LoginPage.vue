<template>
  <div class="login-page">
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="card shadow-sm fixed-card">
            <div class="card-body">
              <!-- Titel -->
              <h2 class="text-center mb-4">Einloggen</h2>

              <!-- Login Formular -->
              <form @submit.prevent="handleLogin">
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
                <button type="submit" class="btn btn-primary w-100">Einloggen</button>
              </form>
            </div>
          </div>

          <!-- Verweis auf Registrierungsseite -->
          <p class="text-center mt-3">Noch kein Konto? <a href="/member">Registrieren</a></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const email = ref('')
const password = ref('')

const handleLogin = () => {
  // Login-Logik hier einfügen (z.B. API-Aufruf)
  console.log('Login:', { email: email.value, password: password.value })
}
</script>

<style scoped>
.login-page {
  background-color: #f9f8f1; /* Helles Hintergrund für die Seite */
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
</style>
