<template>
  <div class="create-article">
    <h2 class="text-center mb-4">Neuen Artikel erstellen</h2>

    <form @submit.prevent="createArticle">
      <div class="mb-3">
        <label for="name" class="form-label">Artikelname</label>
        <input type="text" v-model="name" id="name" class="form-control" required />
      </div>

      <div class="mb-3">
        <label for="price" class="form-label">Preis</label>
        <input type="number" v-model="price" id="price" class="form-control" required />
      </div>

      <div class="mb-3">
        <label for="rating" class="form-label">Bewertung</label>
        <input type="number" v-model="rating" id="rating" class="form-control" required />
      </div>

      <button type="submit" class="btn btn-primary w-100">Artikel erstellen</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const name = ref('')
const price = ref('')
const rating = ref(5)
const router = useRouter()

const createArticle = () => {
  // Logik zum Erstellen eines Artikels (API-Aufruf oder ähnliches)
  console.log('Artikel erstellt:', { name: name.value, price: price.value, rating: rating.value })

  // Nach dem Erstellen des Artikels zur Admin-Seite zurückkehren
  router.push('/admin')
}

// const createArticle = async () => {
//   const newArticle = {
//     name: name.value,
//     price: price.value,
//     rating: rating.value
//   }
//
//   try {
//     const response = await axios.post('/articles', newArticle)
//     console.log('Artikel erfolgreich erstellt:', response.data)
//
//     // Nach dem Erstellen des Artikels zur Admin-Seite zurückkehren
//     router.push('/admin')
//   } catch (error) {
//     console.error('Fehler beim Erstellen des Artikels:', error)
//   }
// }
</script>

<style scoped>
.create-article {
  padding: 20px;
}
</style>
