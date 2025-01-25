<template>
  <div class="contact-form">
    <h2 class="page-title">Kontaktformular</h2>
    <p>Wenn Sie Fragen haben oder Unterstützung benötigen, senden Sie uns bitte eine Nachricht.</p>

    <form @submit.prevent="submitForm" class="form-container">
      <!-- Name -->
      <div class="form-group" :class="{ 'has-error': errors.name }">
        <label for="name" class="form-label">Ihr Name</label>
        <input
          id="name"
          type="text"
          v-model="form.name"
          class="form-control"
          placeholder="Max Mustermann"
          @input="validateName"
          maxlength="60"
          required
        />
        <span v-if="errors.name" class="error">{{ errors.name }}</span>
      </div>

      <!-- Email -->
      <div class="form-group" :class="{ 'has-error': errors.email }">
        <label for="email" class="form-label">Ihre E-Mail-Adresse</label>
        <input
          id="email"
          type="email"
          v-model="form.email"
          class="form-control"
          placeholder="max@beispiel.de"
          @input="validateEmail"
          maxlength="100"
          required
        />
        <span v-if="errors.email" class="error">{{ errors.email }}</span>
      </div>

      <!-- Betreff -->
      <div class="form-group" :class="{ 'has-error': errors.subject }">
        <label for="subject" class="form-label">Betreff</label>
        <input
          id="subject"
          type="text"
          v-model="form.subject"
          class="form-control"
          placeholder="Worum geht es?"
          @input="validateSubject"
          maxlength="50"
          required
        />
        <span v-if="errors.subject" class="error">{{ errors.subject }}</span>
      </div>

      <!-- Nachricht -->
      <div class="form-group" :class="{ 'has-error': errors.message }">
        <label for="message" class="form-label">Ihre Nachricht</label>
        <textarea
          id="message"
          v-model="form.message"
          class="form-control"
          rows="5"
          placeholder="Schreiben Sie hier Ihre Nachricht..."
          @input="validateMessage"
          maxlength="500"
          required
        ></textarea>

        <!-- Dynamische Anzeige: verbleibende Zeichen -->
        <small class="char-count">
          {{ remainingChars }} von {{ maxMessageLength }} Zeichen verwendet
        </small>
        <span v-if="errors.message" class="error">{{ errors.message }}</span>
      </div>

      <!-- DATENSCHUTZ: Slider oben, Text darunter -->
      <div class="form-group toggle-switch" :class="{ 'has-error': errors.privacy }">
        <!-- EIN Label, das sowohl Slider als auch Text enthält -->
        <label class="slider-label">
          <span class="slider-container">
            <input type="checkbox" v-model="form.privacy" @change="validatePrivacy" />
            <span class="slider round"></span>
          </span>

          <!-- Der Text (darunter) -->
          <span class="small-label"> Ich stimme den Datenschutzbestimmungen zu. </span>
        </label>

        <!-- Fehlermeldung -->
        <span v-if="errors.privacy" class="error">{{ errors.privacy }}</span>
      </div>

      <!-- Absenden -->
      <div class="button-group">
        <button
          type="submit"
          class="btn btn-primary"
          :disabled="!isFormValid"
          :class="{ 'btn-disabled': !isFormValid }"
        >
          Nachricht senden
        </button>
      </div>
    </form>

    <!-- Erfolgsnachricht -->
    <p v-if="successMessage" class="success-message">
      {{ successMessage }}
    </p>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'

// Formular-Daten
const form = ref({
  name: '',
  email: '',
  subject: '',
  message: '',
  privacy: false,
})

// Fehler-Objekt
const errors = ref({
  name: '',
  email: '',
  subject: '',
  message: '',
  privacy: '',
  server: '',
})

// Erfolgsnachricht
const successMessage = ref('')

// Maximale Länge für die Nachricht
const maxMessageLength = 500

// Dynamisch ermitteln, wie viele Zeichen in `message` stehen
const remainingChars = computed(() => form.value.message.length)

// Watch für `message`: Wenn > 500, Fehlermeldung
watch(
  () => form.value.message,
  (newVal) => {
    if (newVal.length > maxMessageLength) {
      errors.value.message = `Die Nachricht darf max. ${maxMessageLength} Zeichen lang sein.`
    } else {
      errors.value.message = ''
    }
  },
)

// ========== VALIDIERUNGS-FUNKTIONEN ==========
function validateName() {
  const val = form.value.name.trim()
  if (!val) {
    errors.value.name = 'Bitte geben Sie Ihren Namen ein.'
  } else if (val.length > 60) {
    errors.value.name = 'Der Name darf max. 60 Zeichen lang sein.'
  } else {
    errors.value.name = ''
  }
}

function validateEmail() {
  const val = form.value.email.trim()
  if (!val) {
    errors.value.email = 'Bitte geben Sie Ihre E-Mail-Adresse ein.'
  } else if (!/\S+@\S+\.\S+/.test(val)) {
    errors.value.email = 'Bitte geben Sie eine gültige E-Mail-Adresse ein.'
  } else if (val.length > 100) {
    errors.value.email = 'Die E-Mail-Adresse darf max. 100 Zeichen lang sein.'
  } else {
    errors.value.email = ''
  }
}

function validateSubject() {
  const val = form.value.subject.trim()
  if (!val) {
    errors.value.subject = 'Bitte geben Sie einen Betreff ein.'
  } else if (val.length > 50) {
    errors.value.subject = 'Der Betreff darf max. 50 Zeichen lang sein.'
  } else {
    errors.value.subject = ''
  }
}

