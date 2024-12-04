<template>
  <div class="filter-popup">
    <div class="filter-header">
      <h2>Filteroptionen</h2>
      <button class="close-button" @click="emit('close')">X</button>
    </div>
    <div class="filter-body">
      <!-- Geschmack und Wirkung -->
      <div class="filter-row">
        <div class="filter-item">
          <h3>Geschmack</h3>
          <button class="filter-button" ref="tasteButton" @click="toggleDropdown('taste', $event)">
            ▾
          </button>
          <div v-if="activeDropdown === 'taste'" class="dropdown-menu">
            <label
              ><input type="checkbox" v-model="localFilters.taste" value="fruchtig" />
              Fruchtig</label
            >
            <label
              ><input type="checkbox" v-model="localFilters.taste" value="würzig" /> Würzig</label
            >
            <label><input type="checkbox" v-model="localFilters.taste" value="süß" /> Süß</label>
            <label
              ><input type="checkbox" v-model="localFilters.taste" value="blumig" /> Blumig</label
            >
          </div>
          <div v-if="localFilters.taste.length" class="selected-options">
            <strong>Ausgewählt:</strong> {{ localFilters.taste.join(', ') }}
          </div>
        </div>

        <div class="filter-item">
          <h3>Wirkung</h3>
          <button
            class="filter-button"
            ref="effectButton"
            @click="toggleDropdown('effect', $event)"
          >
            ▾
          </button>
          <div v-if="activeDropdown === 'effect'" class="dropdown-menu">
            <label
              ><input type="checkbox" v-model="localFilters.effect" value="beruhigend" />
              Beruhigend</label
            >
            <label
              ><input type="checkbox" v-model="localFilters.effect" value="anregend" />
              Anregend</label
            >
            <label
              ><input type="checkbox" v-model="localFilters.effect" value="stärkend" />
              Stärkend</label
            >
          </div>
          <div v-if="localFilters.effect.length" class="selected-options">
            <strong>Ausgewählt:</strong> {{ localFilters.effect.join(', ') }}
          </div>
        </div>
      </div>

      <!-- Bewertung und Preis -->
      <div class="filter-row">
        <div class="filter-item">
          <h3>Bewertung</h3>
          <button
            class="filter-button"
            ref="ratingButton"
            @click="toggleDropdown('rating', $event)"
          >
            ▾
          </button>
          <div v-if="activeDropdown === 'rating'" class="dropdown-menu">
            <label><input type="radio" v-model="localFilters.rating" value="1" /> 1 Stern</label>
            <label><input type="radio" v-model="localFilters.rating" value="2" /> 2 Sterne</label>
            <label><input type="radio" v-model="localFilters.rating" value="3" /> 3 Sterne</label>
            <label><input type="radio" v-model="localFilters.rating" value="4" /> 4 Sterne</label>
            <label><input type="radio" v-model="localFilters.rating" value="5" /> 5 Sterne</label>
          </div>
          <div v-if="localFilters.rating" class="selected-options">
            <strong>Ausgewählt:</strong> {{ localFilters.rating }} Sterne
          </div>
        </div>
        <div class="filter-item">
          <h3>Preis</h3>
          <input class="price-input" type="range" v-model="localFilters.price" min="0" max="100" />
          <span>{{ localFilters.price }} €</span>
        </div>
      </div>

      <!-- Herkunft -->
      <div class="filter-row">
        <div class="filter-item">
          <h3>Herkunft</h3>
          <input
            class="origin-input"
            v-model="localFilters.origin"
            type="text"
            placeholder="z.B. China, Indien"
          />
        </div>
        <div class="filter-actions">
          <button class="save-button" @click="applyFilters">Speichern</button>
          <button class="save-button" @click="resetFilters">Reset All</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, watch, defineEmits } from 'vue'

// Events definieren
const emit = defineEmits(['close', 'applyFilters'])

// Empfangen der Filterwerte über Props
const props = defineProps({
  filters: {
    type: Object,
    default: () => ({}),
  },
})

// Lokale Zustände definieren und mit den Prop-Werten initialisieren
const localFilters = reactive({
  taste: [],
  effect: [],
  rating: null,
  price: 50,
  origin: '',
})

// Synchronisieren der lokalen Filterwerte mit den übergebenen Prop-Werten
watch(
  () => props.filters,
  (newFilters) => {
    localFilters.taste = newFilters.taste || []
    localFilters.effect = newFilters.effect || []
    localFilters.rating = newFilters.rating || null
    localFilters.price = newFilters.price || 50
    localFilters.origin = newFilters.origin || ''
  },
  { immediate: true },
)

const activeDropdown = ref(null)

// Funktion, um Dropdowns umzuschalten und die Mausposition zu setzen
const toggleDropdown = (dropdown) => {
  if (activeDropdown.value === dropdown) {
    activeDropdown.value = null // Dropdown schließen
  } else {
    activeDropdown.value = dropdown // Andernfalls das neue Dropdown öffnen
  }
}

// Funktion, um die Filter anzuwenden und das Event zu emittieren
const applyFilters = () => {
  emit('applyFilters', { ...localFilters }) // Hier wird das Event korrekt emittiert
}

const resetFilters = () => {
  localFilters.taste = []
  localFilters.effect = []
  localFilters.rating = null
  localFilters.price = 50
  localFilters.origin = ''
  applyFilters()
}
</script>

<style scoped>
.filter-actions {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 4px;
  max-width: 100%;
  box-sizing: border-box;
}

.save-button {
  max-width: 75%;
  flex: 1;
  text-align: center;
}

.filter-popup {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #e0e0e0;
  border-radius: 16px;
  padding: 20px;
  width: 320px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  z-index: 1000;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid #ccc;
  padding-bottom: 10px;
  margin-bottom: 15px;
}

.close-button {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
}

.filter-body {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.filter-row {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.filter-item {
  flex: 1;
  text-align: center;
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
  display: flex; /* Flexbox aktivieren */
  flex-direction: column; /* Vertikale Anordnung der Items */
  gap: 8px; /* Abstand zwischen Items */
  max-width: 160px; /* Optional: Maximale Breite */
}

.selected-options {
  margin-top: 5px;
  font-size: 14px;
  color: #555;
}

.price-input {
  width: 100%;
}

.origin-input {
  width: 100%;
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.save-button {
  background: #666;
  color: #fff;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}
</style>
