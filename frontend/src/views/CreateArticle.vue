<template>
  <!-- Hauptcontainer für die Artikel-Erstellung -->
  <div class="create-article">
    <!-- Überschrift -->
    <h2 class="page-title">Neuen Artikel erstellen</h2>

    <!-- Formular für die Artikeldaten -->
    <form @submit.prevent="createArticle" class="form-container" method="post" enctype="multipart/form-data">

      <!-- Bildvorschau -->
      <div v-if="imagePreview" class="image-preview">
        <img :src="imagePreview" alt="Vorschau des hochgeladenen Bildes" class="preview-image" />
      </div>

      <!-- Eingabefeld für den Artikelnamen -->
      <div class="form-group">
        <label for="name" class="form-label">Artikelname</label>
        <input type="text" v-model="name" id="name" class="form-control" required />
      </div>

      <!-- Eingabefeld für die Beschreibung -->
      <div class="form-group">
        <label for="description" class="form-label">Beschreibung</label>
        <input type="text" v-model="description" id="description" class="form-control" required />
      </div>

      <!-- Eingabefeld für den Preis -->
      <div class="form-group">
        <label for="price" class="form-label">Preis in €</label>
        <input type="number" step="0.01" v-model="price" id="price" class="form-control" required />
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
        <input type="file" id="image" class="form-control" @change="onFileChange" accept="image/*" />
      </div>

      <!-- Submit-Button für das Formular -->
      <button type="submit" class="btn btn-primary w-100">Artikel erstellen</button>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

// Reaktive Variablen für Formulardaten
const name = ref('');
const description = ref('');
const price = ref('');
const selectedCategories = ref([]); // Array für ausgewählte Kategorien-IDs
const organizedCategories = ref([]); // Liste der Kategorien, nach Typ gruppiert
const activeDropdown = ref(null); // Aktuell geöffnetes Dropdown-Menü
const imageFile = ref(null);
const imagePreview = ref(null);

// Router-Instanz für Navigation nach erfolgreicher Erstellung des Artikels
const router = useRouter();

// Funktion zum Gruppieren von Kategorien nach Typ
const organizeCategoriesByType = (categories) => {
  const grouped = categories.reduce((group, category) => {
    const type = category.type || 'Andere'; // Standardwert 'Andere', falls kein Typ definiert ist
    group[type] = group[type] || [];
    group[type].push(category);
    return group;
  }, {});

  // Rückgabe als Array mit Typ und zugehörigen Kategorien
  return Object.entries(grouped).map(([type, categories]) => ({ type, categories }));
};

// Beim Laden der Komponente: Kategoriedaten abrufen und gruppieren
onMounted(async () => {
  try {
    const response = await axios.get('/category');
    organizedCategories.value = organizeCategoriesByType(response.data);
  } catch (error) {
    console.error('Fehler beim Laden der Kategorien:', error);
  }
});

// Funktion zum Umschalten des geöffneten Dropdown-Menüs
const toggleDropdown = (dropdown) => {
  activeDropdown.value = activeDropdown.value === dropdown ? null : dropdown;
};

// Funktion, um die Namen der ausgewählten Kategorien zu erhalten
const getCategoryNames = () => {
  return selectedCategories.value.map(
    (id) =>
      organizedCategories.value.flatMap((group) => group.categories).find((c) => c.id === id)?.name
  );
};

// Funktion zur Verarbeitung der Bildauswahl
const onFileChange = (event) => {
  const files = event.target.files;
  if (files && files[0]) {
    imageFile.value = files[0];
    imagePreview.value = URL.createObjectURL(files[0]); // Erzeuge eine temporäre URL für die Vorschau
  }
};

// Funktion zum Erstellen eines neuen Artikels
const createArticle = async () => {
  if (!imageFile.value) {
    alert('Bitte wähle ein Bild aus.');
    return;
  }

  const formData = new FormData();
  formData.append('name', name.value);
  formData.append('description', description.value);
  formData.append('price', price.value);
  formData.append('categories', JSON.stringify(selectedCategories.value));
  formData.append('image', imageFile.value);

  try {
    // Anfrage zum Erstellen des Artikels auf dem Server
    await axios.post('/product', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    // Nach erfolgreicher Erstellung zur Admin-Seite navigieren
    await router.push('/admin');
  } catch (error) {
    console.error('Fehler beim Erstellen des Artikels:', error);
  }
};
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
</style>
