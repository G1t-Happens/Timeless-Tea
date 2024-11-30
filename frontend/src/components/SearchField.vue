<template>
  <div class="row mt-3">
    <div class="col-12 text-center">
      <form @submit.prevent="handleSearch" class="d-flex justify-content-center">
        <!-- Such-Eingabefeld -->
        <input
          v-model="searchQuery"
          class="search-input"
          type="search"
          placeholder="Finde deinen Tee..."
          alt="Search Field"
        />

        <!-- Filter Button -->
        <button class="btn btn-image" type="button" @click="toggleFilter">
          <img
            src="../../src/assets/icons/filter.png"
            class="oval-icon-responsive"
            alt="Filter Icon"
          />
        </button>

        <!-- Suchen Button -->
        <button class="btn btn-image" type="submit">
          <img
            src="../../src/assets/icons/search.png"
            class="oval-icon-responsive"
            alt="Search Icon"
          />
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const searchQuery = ref('')
const router = useRouter()

// Funktion zum Handhaben der Suche
const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({ name: 'search-results', query: { query: searchQuery.value } })
  }
}

// Funktion zum Umschalten des Filters (optional)
const toggleFilter = () => {
  // Hier könnte eine Logik für die Filter-Optionen hinzugefügt werden
  console.log('Filter aktiviert')
}
</script>

<style scoped>
.search-input {
  width: 500px;
  border-width: 2px;
  border-radius: 36px;
  border-color: #c06e52;
  border-style: solid;
}
</style>
