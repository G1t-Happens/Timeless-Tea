<template>
  <div class="edit-article">
    <!-- Verwende die BackButton-Komponente -->
    <BackButton />

    <!-- Titel für die Bearbeitungsseite -->
    <h2 class="page-title">Artikel bearbeiten</h2>

    <!-- Ladeanzeige während der Datenabfrage -->
    <div v-if="loading" class="text-center">
      <p>Lade Artikel...</p>
    </div>

    <!-- Formular zur Bearbeitung des Artikels, nur wenn nicht geladen -->
    <div v-else>
      <!-- Formular für die Bearbeitung eines Artikels -->
      <form
        @submit.prevent="handleSave"
        class="form-container"
        method="post"
        enctype="multipart/form-data"
      >
        <!-- Soft Delete Toggle (nur wenn der Artikel bereits existiert) -->
        <div v-if="product.id" class="form-group toggle-switch">
          <label class="form-label" for="isDeleted">Als gelöscht markieren</label>
          <label class="switch" aria-labelledby="isDeleted">
            <input v-model="product.isDeleted" type="checkbox" id="isDeleted" />
            <span class="slider round"></span>
          </label>
        </div>

        <!-- Bildvorschau -->
        <div v-if="imagePreview" class="image-preview">
          <img :src="imagePreview" alt="Vorschau des hochgeladenen Bildes" class="preview-image" />
        </div>

        <!-- Eingabefeld für den Artikelnamen -->
        <div class="form-group" :class="{ 'has-error': errors.name }">
          <label for="name" class="form-label">Artikelname</label>
          <input
            v-model="product.name"
            type="text"
            id="name"
            class="form-control"
            placeholder="z.B. Sencha Green Tea"
            @input="validateName"
            maxlength="30"
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
            v-model="product.description"
            id="description"
            class="form-control"
            placeholder="z.B. Dieser Tee..."
            @input="validateDescription"
            maxlength="512"
          />
          <span v-if="errors.description" class="error">{{ errors.description }}</span>
        </div>

        <!-- Eingabefeld für den Preis des Artikels -->
        <div class="form-group" :class="{ 'has-error': errors.price }">
          <label for="price" class="form-label">Preis in €</label>
          <input
            v-model="product.price"
            type="number"
            step="0.01"
            id="price"
            class="form-control"
            placeholder="z.B. 12.99"
            @input="validatePrice"
            min="0"
            max="1000"
            required
          />
          <span v-if="errors.price" class="error">{{ errors.price }}</span>
        </div>

        <!-- Menge pro Produkt -->
        <div class="form-group" :class="{ 'has-error': errors.quantity }">
          <label for="price" class="form-label">Menge in g (Gram)</label>
          <input
            type="number"
            step="1"
            v-model="product.quantity"
            id="quantity"
            class="form-control"
            @input="validateQuantity"
            min="1"
            max="100000"
            required
          />
          <span v-if="errors.quantity" class="error">{{ errors.quantity }}</span>
        </div>

        <!-- Dropdown für die Kategorienauswahl -->
        <div class="form-group">
          <label for="categories" class="form-label">Kategorien</label>
          <button
            class="dropdown-button"
            type="button"
            @click="toggleDropdown('categories')"
            ref="dropdownButtonRef"
          >
            ▾ Kategorien wählen
          </button>

          <!-- Dropdown-Menü -->
          <div v-if="activeDropdown === 'categories'" class="dropdown-menu" ref="dropdownMenuRef">
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

          <!-- Anzeige der ausgewählten Kategorien -->
          <div v-if="selectedCategories.length" class="selected-options">
            <strong>Ausgewählt:</strong> {{ getCategoryNames().join(', ') }}
          </div>
        </div>

        <!-- Eingabefeld für das Bild -->
        <div class="form-group">
          <label for="image" class="form-label">Neues Bild hochladen</label>
          <input
            type="file"
            id="image"
            class="form-control"
            @change="onFileChange"
            accept="image/*"
          />
        </div>

        <!-- Button zum Speichern der Änderungen -->
        <div class="button-group">
          <button
            type="submit"
            class="btn btn-primary"
            :disabled="!isFormValid"
            :class="{ 'btn-disabled': !isFormValid }"
          >
            Speichern
          </button>
          <button
            v-if="!product.isDeleted"
            type="button"
            @click="deleteArticle(product.id)"
            class="btn btn-danger"
          >
            Entfernen
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import BackButton from '@/components/navigation/BackButton.vue'
import Swal from 'sweetalert2'

