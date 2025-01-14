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
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="category in paginatedCategories"
              :key="category.id"
              @dblclick="enableEditing(category.id)"
            >
              <td>{{ category.id }}</td>
              <td :class="{ 'modified-field': isModified(category.id, 'name') }">
                <input
                  v-if="isEditing(category.id)"
                  v-model="category.name"
                  @input="trackChange(category.id, 'name')"
                  @blur="disableEditing(category.id)"
                  class="edit-input"
                />
                <span v-else>{{ category.name }}</span>
              </td>
              <td :class="{ 'modified-field': isModified(category.id, 'type') }">
                <input
                  v-if="isEditing(category.id)"
                  v-model="category.type"
                  @input="trackChange(category.id, 'type')"
                  @blur="disableEditing(category.id)"
                  class="edit-input"
                />
                <span v-else>{{ category.type }}</span>
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
          :disabled="pendingChanges.length === 0"
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
    const { data } = await axios.get('/category')
    categories.value = data
    originalCategories.value = JSON.parse(JSON.stringify(data)) // Tiefenkopie für Vergleich
  } catch (error) {
    console.error('Fehler beim Laden der Kategorien:', error)
  } finally {
    loading.value = false
  }
}

// Computed Properties
const paginatedCategories = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return categories.value.slice(start, start + itemsPerPage)
})

const totalPages = computed(() => Math.ceil(categories.value.length / itemsPerPage))

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
    const isChanged = Object.keys(original).some((key) => edited[key] !== original[key])
    if (isChanged) {
      const existingIndex = pendingChanges.findIndex((c) => c.id === id)
      if (existingIndex >= 0) {
        pendingChanges[existingIndex] = { ...edited }
      } else {
        pendingChanges.push({ ...edited })
      }
    } else {
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
        axios.patch(`/category/${category.id}`, {
          name: category.name,
          type: category.type,
        }),
      ),
    )
    pendingChanges.length = 0 // Liste leeren
    await fetchCategories()
  } catch (error) {
    console.error('Fehler beim Speichern der Änderungen:', error)
  }
}

// Initialer Datenabruf
onMounted(fetchCategories)
</script>

<style scoped>
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
</style>
