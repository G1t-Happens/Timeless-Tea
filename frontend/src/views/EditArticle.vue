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
          <input v-model="article.name" type="text" id="name" class="form-control" required />
        </div>

        <div class="mb-3">
          <label for="description" class="form-label">Beschreibung</label>
          <textarea
            v-model="article.description"
            id="description"
            class="form-control"
            required
          ></textarea>
        </div>

        <div class="mb-3">
          <label for="price" class="form-label">Preis</label>
          <input v-model="article.price" type="number" id="price" class="form-control" required />
        </div>

        <button type="submit" class="btn btn-primary">Speichern</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const article = ref({
  id: null,
  name: '',
  description: '',
  price: 0,
})

const loading = ref(true)

// Artikel anhand der ID laden (diese wird über die URL übergeben)
onMounted(() => {
  const articleId = route.params.id
  fetchArticle(articleId)
})

// Beispielhafte Methode zum Laden eines Artikels
const fetchArticle = async (id) => {
  loading.value = true

  // Beispiel: API Call (oder Fake-Daten) um den Artikel zu laden
  setTimeout(() => {
    // Dummy-Artikel, du würdest hier eine echte API-Abfrage durchführen
    article.value = {
      id: id,
      name: `Artikel ${id}`,
      description: `Beschreibung des Artikels ${id}`,
      price: 20.0,
    }

    loading.value = false
  }, 1000)
}

const handleSave = () => {
  console.log('Artikel gespeichert:', article.value)
  router.push('/admin')
  // Hier würde man die bearbeiteten Daten über eine API absenden
}

// const fetchArticle = async (id) => {
//   loading.value = true
//
//   try {
//     const response = await axios.get(`/articles/${id}`)
//     article.value = response.data
//   } catch (error) {
//     console.error('Fehler beim Laden des Artikels:', error)
//   } finally {
//     loading.value = false
//   }
// }

// const handleSave = async () => {
//   console.log('Artikel gespeichert:', article.value)
//
//   try {
//     const response = await axios.put(`/articles/${article.value.id}`, article.value)
//     console.log('Artikel erfolgreich gespeichert:', response.data)
//     router.push(`/articles/${response.data.id}`)
//   } catch (error) {
//     console.error('Fehler beim Speichern des Artikels:', error)
//   }
// }
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
</style>