// Reaktive Variablen
const route = useRoute() // Holt die aktuellen Routenparameter
const router = useRouter() // Für Navigation nach dem Speichern
const loading = ref(true) // Flag, ob die Daten noch geladen werden
const selectedCategories = ref([]) // Ausgewählte Kategorien-IDs
const organizedCategories = ref([]) // Kategorien, gruppiert nach Typ
// Reaktive Variablen
const activeDropdown = ref(null) // Verfolgt das aktive Dropdown
const dropdownButtonRef = ref(null) // Referenz zum Button
const dropdownMenuRef = ref(null) // Referenz zum Dropdown-Menü
const imagePreview = ref(null)
const product = ref({
  id: null,
  name: '',
  description: '',
  price: 0,
  quantity: 0,
  categories: [],
  image: null,
  isDeleted: false,
})
const errors = ref({
  name: '',
  description: '',
  price: '',
  quantity: '',
})

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
  await fetchCategories()
  await fetchArticle(route.params.id)
  imagePreview.value = product.value.image

  // Hinzufügen eines globalen Click-Listeners, um das Popup zu schließen
  document.addEventListener('click', handleOutsideClick)
})

onUnmounted(() => {
  // Entfernen des globalen Click-Listeners beim Verlassen der Komponente
  document.removeEventListener('click', handleOutsideClick)
})

/// Funktion zum Umschalten des Dropdown-Menüs
const toggleDropdown = (dropdown) => {
  if (activeDropdown.value === dropdown) {
    activeDropdown.value = null
  } else {
    activeDropdown.value = dropdown
  }
}

// Funktion, um Klicks außerhalb des Dropdowns zu behandeln
const handleOutsideClick = (event) => {
  const clickedInsideButton =
    dropdownButtonRef.value && dropdownButtonRef.value.contains(event.target)
  const clickedInsideMenu = dropdownMenuRef.value && dropdownMenuRef.value.contains(event.target)

  // Nur schließen, wenn der Klick außerhalb von Button und Dropdown erfolgt
  if (!clickedInsideButton && !clickedInsideMenu) {
    activeDropdown.value = null
  }
}

// Funktion zum Abrufen aller Kategorien
const fetchCategories = async () => {
  try {
    const { data } = await axios.get('/api/category')
    organizedCategories.value = organizeCategoriesByType(data) // Kategorien gruppieren
  } catch (error) {
    console.error('Fehler beim Laden der Kategorien:', error)
    await Swal.fire({
      title: 'Fehler beim Laden der Kategorien!',
      text: error.response?.data?.error || 'Ein unbekannter Fehler ist aufgetreten.',
      icon: 'error',
      confirmButtonText: 'OK',
    })
  }
}

// Funktion zum Abrufen des Artikels, der bearbeitet werden soll
const fetchArticle = async (id) => {
  loading.value = true
  try {
    const { data } = await axios.get(`/api/product/${id}`)
    // Konvertiere isDeleted zu Boolean, wobei 1 true und 0 false ist
    data.isDeleted = !!data.isDeleted // Wandelt 1 zu true und 0 zu false um
    product.value = data

    // Extrahiere IDs der ausgewählten Kategorien aus den Produktkategorien
    selectedCategories.value = data.productCategories.map((cat) => cat.id)
  } catch (error) {
    console.error('Fehler beim Laden des Artikels:', error)
    await Swal.fire({
      title: 'Fehler beim Laden des Artikel!',
      text: error.response?.data?.error || 'Ein unbekannter Fehler ist aufgetreten.',
      icon: 'error',
      confirmButtonText: 'OK',
    })
  } finally {
    loading.value = false // Ladeanzeige ausblenden
  }
}

//Validieren des Produktnamens
function validateName() {
  if (!product.value.name.trim()) {
    errors.value.name = 'Bitte einen Artikelnamen eingeben'
  } else if (product.value.name.trim().length > 30) {
    errors.value.name = 'Der Name darf max. 30 Zeichen lang sein'
  } else {
    errors.value.name = ''
  }
}

// Beschreibung (optional) – hier prüfen wir z.B. nur die maximale Länge
function validateDescription() {
  if (product.value.description.trim().length > 512) {
    errors.value.description = 'Die Beschreibung darf max. 512 Zeichen lang sein.'
  } else {
    errors.value.description = ''
  }
}