function validateMessage() {
  const val = form.value.message
  if (!val.trim()) {
    errors.value.message = 'Bitte geben Sie eine Nachricht ein.'
    return
  }
  if (val.length > maxMessageLength) {
    errors.value.message = `Die Nachricht darf max. ${maxMessageLength} Zeichen lang sein.`
    return
  }
  errors.value.message = ''
}

function validatePrivacy() {
  if (!form.value.privacy) {
    errors.value.privacy = 'Sie müssen den Datenschutzbestimmungen zustimmen.'
  } else {
    errors.value.privacy = ''
  }
}

// Gesamt-Validität
const isFormValid = computed(() => {
  // Liegen irgendwelche Fehler vor?
  const hasErrors =
    errors.value.name ||
    errors.value.email ||
    errors.value.subject ||
    errors.value.message ||
    errors.value.privacy ||
    errors.value.server

  // Sind Pflichtfelder ausgefüllt?
  const hasName = !!form.value.name.trim()
  const hasEmail = !!form.value.email.trim()
  const hasSubject = !!form.value.subject.trim()
  const hasMessage = !!form.value.message.trim()
  const hasPrivacy = form.value.privacy

  return !hasErrors && hasName && hasEmail && hasSubject && hasMessage && hasPrivacy
})

// ========== FORMULAR ABSCHICKEN ==========

async function submitForm() {
  // Letzte Validierung
  validateName()
  validateEmail()
  validateSubject()
  validateMessage()
  validatePrivacy()

  if (!isFormValid.value) {
    return
  }

  try {
    await axios.post('/api/message', form.value)
    successMessage.value = 'Vielen Dank! Ihre Nachricht wurde erfolgreich gesendet.'
    await Swal.fire({
      title: 'Nachricht gesendet!',
      text: 'Vielen Dank, wir werden uns in Kürze bei Ihnen melden.',
      icon: 'success',
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
    })

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
    errors.value.server = 'Es gab ein Problem beim Senden. Bitte versuchen Sie es später erneut.'
    await Swal.fire({
      title: 'Fehler beim Senden der Nachricht!',
      text:
        error.response?.data?.error ||
        'Es ist ein unbekannter Fehler aufgetreten. Bitte versuchen Sie es später erneut.',
      icon: 'error',
      showConfirmButton: true,
      confirmButtonText: 'OK',
    })
  }
}
</script>

<style scoped>
/* === Hauptcontainer des Formulars === */
.contact-form {
  padding: 30px;
  max-width: 800px;
  margin: 0 auto;
  background-color: #fff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

/* Titel */
.page-title {
  text-align: center;
  margin-bottom: 20px;
  font-size: 1.8rem;
  color: #333;
}

/* Formular-Layout */
.form-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

/* Formgruppen */
.form-group {
  display: flex;
  flex-direction: column;
}

.form-label {
  font-weight: bold;
  color: #333;
}

/* Inputs */
.form-control {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.form-control:focus {
  border-color: #007bff;
  outline: none;
}

/* Zeichenanzeige */
.char-count {
  font-size: 0.9rem;
  color: #666;
  margin-top: 5px;
}

/* Toggle-Switch (Datenschutz) */
.toggle-switch {
  display: flex;
  flex-direction: column; /* Slider oben, Text darunter */
  align-items: center; /* Zentrierung horizontal */
  gap: 8px;
}

/* Label, das Schalter + Text enthält */
.slider-label {
  display: flex;
  flex-direction: column; /* Schalter oben, Text darunter */
  align-items: center; /* zentriert */
  gap: 8px;
  cursor: pointer; /* Damit Text + Slider klickbar sind */
}

/* Switch-Container (Höhe/Breite) */
.slider-container {
  position: relative;
  width: 60px;
  height: 30px;
}

/* Unsichtbare Checkbox */
.slider-container input {
  opacity: 0;
  width: 0;
  height: 0;
}

/* Schienen-Hintergrund */
.slider {
  cursor: pointer;
  background-color: #ccc;
  border-radius: 22px;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  transition: 0.4s;
}

/* Runder Knopf */
.slider:before {
  content: '';
  position: absolute;
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background-color: white;
  left: 5px;
  bottom: 5px;
  transition: 0.4s;
}

/* Zustand bei checked */
.slider-container input:checked + .slider {
  background-color: #4a5043; /* Deine Farbe */
}

.slider-container input:checked + .slider:before {
  transform: translateX(28px);
}

/* Fokuszustand */
.slider-container input:focus + .slider {
  box-shadow: 0 0 1px #4a5043;
}

/* Rote Fehlermarkierung */
.has-error input,
.has-error textarea {
  border-color: #e74c3c !important;
}

/* Fehlermeldung */
.error {
  color: #e74c3c;
  font-size: 0.9rem;
  margin-top: 5px;
}

/* Button-Gruppe */
.button-group {
  display: flex;
  justify-content: flex-start;
  gap: 10px;
}

/* Allgemeine Button-Stile */
.btn {
  padding: 10px 20px;
  font-size: 1rem;
  border-radius: 5px;
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.btn-primary {
  background-color: #4a5043;
  color: white;
}

.btn-primary:hover {
  background-color: #9fa86d;
}

/* Deaktivierter Button */
.btn-disabled {
  background-color: rgba(75, 80, 67, 0.4) !important;
  cursor: not-allowed !important;
}

/* Erfolgsnachricht */
.success-message {
  margin-top: 20px;
  color: green;
  font-weight: bold;
  text-align: center;
}
</style>
