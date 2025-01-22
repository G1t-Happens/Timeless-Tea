<template>
  <!-- Hauptcontainer für die Kategorie-Erstellung -->
  <div class="create-article">
    <!-- Verwende die BackButton-Komponente -->
    <BackButton />

    <!-- Überschrift -->
    <h2 class="page-title">Neuen Kategorie erstellen</h2>

    <!-- Formular für die Kategorieerstellung -->
    <form @submit.prevent="createCategory" class="form-container" method="post">
      <!-- Eingabefeld für den kategorietype -->
      <div class="form-group">
        <label for="description" class="form-label">Kategorietype (z.B. Taste, Effect)</label>
        <input
          type="text"
          v-model="type"
          id="description"
          class="form-control"
          minlength="1"
          maxlength="20"
          required
        />
      </div>

      <!-- Eingabefeld für den Kategoriename -->
      <div class="form-group">
        <label for="name" class="form-label">Kategoriename (z.B. Fruchtig, Wuerzig)</label>
        <input
          type="text"
          v-model="name"
          id="name"
          class="form-control"
          minlength="1"
          maxlength="20"
          required
        />
      </div>

      <!-- Submit-Button für das Formular -->
      <button type="submit" class="btn btn-primary w-100">Kategorie erstellen</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import BackButton from '@/components/navigation/BackButton.vue'
import Swal from 'sweetalert2'

const name = ref('')
const type = ref('')
const router = useRouter()

// Funktion zum Erstellen einer neuen Kategorie
const createCategory = async () => {
  // Form-Daten erstellen
  const formData = {
    name: name.value,
    type: type.value,
  }

  try {
    // Anfrage zum Erstellen des Artikels auf dem Server
    await axios.post('/api/category', formData)
    await Swal.fire({
      title: 'Neue Kategorie hinzugefügt!',
      text: `Kategorie mit dem Name: "${formData.name}" und Type: "${formData.type}" wurde hinzugefügt.`,
      icon: 'success',
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
    })
    await router.push({ name: 'AdminDashboard' })
  } catch (error) {
    console.error('Fehler beim Erstellen der Kategorie:', error)
    await Swal.fire({
      title: 'Fehler beim Erstellen der Kategorie!',
      text: error.response?.data?.error || 'Ein unbekannter Fehler ist aufgetreten.',
      icon: 'error',
      confirmButtonText: 'OK',
    })
  }
}
</script>

<style scoped>
/* Stil für den Hauptcontainer der Seite */
.create-article {
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
  transition: border-color 0.3s ease;
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
  transition: background-color 0.3s;
}

.btn-primary {
  background-color: #4a5043;
  color: white;
  border: none;
}

.btn-primary:hover {
  background-color: #9fa86d;
}
</style>
