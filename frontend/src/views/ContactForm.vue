<template>
  <div class="contact-form">
    <h1>Kontaktformular</h1>
    <p>Wenn Sie Fragen haben oder Unterstützung benötigen, senden Sie uns bitte eine Nachricht.</p>
    <form @submit.prevent="submitForm" class="form">
      <!-- Name -->
      <div class="form-group">
        <label for="name">Ihr Name</label>
        <input
          id="name"
          type="text"
          v-model="form.name"
          :class="{ 'is-invalid': errors.name }"
          placeholder="Max Mustermann"
        />
        <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
      </div>

      <!-- Email -->
      <div class="form-group">
        <label for="email">Ihre E-Mail-Adresse</label>
        <input
          id="email"
          type="email"
          v-model="form.email"
          :class="{ 'is-invalid': errors.email }"
          placeholder="max@beispiel.de"
        />
        <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
      </div>

      <!-- Betreff -->
      <div class="form-group">
        <label for="subject">Betreff</label>
        <input
          id="subject"
          type="text"
          v-model="form.subject"
          :class="{ 'is-invalid': errors.subject }"
          placeholder="Worum geht es?"
        />
        <span v-if="errors.subject" class="error-message">{{ errors.subject }}</span>
      </div>

      <!-- Nachricht -->
      <div class="form-group">
        <label for="message">Ihre Nachricht</label>
        <textarea
          id="message"
          v-model="form.message"
          :class="{ 'is-invalid': errors.message }"
          rows="5"
          placeholder="Schreiben Sie hier Ihre Nachricht..."
        ></textarea>
        <span v-if="errors.message" class="error-message">{{ errors.message }}</span>
      </div>

      <!-- Zustimmung -->
      <div class="form-group checkbox-group">
        <input
          id="privacy"
          type="checkbox"
          v-model="form.privacy"
          :class="{ 'is-invalid': errors.privacy }"
        />
        <label for="privacy">
          Ich stimme den
          <router-link to="/privacy">Datenschutzbestimmungen</router-link>
          zu.
        </label>
        <span v-if="errors.privacy" class="error-message">{{ errors.privacy }}</span>
      </div>

      <!-- Absenden -->
      <button type="submit" class="btn-submit" :disabled="!form.privacy">Nachricht senden</button>
    </form>

    <!-- Erfolgsnachricht -->
    <p v-if="successMessage" class="success-message">
      Vielen Dank! Ihre Nachricht wurde erfolgreich gesendet.
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

// Formulardaten
const form = ref({
  name: '',
  email: '',
  subject: '',
  message: '',
  privacy: false,
})

// Fehlerzustände
const errors = ref({})
const successMessage = ref('')

// Validierungsregeln
const validateForm = () => {
  errors.value = {} // Zurücksetzen der Fehler

  if (!form.value.name) {
    errors.value.name = 'Bitte geben Sie Ihren Namen ein.'
  }

  if (!form.value.email) {
    errors.value.email = 'Bitte geben Sie Ihre E-Mail-Adresse ein.'
  } else if (!/\S+@\S+\.\S+/.test(form.value.email)) {
    errors.value.email = 'Bitte geben Sie eine gültige E-Mail-Adresse ein.'
  }

  if (!form.value.subject) {
    errors.value.subject = 'Bitte geben Sie einen Betreff ein.'
  }

  if (!form.value.message) {
    errors.value.message = 'Bitte geben Sie eine Nachricht ein.'
  }

  if (!form.value.privacy) {
    errors.value.privacy = 'Sie müssen den Datenschutzbestimmungen zustimmen.'
  }

  // Rückgabe true, wenn keine Fehler vorliegen
  return Object.keys(errors.value).length === 0
}

// Formular absenden
const submitForm = async () => {
  if (validateForm()) {
    try {
      await axios.post('/api/message', form.value)
      successMessage.value = 'Vielen Dank! Ihre Nachricht wurde erfolgreich gesendet.'
      // Formular zurücksetzen
      form.value = {
        name: '',
        email: '',
        subject: '',
        message: '',
        privacy: false,
      }
      errors.value = {}
    } catch (error) {
      console.error('Fehler beim Senden der Nachricht:', error.response?.data || error.message)
      errors.value.server =
        'Es gab ein Problem beim Senden Ihrer Nachricht. Bitte versuchen Sie es später erneut.'
    }
  }
}
</script>

<style scoped>
.contact-form {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
  background-color: #f9f9f9;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

h1 {
  font-size: 24px;
  margin-bottom: 10px;
  color: #c06e52;
}

p {
  line-height: 1.6;
  margin-bottom: 20px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

label {
  font-weight: bold;
  margin-bottom: 5px;
  color: #333;
}

input,
textarea {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 14px;
  transition: border-color 0.3s;
}

input:focus,
textarea:focus {
  border-color: #c06e52;
  outline: none;
}

textarea {
  resize: vertical;
}

.is-invalid {
  border-color: red;
}

.error-message {
  font-size: 12px;
  color: red;
  margin-top: 5px;
}

.checkbox-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-submit {
  background-color: #c06e52;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn-submit:disabled {
  background-color: #ccc;
  cursor: not-allowed;
  opacity: 0.6;
}

.btn-submit:hover {
  background-color: #a35b42;
}

.success-message {
  margin-top: 20px;
  color: green;
  font-weight: bold;
}
</style>
