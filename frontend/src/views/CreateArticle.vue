<template>
  <div class="create-article">
    <h2 class="text-center mb-4">Neuen Artikel erstellen</h2>

    <form @submit.prevent="createArticle">
      <div class="mb-3">
        <label for="name" class="form-label">Artikelname</label>
        <input type="text" v-model="name" id="name" class="form-control" required />
      </div>

      <div class="mb-3">
        <label for="description" class="form-label">Beschreibung</label>
        <input type="text" v-model="description" id="description" class="form-control" required />
      </div>

      <div class="mb-3">
        <label for="price" class="form-label">Preis in €</label>
        <input type="number" step="0.01" v-model="price" id="price" class="form-control" required />
      </div>

      <!-- Dropdown Menu für Kategorienauswahl, gruppiert nach Typ -->
      <div class="mb-3">
        <h3>Kategorien</h3>
        <button class="filter-button" type="button" @click="toggleDropdown('categories')">▾</button>
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

      <button type="submit" class="btn btn-primary w-100">Artikel erstellen</button>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const name = ref('')
const description = ref('')
const price = ref('')
const selectedCategories = ref([]) // Array für ausgewählte Kategorien-IDs
const organizedCategories = ref([]) // Liste aller verfügbaren Kategorien nach Typ organisiert
const activeDropdown = ref(null) // Aktiv geöffnetes Dropdown

const router = useRouter()

// Kategorien nach Typen gruppieren
const organizeCategoriesByType = (categories) => {
  const grouped = categories.reduce((group, category) => {
    const type = category.type || 'Andere'
    group[type] = group[type] || []
    group[type].push(category)
    return group
  }, {})
  return Object.entries(grouped).map(([type, categories]) => ({ type, categories }))
}

onMounted(async () => {
  try {
    const response = await axios.get('/category')
    organizedCategories.value = organizeCategoriesByType(response.data)
  } catch (error) {
    console.error('Fehler beim Laden der Kategorien:', error)
  }
})

const toggleDropdown = (dropdown) => {
  activeDropdown.value = activeDropdown.value === dropdown ? null : dropdown
}

const getCategoryNames = () => {
  return selectedCategories.value.map(
    (id) =>
      organizedCategories.value.flatMap((group) => group.categories).find((c) => c.id === id)?.name,
  )
}

const createArticle = async () => {
  const newArticle = {
    name: name.value,
    description: description.value,
    price: price.value,
    categories: selectedCategories.value,
  }
  try {
    const response = await axios.post('/product', newArticle)
    console.log('Artikel erfolgreich erstellt:', response.data)
    await router.push('/admin')
  } catch (error) {
    console.error('Fehler beim Erstellen des Artikels:', error)
  }
}
</script>

<style scoped>
.create-article {
  padding: 20px;
}

.filter-button {
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 5px 10px;
  cursor: pointer;
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
