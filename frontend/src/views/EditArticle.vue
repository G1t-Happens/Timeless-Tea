<template>
  <div class="edit-article">
    <!-- Titel für die Bearbeitungsseite -->
    <h2>Artikel bearbeiten</h2>

    <!-- Ladeanzeige während der Datenabfrage -->
    <div v-if="loading" class="text-center">
      <p>Lade Artikel...</p>
    </div>

    <!-- Formular zur Bearbeitung des Artikels, nur wenn nicht geladen -->
    <div v-else>
      <!-- Formular für die Bearbeitung eines Artikels -->
      <form @submit.prevent="handleSave">
        <!-- Eingabefeld für den Artikelnamen -->
        <div class="mb-3">
          <label for="name" class="form-label">Artikelname</label>
          <input v-model="product.name" type="text" id="name" class="form-control" required />
        </div>

        <!-- Textarea für die Artikelbeschreibung -->
        <div class="mb-3">
          <label for="description" class="form-label">Beschreibung</label>
          <textarea
            v-model="product.description"
            id="description"
            class="form-control"
            required
          ></textarea>
        </div>

        <!-- Eingabefeld für den Preis des Artikels -->
        <div class="mb-3">
          <label for="price" class="form-label">Preis</label>
          <input
            v-model="product.price"
            type="number"
            step="0.01"
            id="price"
            class="form-control"
            required
          />
        </div>

        <!-- Dropdown für die Kategorienauswahl -->
        <div class="mb-3">
          <h3>Kategorien</h3>
          <!-- Button, um das Dropdown für die Kategorien zu öffnen -->
          <button class="filter-button" type="button" @click="toggleDropdown('categories')">
            ▾
          </button>

          <!-- Dropdown-Menü, das nur angezeigt wird, wenn der Button geklickt wurde -->
          <div v-if="activeDropdown === 'categories'" class="dropdown-menu">
            <!-- Gruppen von Kategorien, nach Typ organisiert -->
            <div v-for="group in organizedCategories" :key="group.type">
              <strong>{{ group.type }}</strong>
              <!-- Jede Kategorie innerhalb der Gruppe -->
              <div v-for="category in group.categories" :key="category.id">
                <label>
                  <input type="checkbox" v-model="selectedCategories" :value="category.id" />
                  {{ category.name }}
                </label>
              </div>
            </div>
          </div>

          <!-- Anzeige der ausgewählten Kategorien -->
          <div v-if="selectedCategories.length" class="selected-options">
            <strong>Ausgewählt:</strong> {{ getCategoryNames().join(', ') }}
          </div>
        </div>

        <!-- Button zum Speichern der Änderungen -->
        <button type="submit" class="btn btn-primary">Speichern</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

// Reaktive Variablen
const route = useRoute() // Holt die aktuellen Routenparameter
const router = useRouter() // Für Navigation nach dem Speichern
const loading = ref(true) // Flag, ob die Daten noch geladen werden
const selectedCategories = ref([]) // Ausgewählte Kategorien-IDs
const organizedCategories = ref([]) // Kategorien, gruppiert nach Typ
const activeDropdown = ref(null) // Verfolgt, welches Dropdown aktiv ist
const product = ref({
  id: null,
  name: '',
  description: '',
  price: 0,
  categories: [],
}) // Artikel, der bearbeitet werden soll

// Funktion zum Gruppieren von Kategorien nach ihrem Typ
const organizeCategoriesByType = (categories) => {
  const grouped = categories.reduce((group, category) => {
    const type = category.type || 'Andere' // Defaultwert 'Andere' für nicht definierte Typen
    group[type] = group[type] || []
    group[type].push(category)
    return group
  }, {})
  return Object.entries(grouped).map(([type, categories]) => ({ type, categories }))
}

// Funktion, um die Namen der ausgewählten Kategorien zu erhalten
const getCategoryNames = () => {
  return selectedCategories.value.map(
    (id) =>
      organizedCategories.value
        .flatMap((group) => group.categories)
        .find((category) => category.id === id)?.name,
  )
}

// Funktion, die beim Laden der Seite aufgerufen wird
onMounted(async () => {
  await fetchCategories() // Kategorien abrufen
  await fetchArticle(route.params.id) // Artikel anhand der ID abrufen
})

// Funktion zum Abrufen aller Kategorien
const fetchCategories = async () => {
  try {
    const { data } = await axios.get('/category')
    organizedCategories.value = organizeCategoriesByType(data) // Kategorien gruppieren
  } catch (error) {
    console.error('Fehler beim Laden der Kategorien:', error)
  }
}

// Funktion zum Abrufen des Artikels, der bearbeitet werden soll
const fetchArticle = async (id) => {
  loading.value = true // Setzt das Loading-Flag auf true, um die Ladeanzeige zu zeigen
  try {
    const { data } = await axios.get(`/product/${id}`)
    product.value = data // Produktdaten zuweisen

    // IDs der ausgewählten Kategorien aus den Produktkategorien extrahieren
    selectedCategories.value = data.productCategories.map((cat) => cat.id)
  } catch (error) {
    console.error('Fehler beim Laden des Artikels:', error)
  } finally {
    loading.value = false // Ladeanzeige ausblenden
  }
}

// Funktion, um die Änderungen des Artikels zu speichern
const handleSave = async () => {
  try {
    // Daten für den Patch-Aufruf vorbereiten
    const updatedData = {
      name: product.value.name,
      description: product.value.description,
      price: product.value.price,
      productCategories: selectedCategories.value,
    }

    // PATCH-Anfrage, um den Artikel zu aktualisieren
    await axios.patch(`/product/${product.value.id}`, updatedData)

    // Nach dem Speichern auf das Admin-Dashboard weiterleiten
    await router.push('/admin')
  } catch (error) {
    console.error('Fehler beim Speichern des Artikels:', error)
  }
}

// Funktion zum Umschalten des Dropdown-Menüs
const toggleDropdown = (dropdown) => {
  activeDropdown.value = activeDropdown.value === dropdown ? null : dropdown
}
</script>

<style scoped>
/* Stil für den Hauptcontainer */
.edit-article {
  padding: 20px;
}

/* Stil für Form-Labels */
.form-label {
  font-weight: bold;
}

/* Stil für den Speichern-Button */
button {
  margin-top: 20px;
}

/* Stil für das Dropdown-Menü */
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
  max-width: 300px; /* Maximale Breite des Dropdowns */
}

/* Stil für die Anzeige der ausgewählten Kategorien */
.selected-options {
  margin-top: 5px;
  font-size: 14px;
  color: #555;
}
</style>
