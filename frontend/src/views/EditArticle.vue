<template>
  <div class="edit-article">
    <h2>Artikel bearbeiten</h2>

    <div v-if="loading" class="text-center">
      <p>Lade Artikel...</p>
    </div>

    <div v-else>
      <!-- Artikel bearbeiten Form -->
      <form @submit.prevent="handleSave">
        <div class="mb-3">
          <label for="name" class="form-label">Artikelname</label>
          <input v-model="product.name" type="text" id="name" class="form-control" required />
        </div>

        <div class="mb-3">
          <label for="description" class="form-label">Beschreibung</label>
          <textarea
            v-model="product.description"
            id="description"
            class="form-control"
            required
          ></textarea>
        </div>

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

        <!-- Dropdown Menu für Kategorienauswahl, gruppiert nach Typ -->
        <div class="mb-3">
          <h3>Kategorien</h3>
          <button class="filter-button" type="button" @click="toggleDropdown('categories')">
            ▾
          </button>
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
          <div v-if="selectedCategories.length" class="selected-options">
            <strong>Ausgewählt:</strong> {{ getCategoryNames().join(', ') }}
          </div>
        </div>

        <button type="submit" class="btn btn-primary">Speichern</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const selectedCategories = ref([])
const organizedCategories = ref([])
const activeDropdown = ref(null)
const product = ref({
  id: null,
  name: '',
  description: '',
  price: 0,
  categories: [],
})

// Kategorien nach Type filtern wie z.B. Geschmack oder Wirkung fuer schoenere Darstellung
const organizeCategoriesByType = (categories) => {
  const grouped = categories.reduce((group, category) => {
    const type = category.type || 'Andere'
    group[type] = group[type] || []
    group[type].push(category)
    return group
  }, {})
  return Object.entries(grouped).map(([type, categories]) => ({ type, categories }))
}

const getCategoryNames = () => {
  return selectedCategories.value.map((id) =>
    organizedCategories.value
      .flatMap((group) => group.categories)
      .find((category) => category.id === id)?.name
  );
};


onMounted(async () => {
  await fetchCategories()
  await fetchArticle(route.params.id)
})

//Alle vorhandenen Kategorien laden die zur Auswahl stehen
  const fetchCategories = async () => {
    try {
      const { data } = await axios.get('/category')
      organizedCategories.value = organizeCategoriesByType(data)
    } catch (error) {
      console.error('Fehler beim Laden der Kategorien:', error)
    }
  }

//Produkt welches wir editieren wollen anhand der id laden
const fetchArticle = async (id) => {
  loading.value = true;
  try {
    const { data } = await axios.get(`/product/${id}`);
    product.value = data;

    // IDs der ausgewählten Kategorien aus productCategories extrahieren
    selectedCategories.value = data.productCategories.map((cat) => cat.id);
  } catch (error) {
    console.error('Fehler beim Laden des Artikels:', error);
  } finally {
    loading.value = false;
  }
};


//Produkt updaten/speichern
const handleSave = async () => {
  console.log('Saving article:', product.value)

  try {
    // Daten fuer den Patch Aufruf vorbereiten
    const updatedData = {
      name: product.value.name,
      description: product.value.description,
      price: product.value.price,
      productCategories: selectedCategories.value,
    }

    // PATCH Aufruf
    const response = await axios.patch(`/product/${product.value.id}`, updatedData)
    console.log('Article successfully updated:', response.data)

    // Nach dem Update wieder auf das AdminDashboard navigieren
    await router.push('/admin')
  } catch (error) {
    console.error('Error while saving the article:', error)
  }
}

const toggleDropdown = (dropdown) => {
  activeDropdown.value = activeDropdown.value === dropdown ? null : dropdown
}
</script>

<style scoped>
.edit-article {
  padding: 20px;
}

.form-label {
  font-weight: bold;
}

button {
  margin-top: 20px;
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
  max-width: 300px; /* Adjust based on layout needs */
}

.selected-options {
  margin-top: 5px;
  font-size: 14px;
  color: #555;
}
</style>
