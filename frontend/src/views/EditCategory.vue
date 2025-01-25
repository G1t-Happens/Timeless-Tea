<template>
  <div class="edit-category">
    <!-- Verwende die BackButton-Komponente -->
    <div class="back-button-wrapper">
      <BackButton class="back-button" />
    </div>

    <h2 class="page-title">Kategorien bearbeiten</h2>

    <p class="info-text">
      Hinweis: Sie können Felder per <strong>Doppelklick</strong> bearbeiten. Änderungen werden
      gesammelt und mit einem einzigen Klick geupdated! Änderungen werden
      <strong>Rot</strong> markiert.
    </p>

    <div v-if="loading" class="text-center">
      <p>Lade Kategorien...</p>
    </div>

    <div v-else>
      <!-- Liste der Kategorien -->
      <div class="table-wrapper">
        <table class="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Typ</th>
              <th>Aktion</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="category in paginatedCategories"
              :key="category.id"
              @dblclick="enableEditing(category.id)"
            >
              <td>{{ category.id }}</td>
              <td
                :class="[
                  { 'modified-field': isModified(category.id, 'name') },
                  { 'empty-field': !category.name.trim() },
                ]"
              >
                <input
                  v-if="isEditing(category.id)"
                  v-model="category.name"
                  @input="trackChange(category.id, 'name')"
                  @blur="disableEditing(category.id)"
                  class="edit-input"
                  maxlength="10"
                  required
                />
                <span v-else>{{ category.name }}</span>
              </td>
              <td
                :class="[
                  { 'modified-field': isModified(category.id, 'type') },
                  { 'empty-field': !category.type.trim() },
                ]"
              >
                <input
                  v-if="isEditing(category.id)"
                  v-model="category.type"
                  @input="trackChange(category.id, 'type')"
                  @blur="disableEditing(category.id)"
                  class="edit-input"
                  maxlength="10"
                  required
                />
                <span v-else>{{ category.type }}</span>
              </td>
              <td class="actions-column">
                <button @click="deleteCategory(category.id)" class="btn delete-btn">Löschen</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="pagination">
        <button @click="previousPage" :disabled="currentPage === 1">Zurück</button>
        <span>Seite {{ currentPage }} von {{ totalPages }}</span>
        <button @click="nextPage" :disabled="currentPage === totalPages">Weiter</button>
      </div>

      <!-- Änderungen speichern -->
      <div class="actions">
        <button
          @click="saveChanges"
          class="btn btn-primary"
          :disabled="pendingChanges.length === 0 || hasInvalidChanges"
        >
          Änderungen speichern
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import axios from 'axios'
import BackButton from '@/components/navigation/BackButton.vue'
import Swal from 'sweetalert2'

// Reaktive Daten
const categories = ref([])
const originalCategories = ref([])
const editing = ref({})
const pendingChanges = reactive([])
const currentPage = ref(1)
const itemsPerPage = 10
const loading = ref(true)

// Funktionen für die API-Kommunikation
const fetchCategories = async () => {
  try {
    const { data } = await axios.get('/api/category')
    categories.value = data
    originalCategories.value = JSON.parse(JSON.stringify(data)) // Tiefenkopie für Vergleich
  } catch (error) {
    console.error('Fehler beim Laden der Kategorien:', error)
    await Swal.fire({
      title: 'Fehler beim Laden der Kategorien!',
      text: error.response?.data?.error || 'Ein unbekannter Fehler ist aufgetreten.',
      icon: 'error',
      confirmButtonText: 'OK',
    })
  } finally {
    loading.value = false
  }
}

// Kategorie löschen
const deleteCategory = async (id) => {
  const result = await Swal.fire({
    title: 'Kategorie löschen?',
    text: 'Möchten Sie diesen Kategorie wirklich löschen? Dieser Vorgang kann nicht rückgängig gemacht werden.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Ja, löschen',
    cancelButtonText: 'Abbrechen',
  })

  if (result.isConfirmed) {
    try {
      await axios.delete(`/api/category/${id}`)
      categories.value = categories.value.filter((category) => category.id !== id)
      originalCategories.value = originalCategories.value.filter((category) => category.id !== id)
      await Swal.fire({
        title: 'Gelöscht',
        text: 'Die ausgewählte Kategorie wurde erfolgreich gelöscht.',
        icon: 'success',
        confirmButtonText: 'OK',
      })
    } catch (error) {
      console.error('Fehler beim Löschen der Kategorie:', error)
      await Swal.fire({
        title: 'Fehler beim Löschen der Kategorie!',
        text: error.response?.data?.error || 'Ein unbekannter Fehler ist aufgetreten.',
        icon: 'error',
        confirmButtonText: 'OK',
      })
    }
  }
}

// Computed Properties
const paginatedCategories = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return categories.value.slice(start, start + itemsPerPage)
})

const totalPages = computed(() => Math.ceil(categories.value.length / itemsPerPage))

