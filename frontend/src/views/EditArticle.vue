<template>
  <div class="edit-article">

    <!-- Header mit Zurück-Button und Titel -->
    <div class="header">
      <button type="button" @click="goBack" class="btn-back" title="Zurück zur vorherigen Seite">
        <!-- SVG-Icon für den Zurück-Pfeil -->
        <svg xmlns="http://www.w3.org/2000/svg" class="back-icon" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
        </svg>
        Zurück
      </button>
    </div>

    <!-- Titel für die Bearbeitungsseite -->
    <h2 class="page-title">Artikel bearbeiten</h2>

    <!-- Ladeanzeige während der Datenabfrage -->
    <div v-if="loading" class="text-center">
      <p>Lade Artikel...</p>
    </div>

    <!-- Formular zur Bearbeitung des Artikels, nur wenn nicht geladen -->
    <div v-else>
      <!-- Formular für die Bearbeitung eines Artikels -->
      <form @submit.prevent="handleSave" class="form-container" method="post" enctype="multipart/form-data">

        <!-- Bildvorschau -->
        <div v-if="imagePreview" class="image-preview">
          <img :src="imagePreview" alt="Vorschau des hochgeladenen Bildes" class="preview-image" />
        </div>

        <!-- Eingabefeld für den Artikelnamen -->
        <div class="form-group">
          <label for="name" class="form-label">Artikelname</label>
          <input v-model="product.name" type="text" id="name" class="form-control" required />
        </div>

        <!-- Textarea für die Artikelbeschreibung -->
        <div class="form-group">
          <label for="description" class="form-label">Beschreibung</label>
          <textarea
            v-model="product.description"
            id="description"
            class="form-control"
            required
          ></textarea>
        </div>

        <!-- Eingabefeld für den Preis des Artikels -->
        <div class="form-group">
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
        <div class="form-group">
          <label for="categories" class="form-label">Kategorien</label>
          <button class="dropdown-button" type="button" @click="toggleDropdown('categories')">
            ▾ Kategorien wählen
          </button>

          <!-- Dropdown-Menü, das nur angezeigt wird, wenn der Button geklickt wurde -->
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

          <!-- Anzeige der ausgewählten Kategorien -->
          <div v-if="selectedCategories.length" class="selected-options">
            <strong>Ausgewählt:</strong> {{ getCategoryNames().join(', ') }}
          </div>
        </div>

        <!-- Eingabefeld für das Bild -->
        <div class="form-group">
          <label for="image" class="form-label">Neues Bild hochladen</label>
          <input type="file" id="image" class="form-control" @change="onFileChange" accept="image/*" />
        </div>

        <!-- Button zum Speichern der Änderungen -->
        <div class="button-group">
          <button type="submit" class="btn btn-primary">Speichern</button>
          <button type="button" @click="deleteArticle(product.id)" class="btn btn-danger">
            Löschen
          </button>
        </div>
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
const imagePreview = ref(null);
const product = ref({
  id: null,
  name: '',
  description: '',
  price: 0,
  categories: [],
  image: null,
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
  await fetchCategories() // Kategorien abrufen
  await fetchArticle(route.params.id) // Artikel anhand der ID abrufen
  imagePreview.value = product.value.image; // Aktuellstes Bild ins preview laden
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

// Funktion zum Speichern der Änderungen
const handleSave = async () => {
  const formData = new FormData();

  // Pflichtfelder hinzufügen
  formData.append('name', product.value.name);
  formData.append('description', product.value.description);
  formData.append('price', product.value.price);
  formData.append('categories', JSON.stringify(selectedCategories.value));

  // Optional: Bild nur anhängen, wenn ein neues Bild hochgeladen wurde
  if (product.value.image instanceof File) {
    formData.append('image', product.value.image);
  }

  try {
    // PATCH-Anfrage, um den Artikel zu aktualisieren
    await axios.patch(`/product/${product.value.id}`, formData);

    // Nach dem Speichern auf das Admin-Dashboard weiterleiten
    await router.push('/admin');
  } catch (error) {
    console.error('Fehler beim Speichern des Artikels:', error);
  }
};


// Artikel löschen
const deleteArticle = async (id) => {

  const confirmed = window.confirm("Möchten Sie diesen Artikel wirklich löschen?");
  if (!confirmed) {
    return;
  }

  try {
    await axios.delete(`/product/${id}`)
    // Nach dem Löschen auf das Admin-Dashboard weiterleiten
    await router.push('/admin')
  } catch (error) {
    console.error('Fehler beim Löschen des Artikels:', error)
  }
}

// Funktion zum Umschalten des Dropdown-Menüs
const toggleDropdown = (dropdown) => {
  activeDropdown.value = activeDropdown.value === dropdown ? null : dropdown
}

//Vorschau des Bilds
const onFileChange = (event) => {
  const files = event.target.files;
  if (files && files[0]) {
    product.value.image = files[0];
    imagePreview.value = URL.createObjectURL(files[0]);
  }
};

// Funktion um zur letzen Seite zu gelangen
const goBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/admin') // Fallback zu einer Standardseite
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
  background-color: #C06E52;
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

/* Header mit Zurück-Button und Titel */
.header {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
}

/* Stil für den Zurück-Button */
.btn-back {
  background-color: #f0f0f0; /* Heller Hintergrund */
  color: #4a5043; /* Textfarbe */
  border: none; /* Kein Rahmen */
  padding: 8px 12px; /* Innenabstand */
  border-radius: 5px; /* Abgerundete Ecken */
  cursor: pointer; /* Mauszeiger als Hand */
  font-size: 1rem; /* Schriftgröße */
  display: flex; /* Flexbox für Icon und Text */
  align-items: center; /* Vertikale Zentrierung */
  transition: background-color 0.3s, color 0.3s; /* Übergangseffekte */
}

.btn-back:hover {
  background-color: #4a5043; /* Hintergrundfarbe beim Hover */
  color: white; /* Textfarbe beim Hover */
}

/* SVG-Icon innerhalb des Zurück-Buttons */
.back-icon {
  width: 20px; /* Breite des Icons */
  height: 20px; /* Höhe des Icons */
  margin-right: 8px; /* Abstand zwischen Icon und Text */
}
</style>
