<template>
  <!-- Header mit Filterüberschrift und Schließen-Button -->
  <div class="filter-header">
    <h2>Filteroptionen</h2>
    <!-- Schließen Button -->
    <button class="close-button" @click="emitClose" aria-label="Schließen">X</button>
  </div>

  <div class="filter-body">
    <!-- Geschmack und Wirkung -->
    <div class="filter-row">
      <!-- Geschmack Filter -->
      <div class="filter-item">
        <h3>Geschmack</h3>
        <button class="filter-button" @click="toggleDropdown('taste')">▾</button>
        <div v-if="activeDropdown === 'taste'" class="dropdown-menu">
          <!-- Dynamische Geschmack-Optionen -->
          <label v-for="taste in tastes" :key="taste.id">
            <input type="checkbox" v-model="localFilters.taste" :value="taste.id" />
            {{ taste.name }}
          </label>
        </div>
        <!-- Ausgewählte Geschmack-Optionen anzeigen -->
        <div v-if="localFilters.taste.length" class="selected-options">
          <strong>Ausgewählt:</strong> {{ selectedTasteNames.join(', ') }}
        </div>
      </div>

      <!-- Wirkung Filter -->
      <div class="filter-item">
        <h3>Wirkung</h3>
        <button class="filter-button" @click="toggleDropdown('effect')">▾</button>
        <div v-if="activeDropdown === 'effect'" class="dropdown-menu">
          <!-- Dynamische Wirkung-Optionen -->
          <label v-for="effect in effects" :key="effect.id">
            <input type="checkbox" v-model="localFilters.effect" :value="effect.id" />
            {{ effect.name }}
          </label>
        </div>
        <!-- Ausgewählte Wirkung-Optionen anzeigen -->
        <div v-if="localFilters.effect.length" class="selected-options">
          <strong>Ausgewählt:</strong> {{ selectedEffectNames.join(', ') }}
        </div>
      </div>
    </div>

    <!-- Bewertung und Preis -->
    <div class="filter-row">
      <!-- Bewertung Filter -->
      <div class="filter-item">
        <h3>Bewertung</h3>
        <button class="filter-button" @click="toggleDropdown('rating')">▾</button>
        <div v-if="activeDropdown === 'rating'" class="dropdown-menu">
          <!-- Bewertung-Optionen -->
          <label v-for="star in 5" :key="star">
            <input type="radio" v-model="localFilters.rating" :value="star.toString()" />
            {{ star }} Stern{{ star > 1 ? 'e' : '' }}
          </label>
        </div>
        <!-- Ausgewählte Bewertung anzeigen -->
        <div v-if="localFilters.rating" class="selected-options">
          <strong>Ausgewählt:</strong> {{ localFilters.rating }} Stern{{
            localFilters.rating > 1 ? 'e' : ''
          }}
        </div>
      </div>

      <!-- Preis Filter -->
      <div class="filter-item">
        <h3>Preis</h3>
        <!-- Preis Slider -->
        <input class="price-input" type="range" v-model="localFilters.price" min="0" max="200" />
        <span v-if="localFilters.price > 0">{{ localFilters.price }} €</span>
        <span v-else class="infinity-symbol">∞</span>
      </div>
    </div>

    <!-- Buttons -->
    <div class="filter-row">
      <!-- Aktionen Buttons (Anwenden & Zurücksetzen) -->
      <div class="filter-actions">
        <button class="save-button" @click="applyFiltersHandler">Anwenden</button>
        <button class="reset-button" @click="resetFilters">Reset All</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, watch, onMounted, computed } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'

// Define emits for close and applyFilters events
const emit = defineEmits(['close', 'applyFilters'])

// Categories
const tastes = ref([])
const effects = ref([])

// Define props
const props = defineProps({
  filters: {
    type: Object,
    default: () => ({}),
  },
})

// Initialize local filters
const localFilters = reactive({
  taste: [],
  effect: [],
  rating: null,
  price: 0,
})

// Synchronisieren der lokalen Filter mit den Prop-Werten die vom SearchField uebergeben wurden
watch(
  () => props.filters,
  (newFilters) => {
    localFilters.taste = newFilters.taste || []
    localFilters.effect = newFilters.effect || []
    localFilters.rating = newFilters.rating || null
    localFilters.price = newFilters.price || 0
  },
  { immediate: true },
)

// Initial loading of categories
onMounted(async () => {
  try {
    const response = await axios.get('/api/category/')
    const category = response.data
    tastes.value = category.filter((category) => category.type === 'Taste')
    effects.value = category.filter((category) => category.type === 'Effect')
  } catch (error) {
    console.error('Error fetching categories:', error)
    await Swal.fire({
      title: 'Fehler beim laden der Kategorien!',
      text: error.response?.data?.error || 'Ein unbekannter Fehler ist aufgetreten.',
      icon: 'error',
      confirmButtonText: 'OK',
    })
  }
})

// Computed properties to display selected names based on IDs
const selectedTasteNames = computed(() => {
  return tastes.value
    .filter((taste) => localFilters.taste.includes(taste.id))
    .map((taste) => taste.name)
})

const selectedEffectNames = computed(() => {
  return effects.value
    .filter((effect) => localFilters.effect.includes(effect.id))
    .map((effect) => effect.name)
})

// Toggle dropdown menus
const activeDropdown = ref(null)
const toggleDropdown = (dropdown) => {
  activeDropdown.value = activeDropdown.value === dropdown ? null : dropdown
}

// Filter anwenden und an AdminDashboard senden
const applyFiltersHandler = () => {
  const combinedCategories = [...localFilters.taste, ...localFilters.effect]
  emit('applyFilters', {
    categories: combinedCategories, // Kombinierte Kategorien
    price: localFilters.price,
    rating: localFilters.rating,
    taste: localFilters.taste,
    effect: localFilters.effect,
  })
  emit('close')
}

// Filter reseten und an AdminDashboard senden
const resetFilters = () => {
  localFilters.taste = []
  localFilters.effect = []
  localFilters.rating = null
  localFilters.price = 0
  emit('applyFilters', {
    categories: [],
    price: localFilters.price,
    rating: localFilters.rating,
  })
}

// Close Event emitten
const emitClose = () => {
  emit('close')
}
</script>

<style scoped>
/* Header der Filter-Popups */
.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid #ccc;
  padding-bottom: 10px;
  margin-bottom: 15px;
}

/* Schließen Button */
.close-button {
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
}

/* Filterbereich */
.filter-body {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

/* Layout für Filterzeilen */
.filter-row {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  position: relative;
}

/* Filteritem */
.filter-item {
  flex: 1;
  text-align: left;
}

/* Filterbutton */
.filter-button {
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 5px 10px;
  cursor: pointer;
  margin-left: 5px;
}

/* Dropdown-Menü */
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
}

/* Ausgewählte Optionen */
.selected-options {
  margin-top: 6px;
  margin-left: 6px;
  color: #555;
}

/* Preis-Slider */
.price-input {
  width: 100%;
}

/* Action-Buttons */
.filter-actions {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  width: 100%;
  box-sizing: border-box;
}

/* Save-Button */
.save-button {
  flex: 1;
  text-align: center;
  background: #666;
  color: #fff;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
}

/* Reset-Button */
.reset-button {
  flex: 1;
  text-align: center;
  background: #bbb;
  color: #fff;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
}

/* Infinity-Symbol */
.infinity-symbol {
  font-size: 28px;
  font-weight: 500;
  color: #000000;
}
</style>
