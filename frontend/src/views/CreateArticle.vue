<template>
  <!-- Hauptcontainer für die Artikel-Erstellung -->
  <div class="create-article">
    <!-- Überschrift -->
    <h2 class="text-center mb-4">Neuen Artikel erstellen</h2>

    <!-- Formular für die Artikeldaten -->
    <form @submit.prevent="createArticle">
      <!-- Eingabefeld für den Artikelnamen -->
      <div class="mb-3">
        <label for="name" class="form-label">Artikelname</label>
        <input type="text" v-model="name" id="name" class="form-control" required />
      </div>

      <!-- Eingabefeld für die Beschreibung -->
      <div class="mb-3">
        <label for="description" class="form-label">Beschreibung</label>
        <input type="text" v-model="description" id="description" class="form-control" required />
      </div>

      <!-- Eingabefeld für den Preis -->
      <div class="mb-3">
        <label for="price" class="form-label">Preis in €</label>
        <input type="number" step="0.01" v-model="price" id="price" class="form-control" required />
      </div>

      <!-- Dropdown für Kategorienauswahl -->
      <div class="mb-3">
        <h3>Kategorien</h3>
        <!-- Button zum Öffnen des Dropdown-Menüs -->
        <button class="filter-button" type="button" @click="toggleDropdown('categories')">▾</button>

        <!-- Dropdown-Menü für die Auswahl von Kategorien -->
        <div v-if="activeDropdown === 'categories'" class="dropdown-menu">
          <!-- Gruppen von Kategorien, nach Typ sortiert -->
          <div v-for="group in organizedCategories" :key="group.type">
            <strong>{{ group.type }}</strong>
            <!-- Einzelne Kategorien innerhalb einer Gruppe -->
            <div v-for="category in group.categories" :key="category.id">
              <label>
                <input type="checkbox" v-model="selectedCategories" :value="category.id" />
                {{ category.name }}
              </label>
            </div>
          </div>
        </div>

        <!-- Anzeige der aktuell ausgewählten Kategorien -->
        <div v-if="selectedCategories.length" class="selected-options">
          <strong>Ausgewählt:</strong> {{ getCategoryNames().join(', ') }}
        </div>
      </div>

      <!-- Submit-Button für das Formular -->
      <button type="submit" class="btn btn-primary w-100">Artikel erstellen</button>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

// Reaktive Variablen für Formulardaten
const name = ref('')
const description = ref('')
const price = ref('')
const selectedCategories = ref([]) // Array für ausgewählte Kategorien-IDs
const organizedCategories = ref([]) // Liste der Kategorien, nach Typ gruppiert
const activeDropdown = ref(null) // Aktuell geöffnetes Dropdown-Menü

// Router-Instanz für Navigation nach erfolgreicher Erstellung des Artikels
const router = useRouter()

// Funktion zum Gruppieren von Kategorien nach Typ
const organizeCategoriesByType = (categories) => {
  const grouped = categories.reduce((group, category) => {
    const type = category.type || 'Andere' // Standardwert 'Andere', falls kein Typ definiert ist
    group[type] = group[type] || []
    group[type].push(category)
    return group
  }, {})

  // Rückgabe als Array mit Typ und zugehörigen Kategorien
  return Object.entries(grouped).map(([type, categories]) => ({ type, categories }))
}

// Beim Laden der Komponente: Kategoriedaten abrufen und gruppieren
onMounted(async () => {
  try {
    const response = await axios.get('/category')
    organizedCategories.value = organizeCategoriesByType(response.data)
  } catch (error) {
    console.error('Fehler beim Laden der Kategorien:', error)
  }
})

// Funktion zum Umschalten des geöffneten Dropdown-Menüs
const toggleDropdown = (dropdown) => {
  activeDropdown.value = activeDropdown.value === dropdown ? null : dropdown
}

// Funktion, um die Namen der ausgewählten Kategorien zu erhalten
const getCategoryNames = () => {
  return selectedCategories.value.map(
    (id) =>
      organizedCategories.value.flatMap((group) => group.categories).find((c) => c.id === id)?.name,
  )
}

// Funktion zum Erstellen eines neuen Artikels
const createArticle = async () => {
  // Artikelobjekt basierend auf den Formulardaten
  const newArticle = {
    name: name.value,
    description: description.value,
    price: price.value,
    categories: selectedCategories.value,
  }

  try {
    // Anfrage zum Erstellen des Artikels auf dem Server
    const response = await axios.post('/product', newArticle)
    console.log('Artikel erfolgreich erstellt:', response.data)

    // Nach erfolgreicher Erstellung zur Admin-Seite navigieren
    await router.push('/admin')
  } catch (error) {
    console.error('Fehler beim Erstellen des Artikels:', error)
  }
}
</script>

<style scoped>
/* Stil für den Hauptcontainer der Seite */
.create-article {
  padding: 20px;
}

/* Stil für den Button, der das Dropdown öffnet */
.filter-button {
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 5px 10px;
  cursor: pointer;
}

/* Stil für das Dropdown-Menü der Kategorien */
.dropdown-menu {
  background: #f9f9f9;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 10px;
  position: absolute;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 300px; /* Anpassung je nach Layout */
}

/* Stil für die Anzeige der ausgewählten Kategorien */
.selected-options {
  margin-top: 5px;
  font-size: 14px;
  color: #555;
}
</style>