const hasInvalidChanges = computed(() => {
  return pendingChanges.some(
    (change) => !change.name.trim() || !change.type.trim(), // Prüfe, ob irgendein Feld leer ist
  )
})

// Pagination-Funktionen
const previousPage = () => {
  if (currentPage.value > 1) currentPage.value--
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
}

// Bearbeitungsfunktionen
const enableEditing = (id) => {
  editing.value[id] = true
}

const disableEditing = (id) => {
  if (editing.value[id]) {
    editing.value[id] = false
    trackPendingChanges(id)
  }
}

const isEditing = (id) => !!editing.value[id]

const trackChange = (id, field) => {
  const edited = categories.value.find((c) => c.id === id)
  if (edited) {
    const original = originalCategories.value.find((c) => c.id === id)
    if (original && edited[field] !== original[field]) {
      trackPendingChanges(id)
    }
  }
}

// Änderungen verfolgen
const trackPendingChanges = (id) => {
  const edited = categories.value.find((c) => c.id === id)
  const original = originalCategories.value.find((c) => c.id === id)

  if (edited && original) {
    // Entferne ungültige Änderungen
    if (!edited.name.trim() || !edited.type.trim()) {
      const index = pendingChanges.findIndex((c) => c.id === id)
      if (index >= 0) {
        pendingChanges.splice(index, 1)
      }
      return
    }

    // Prüfen, ob echte Änderungen existieren
    const isChanged = Object.keys(original).some((key) => edited[key] !== original[key])
    if (isChanged) {
      const existingIndex = pendingChanges.findIndex((c) => c.id === id)
      if (existingIndex >= 0) {
        pendingChanges[existingIndex] = { ...edited }
      } else {
        pendingChanges.push({ ...edited })
      }
    } else {
      // Entferne Änderungen, wenn keine Änderungen existieren
      const index = pendingChanges.findIndex((c) => c.id === id)
      if (index >= 0) {
        pendingChanges.splice(index, 1)
      }
    }
  }
}

const isModified = (id, field) => {
  const edited = categories.value.find((c) => c.id === id)
  const original = originalCategories.value.find((c) => c.id === id)
  return edited && original && edited[field] !== original[field]
}

// Änderungen speichern
const saveChanges = async () => {
  try {
    await Promise.all(
      pendingChanges.map((category) =>
        axios.patch(`/api/category/${category.id}`, {
          name: category.name,
          type: category.type,
        }),
      ),
    )
    pendingChanges.length = 0 // Liste leeren
    await Swal.fire({
      title: 'Kategorie(n) wurden erfolgreich geupdated!',
      icon: 'success',
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
    })
    await fetchCategories()
  } catch (error) {
    console.error('Fehler beim updaten der Änderungen:', error)
    await Swal.fire({
      title: 'Fehler beim updaten der Änderungen!',
      text: error.response?.data?.error || 'Ein unbekannter Fehler ist aufgetreten.',
      icon: 'error',
      confirmButtonText: 'OK',
    })
  }
}

// Initialer Datenabruf
onMounted(fetchCategories)
</script>

<style scoped>
.actions-column {
  text-align: center;
  width: 100px;
}

.delete-btn {
  padding: 5px 10px;
  background: #c06e52 !important;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
}

.delete-btn:hover {
  background: #8f4c37 !important;
}

.back-button-wrapper {
  display: flex;
  justify-content: flex-start;
  margin-top: 5px;
  margin-left: 5px;
  width: 100%;
}

.back-button {
  max-width: 150px;
  text-align: left;
}

/* Hinweistext */
.info-text {
  text-align: center;
  font-size: 1rem;
  color: #555;
  max-width: 800px;
  margin: 0 auto 20px auto;
}

/* Titel */
.page-title {
  text-align: center;
  margin: 20px 0;
  font-size: 1.8rem;
  color: #333;
}

/* Zentrierter Wrapper für die Tabelle */
.table-wrapper {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* Tabelle */
.table {
  width: 100%;
  border-collapse: collapse;
}

.table th,
.table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

.table th {
  background-color: #f4f4f4;
  font-weight: bold;
}

.edit-input {
  width: 100%;
  padding: 5px;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.modified-field {
  background-color: #ffe6e6; /* Rot markiert */
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 20px 0;
  gap: 10px;
}

.pagination button {
  padding: 10px 15px;
  background-color: #4a5043;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
}

.pagination button:hover:not(:disabled) {
  background-color: #9fa86d;
}

.pagination button:disabled {
  background-color: #ddd;
  cursor: not-allowed;
}

.pagination span {
  font-size: 1rem;
  color: #555;
}

/* Aktionen */
.actions {
  text-align: center;
  margin-top: 20px;
}

.btn {
  padding: 10px 15px;
  background-color: #4a5043;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s ease-in-out;
}

.btn:hover:not(:disabled) {
  background-color: #9fa86d;
}

.btn:disabled {
  background-color: #ddd;
  cursor: not-allowed;
}

.empty-field {
  background-color: #ffe6e6; /* Leeres Feld rot markieren */
  border: 1px solid #e74c3c;
}
</style>
