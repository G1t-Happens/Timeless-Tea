<template>
  <!-- Hauptcontainer für die Artikel-Erstellung -->
  <div class="create-article">
    <!-- Verwende die BackButton-Komponente -->
    <BackButton />

    <!-- Überschrift -->
    <h2 class="page-title">Neuen Artikel erstellen</h2>

    <!-- Formular für die Artikeldaten -->
    <form
      @submit.prevent="createArticle"
      class="form-container"
      method="post"
      enctype="multipart/form-data"
    >
      <!-- Bildvorschau -->
      <div v-if="imagePreview" class="image-preview">
        <img :src="imagePreview" alt="Vorschau des hochgeladenen Bildes" class="preview-image" />
      </div>

      <!-- Eingabefeld für den Artikelnamen -->
      <div class="form-group" :class="{ 'has-error': errors.name }">
        <label for="name" class="form-label">Artikelname</label>
        <input
          type="text"
          v-model="name"
          id="name"
          class="form-control"
          maxlength="30"
          placeholder="z.B. Sencha Green Tea"
          @input="validateName"
          required
        />
        <!-- Fehlermeldung -->
        <span v-if="errors.name" class="error">{{ errors.name }}</span>
      </div>

      <!-- Eingabefeld für die Beschreibung (optional) -->
      <div class="form-group" :class="{ 'has-error': errors.description }">
        <label for="description" class="form-label">Beschreibung</label>
        <input
          type="text"
          v-model="description"
          id="description"
          class="form-control"
          placeholder="z.B. Dieser Tee..."
          @input="validateDescription"
          maxlength="512"
        />
        <span v-if="errors.description" class="error">{{ errors.description }}</span>
      </div>

      <!-- Eingabefeld für den Preis -->
      <div class="form-group" :class="{ 'has-error': errors.price }">
        <label for="price" class="form-label">Preis in €</label>
        <input
          type="number"
          step="0.01"
          v-model="price"
          id="price"
          class="form-control"
          placeholder="z.B. 12.99"
          @input="validatePrice"
          min="0"
          max="1000"
          required
        />
        <!-- Fehlermeldung -->
        <span v-if="errors.price" class="error">{{ errors.price }}</span>
      </div>

      <!-- Menge pro Produkt -->
      <div class="form-group" :class="{ 'has-error': errors.quantity }">
        <label for="price" class="form-label">Menge in g (Gram)</label>
        <input
          type="number"
          step="1"
          v-model="quantity"
          id="quantity"
          placeholder="z.B. 100"
          class="form-control"
          @input="validateQuantity"
          min="1"
          max="100000"
          required
        />
        <!-- Fehlermeldung -->
        <span v-if="errors.quantity" class="error">{{ errors.quantity }}</span>
      </div>

      <!-- Dropdown für Kategorienauswahl -->
      <div class="form-group">
        <label for="categories" class="form-label">Kategorien</label>
        <!-- Button zum Öffnen des Dropdown-Menüs -->
        <button class="dropdown-button" type="button" @click="toggleDropdown('categories')">
          ▾ Kategorien wählen
        </button>

        <!-- Dropdown-Menü für die Auswahl von Kategorien -->
        <div v-if="activeDropdown === 'categories'" class="dropdown-menu">
          <div v-for="group in organizedCategories" :key="group.type">
            <strong>{{ group.type }}</strong>
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

      <!-- Eingabefeld für das Bild -->
      <div class="form-group">
        <label for="image" class="form-label">Bild hochladen</label>
        <input
          type="file"
          id="image"
          class="form-control"
          @change="onFileChange"
          accept="image/*"
        />
      </div>

      <!-- Submit-Button: deaktiviert, falls Fehler -->
      <button
        type="submit"
        class="btn btn-primary w-100"
        :disabled="!isFormValid"
        :class="{ 'btn-disabled': !isFormValid }"
      >
        Artikel erstellen
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import BackButton from '@/components/navigation/BackButton.vue'
import Swal from 'sweetalert2'

// Reaktive Variablen für Formulardaten
const name = ref('')
const description = ref('')
const price = ref('')
const quantity = ref('')
const selectedCategories = ref([])
const organizedCategories = ref([])
const activeDropdown = ref(null)
const imageFile = ref(null)
const imagePreview = ref(null)
const router = useRouter()
const errors = ref({
  name: '',
  description: '',
  price: '',
  quantity: '',
})

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
    const response = await axios.get('/api/category')
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

// Funktion zur Verarbeitung der Bildauswahl
const onFileChange = (event) => {
  const files = event.target.files
  if (files && files[0]) {
    imageFile.value = files[0]
    imagePreview.value = URL.createObjectURL(files[0]) // Erzeuge eine temporäre URL für die Vorschau
  }
}

//Validieren des Produktnamens
function validateName() {
  if (!name.value.trim()) {
    errors.value.name = 'Bitte einen Artikelnamen eingeben'
  } else if (name.value.trim().length > 30) {
    errors.value.name = 'Der Name darf max. 30 Zeichen lang sein'
  } else {
    errors.value.name = ''
  }
}

// Beschreibung (optional) – hier prüfen wir z.B. nur die maximale Länge
function validateDescription() {
  if (description.value.trim().length > 512) {
    errors.value.description = 'Die Beschreibung darf max. 512 Zeichen lang sein.'
  } else {
    errors.value.description = ''
  }
}