// Preis (Pflicht, max 2 Nachkommastellen)
function validatePrice() {
  const val = product.value.price
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
  const val = product.value.quantity

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
  const hasName = !!product.value.name.trim()
  const hasPrice = !!product.value.price
  const hasQuantity = !!product.value.quantity

  // Liegen Fehler vor?
  const hasErrors =
    errors.value.name || errors.value.description || errors.value.price || errors.value.quantity

  // Formular ist valid, wenn keine Errors und alle Pflichtfelder belegt
  return !hasErrors && hasName && hasPrice && hasQuantity
})

// Funktion zum Speichern der Änderungen
const handleSave = async () => {
  const formData = new FormData()

  // Pflichtfelder hinzufügen
  formData.append('name', product.value.name)
  formData.append('description', product.value.description)
  formData.append('price', product.value.price)
  formData.append('quantity', product.value.quantity)
  formData.append('isDeleted', product.value.isDeleted)
  formData.append('categories', JSON.stringify(selectedCategories.value))

  // Optional: Bild nur anhängen, wenn ein neues Bild hochgeladen wurde
  if (product.value.image instanceof File) {
    formData.append('image', product.value.image)
  }

  try {
    // PATCH-Anfrage, um den Artikel zu aktualisieren
    await axios.patch(`/api/product/${product.value.id}`, formData)
    await Swal.fire({
      title: 'Artikel geupdated!',
      text: `Artikel: "${product.value.name}" wurde erfolgreich geupdated.`,
      icon: 'success',
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
    })
    await router.push({ name: 'AdminDashboard' })
  } catch (error) {
    console.error('Fehler beim Speichern des Artikels:', error)
    await Swal.fire({
      title: 'Fehler beim Speichern des Artikels!',
      text: error.response?.data?.error || 'Ein unbekannter Fehler ist aufgetreten.',
      icon: 'error',
      confirmButtonText: 'OK',
    })
  }
}

// Artikel löschen
const deleteArticle = async (id) => {
  const result = await Swal.fire({
    title: 'Produkt entfernen?',
    text:
      'Möchten Sie dieses Produkt wirklich entfernen? Dieser Vorgang kann im' +
      ' nachhinein über die Produkte Bearbeitungsseite rückgängig gemacht werden.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Ja, entfernen',
    cancelButtonText: 'Abbrechen',
  })

  if (result.isConfirmed) {
    try {
      //Softdelete
      await axios.delete(`/api/product/${id}`)
      await Swal.fire({
        title: 'Gelöscht',
        text: 'Der User wurde erfolgreich gelöscht.',
        icon: 'success',
        confirmButtonText: 'OK',
      })
      await router.push({ name: 'AdminDashboard' })
    } catch (error) {
      console.error('Fehler beim Löschen des Artikels:', error)
      await Swal.fire({
        title: 'Fehler beim Löschen des Artikels!',
        text: error.response?.data?.error || 'Ein unbekannter Fehler ist aufgetreten.',
        icon: 'error',
        confirmButtonText: 'OK',
      })
    }
  }
}

//Vorschau des Bilds
const onFileChange = (event) => {
  const files = event.target.files
  if (files && files[0]) {
    product.value.image = files[0]
    imagePreview.value = URL.createObjectURL(files[0])
  }
}
</script>

<style scoped>
/* Stil für den Hauptcontainer */
.edit-article {
  padding: 30px;
  max-width: 800px;
  margin: 0 auto;
  background-color: #fff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

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
  transition: all 0.3s ease;
  border: none;
  display: flex; /* Buttons nebeneinander anordnen */
  flex: 1;
  justify-content: center;
  text-align: center;
}

.btn-primary {
  background-color: #4a5043;
  color: white;
}

.btn-primary:hover {
  background-color: #9fa86d;
}

.btn-danger {
  background-color: #c06e52;
  color: white;
}

.btn-danger:hover {
  background-color: #c0392b;
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

/* Button-Group */
.button-group {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.toggle-switch {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
  margin-left: 10px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.4s;
  border-radius: 34px;
}

.slider:before {
  position: absolute;
  content: '';
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #4a5043;
}

input:focus + .slider {
  box-shadow: 0 0 1px #4a5043;
}

input:checked + .slider:before {
  transform: translateX(26px);
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