// Preis (Pflicht, max 2 Nachkommastellen)
function validatePrice() {
  const val = price.value
  if (!val) {
    errors.value.price = 'Bitte einen Preis eingeben.'
    return
  }

  // Regex: Erlaubt nur ganze Zahl oder Zahl mit max. 2 Nachkommastellen
  const twoDecimalRegex = /^\d+(\.\d{1,2})?$/
  if (!twoDecimalRegex.test(val)) {
    errors.value.price = 'Preis darf max. zwei Nachkommastellen haben.'
    return
  }

  // Min/Max prüfen
  const numericVal = parseFloat(val)
  if (numericVal < 0 || numericVal > 1000) {
    errors.value.price = 'Preis muss zwischen 0 und 1000 liegen.'
    return
  }

  errors.value.price = ''
}

// Menge (Pflicht)
function validateQuantity() {
  // `quantity.value` ist ein Number oder kann leer/undefined sein,
  // wenn noch nichts eingegeben wurde.
  const val = quantity.value

  // 1) Leer-Check: Falls nichts eingetippt
  if (val === null || val === undefined || val === '') {
    errors.value.quantity = 'Bitte eine Menge eingeben'
    return
  }

  // 2) Prüfen, ob der Wert wirklich eine Zahl ist
  if (isNaN(val)) {
    errors.value.quantity = 'Bitte eine gültige Menge eingeben'
    return
  }

  // 3) Prüfen, ob ganzzahlig => keine Nachkommastellen
  //    Number.isInteger(12) = true, Number.isInteger(12.3) = false
  if (!Number.isInteger(val)) {
    errors.value.quantity = 'Bitte nur ganze Zahlen eingeben'
    return
  }

  // 4) Negative Zahlen abfangen
  if (val < 0) {
    errors.value.quantity = 'Die Menge darf nicht negativ sein'
    return
  }

  if (val > 100000) {
    errors.value.quantity = 'Die Menge darf nicht mehr als 100000 sein'
    return
  }

  // 5) Alles in Ordnung -> kein Fehler
  errors.value.quantity = ''
}

// Gesamtvalidität
const isFormValid = computed(() => {
  // Pflichtfelder ausgefüllt?
  const hasName = !!name.value.trim()
  const hasPrice = !!price.value
  const hasQuantity = !!quantity.value

  // Liegen Fehler vor?
  const hasErrors =
    errors.value.name || errors.value.description || errors.value.price || errors.value.quantity

  // Formular ist valid, wenn keine Errors und alle Pflichtfelder belegt
  return !hasErrors && hasName && hasPrice && hasQuantity
})

// Funktion zum Erstellen eines neuen Artikels
const createArticle = async () => {
  const formData = new FormData()
  formData.append('name', name.value)
  formData.append('description', description.value)
  formData.append('price', price.value)
  formData.append('quantity', quantity.value)
  formData.append('categories', JSON.stringify(selectedCategories.value))

  // Optional: Bild nur anhängen, wenn ein neues Bild hochgeladen wurde
  if (imageFile.value instanceof File) {
    formData.append('image', imageFile.value)
  }

  try {
    // Anfrage zum Erstellen des Artikels auf dem Server
    await axios.post('/api/product', formData)
    await Swal.fire({
      title: 'Artikel erstellt!',
      text: `Artikel: "${name.value}" wurde erfolgreich erstellt.`,
      icon: 'success',
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
    })
    await router.push({ name: 'AdminDashboard' })
  } catch (error) {
    console.error('Fehler beim Erstellen des Artikels:', error)
    await Swal.fire({
      title: 'Fehler beim Erstellen des Artikels!',
      text: error.response?.data?.error || 'Ein unbekannter Fehler ist aufgetreten.',
      icon: 'error',
      confirmButtonText: 'OK',
    })
  }
}
</script>

<style scoped>
.image-preview {
  margin-top: 10px;
  text-align: center;
}

.preview-image {
  width: 100%; /* Passt die Breite des Bildes an den Container an */
  max-width: 100%; /* Begrenzung auf die maximale Breite des Containers */
  max-height: 400px; /* Begrenzung auf eine maximale Höhe */
  border: 1px solid #ddd;
  border-radius: 8px;
  object-fit: contain; /* Zeigt das gesamte Bild an, ohne etwas abzuschneiden */
  display: block; /* Zentriert das Bild im Container */
  margin: 0 auto; /* Zentrierung für das Bild */
  background-color: #f8f9fa; /* Optional: Hintergrundfarbe für Leerflächen */
}

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

/* Dropdown-Menü */
.dropdown-button {
  padding: 8px 15px;
  background-color: #f8f9fa;
  border: 1px solid #ccc;
  border-radius: 5px;
  cursor: pointer;
  display: inline-flex;
  justify-content: space-between;
  align-items: center;
}

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
  max-width: 300px;
  margin-top: 5px;
}

.selected-options {
  margin-top: 10px;
  font-size: 14px;
  color: #555;
}

/* Fehlerzustand: roter Rahmen + Fehlermeldung */
.has-error input {
  border-color: #e74c3c !important;
}

.error {
  color: #e74c3c;
  font-size: 0.9rem;
  margin-top: 5px;
}
</style>
