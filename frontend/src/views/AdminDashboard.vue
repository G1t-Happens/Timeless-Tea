<template>
  <div class="admin-dashboard">
    <div class="header">
      <!-- Header message -->
      <h1 class="text-center admin-title">Admin Dashboard</h1>
      <h2 v-if="currentUserName" class="welcome-message">Willkommen, {{ currentUserName }}!</h2>
      <!-- Meta Stats ueber das System -->
      <div class="stats-row">
        <div class="stat-card">
          <h3>Artikel</h3>
          <h3>{{ articlesCount || 0 }}</h3>
        </div>
        <div class="stat-card">
          <h3>User</h3>
          <h3>{{ usersCount || 0 }}</h3>
        </div>
        <div class="stat-card orders-card">
          <h3>Bestellungen</h3>
          <div class="orders-stats">
            <div class="orders-stat">
              <span class="stat-label">Gesamt:</span>
              <span class="stat-value">{{ ordersCount.total || 0 }}</span>
            </div>
            <div class="orders-stat">
              <span class="stat-label">Abgeschlossen:</span>
              <span class="stat-value">{{ ordersCount.finished || 0 }}</span>
            </div>
            <div class="orders-stat">
              <span class="stat-label">Offen:</span>
              <span class="stat-value">{{ ordersCount.active || 0 }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigationsmenü -->
    <div class="navigation">
      <button
        v-for="panel in panels"
        :key="panel.key"
        @click="selectPanel(panel.key)"
        :class="['btn navigation-btn', currentPanel === panel.key ? 'btn-active' : 'btn-outline']"
      >
        <i
          :class="{
            'bi bi-box-seam': panel.key === 'articles',
            'bi bi-people': panel.key === 'users',
            'bi bi-cart': panel.key === 'orders',
            'bi bi-chat-left-text': panel.key === 'messages',
          }"
          class="me-2"
        ></i>
        {{ panel.name }}
      </button>
    </div>

    <!-- Trennlinie -->
    <div class="dashboard-divider"></div>

    <!-- Artikel verwalten Panel -->
    <div v-if="currentPanel === 'articles'">
      <!-- Suchfeld für Artikel -->
      <div class="search-section mb-4">
        <SearchField
          v-model="searchQuery"
          @search="fetchArticles"
          placeholder="Suche nach Artikelname..."
          :showFilter="true"
        />
      </div>

      <!-- Button-Gruppe zum Hinzufügen/Bearbeiten von Artikeln/Kategorien -->
      <div class="button-group">
        <button @click="createNewArticle" class="btn btn-secondary btn-full-width">
          Neuen Artikel erstellen
        </button>
        <button @click="createNewCategory" class="btn btn-secondary btn-full-width">
          Neue Kategorien erstellen
        </button>
        <button @click="editCategories" class="btn btn-secondary btn-full-width">
          Kategorien bearbeiten
        </button>
      </div>

      <!-- Ladezustand oder keine Produkte -->
      <div v-if="loading.articles && articles.length === 0" class="text-center">
        <p>Lade Artikel...</p>
      </div>
      <div v-if="!loading.articles && articles.length === 0" class="text-center">
        <p>Keine Produkte gefunden.</p>
      </div>

      <!-- Liste der Artikel -->
      <div v-else>
        <div class="row row-cols-lg-4">
          <!-- Produktkarten -->
          <div v-for="product in articles" :key="product.id" class="col mb-4">
            <div>
              <ProductCard :product="product" />
            </div>

            <!-- Buttons für Bearbeiten und Löschen -->
            <div class="text-center mb-5" style="display: flex; gap: 10px; flex-wrap: wrap">
              <button @click="editArticle(product)" class="btn btn-primary" style="flex: 1 1 100px">
                Bearbeiten
              </button>
              <button
                v-if="!product.isDeleted"
                @click="deleteArticle(product.id)"
                class="btn btn-secondary"
                style="flex: 1 1 100px"
              >
                Entfernen
              </button>
            </div>
          </div>
        </div>
        <!-- Mehr Tees Button -->
        <div v-if="hasMore.articles && !loading.articles" class="text-center mt-4">
          <button @click="loadMoreArticles" class="btn btn-success" style="margin-bottom: 10px">
            Mehr Tees
          </button>
        </div>
        <!-- Ansonsten keine weiteren Produkte -->
        <div v-if="!hasMore.articles && articles.length > 0" class="text-center mt-4">
          <p>Keine weiteren Tees verfügbar.</p>
        </div>
      </div>
    </div>

    <!-- User verwalten Panel -->
    <div v-else-if="currentPanel === 'users'">
      <!-- Suchfeld für User -->
      <div class="search-section mb-4">
        <SearchField
          v-model="userSearchQuery"
          @search="fetchUsers"
          placeholder="Suche nach Username..."
          :showFilter="false"
        />
      </div>

      <!-- Ladezustand oder keine User -->
      <div v-if="loading.users && users.length === 0" class="text-center">
        <p>Lade User...</p>
      </div>
      <div v-if="!loading.users && users.length === 0" class="text-center">
        <p>Keine User gefunden.</p>
      </div>

      <!-- Liste der User -->
      <div v-else>
        <div class="row row-cols-lg-4">
          <!-- Userkarten -->
          <div v-for="user in users" :key="user.id" class="col mb-4">
            <div>
              <UserCard :user="user" />
            </div>

            <!-- Buttons für Bearbeiten und Löschen -->
            <div class="text-center mb-5" style="display: flex; gap: 10px; flex-wrap: wrap">
              <button @click="editUser(user)" class="btn btn-primary" style="flex: 1 1 100px">
                Bearbeiten
              </button>
              <button
                @click="deleteUser(user.id)"
                class="btn btn-secondary"
                style="flex: 1 1 100px"
              >
                Entfernen
              </button>
            </div>
          </div>
        </div>
        <!-- Mehr User Button -->
        <div v-if="hasMore.users && !loading.users" class="text-center mt-4">
          <button @click="loadMoreUsers" class="btn btn-success" style="margin-bottom: 10px">
            Mehr User
          </button>
        </div>
        <!-- Ansonsten keine weiteren User -->
        <div v-if="!hasMore.users && users.length > 0" class="text-center mt-4">
          <p>Keine weiteren User verfügbar.</p>
        </div>
      </div>
    </div>

    <!-- Bestellungen verwalten Panel -->
    <div v-else-if="currentPanel === 'orders'">
      <!-- Suchfeld für Bestellungen -->
      <div class="search-section mb-4">
        <SearchField
          v-model="orderSearchQuery"
          @search="fetchOrders"
          placeholder="Suche nach ID, Status oder Username..."
          :showFilter="false"
        />
      </div>

      <!-- Ladezustand oder keine Bestellungen -->
      <div v-if="loading.orders && orders.length === 0" class="text-center">
        <p>Lade Bestellungen...</p>
      </div>
      <div v-if="!loading.orders && orders.length === 0" class="text-center">
        <p>Keine Bestellungen gefunden.</p>
      </div>

      <!-- Liste der Bestellungen -->
      <div v-else>
        <div class="row row-cols-lg-4">
          <!-- Bestellkarten -->
          <div v-for="order in orders" :key="order.id" class="col mb-4">
            <div>
              <OrderCard :order="order" />
            </div>

            <!-- Buttons für Details und Löschen -->
            <div class="text-center mb-5" style="display: flex; gap: 10px; flex-wrap: wrap">
              <button @click="viewOrder(order.id)" class="btn btn-primary" style="flex: 1 1 100px">
                Details/Bearbeiten
              </button>
            </div>
          </div>
        </div>
        <!-- Mehr Bestellungen Button -->
        <div v-if="hasMore.orders && !loading.orders" class="text-center mt-4">
          <button @click="loadMoreOrders" class="btn btn-success" style="margin-bottom: 10px">
            Mehr Bestellungen
          </button>
        </div>
        <!-- Ansonsten keine weiteren Bestellungen -->
        <div v-if="!hasMore.orders && orders.length > 0" class="text-center mt-4">
          <p>Keine weiteren Bestellungen verfügbar.</p>
        </div>
      </div>
    </div>
    <!-- Hauptbereich anzeigen, falls kein spezifisches Panel ausgewählt ist -->
    <div v-else class="text-center">
      <p>Bitte wählen Sie einen Verwaltungsbereich aus.</p>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import SearchField from '@/components/SearchField.vue'
import ProductCard from '@/components/ProductCard.vue'
import UserCard from '@/components/UserCard.vue'
import OrderCard from '@/components/OrderCard.vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user.js'
import axios from 'axios'
import Swal from 'sweetalert2'

const currentPanel = ref('articles')
const router = useRouter()
const userStore = useUserStore()
const panels = ref([
  { key: 'articles', name: 'Artikel verwalten' },
  { key: 'users', name: 'User verwalten' },
  { key: 'orders', name: 'Bestellungen verwalten' },
  { key: 'messages', name: 'Nachrichten verwalten' },
])

const currentUserName = computed(() => {
  if (!userStore.user || !userStore.user.firstName || !userStore.user.lastName) {
    return null
  }
  return `${userStore.user.firstName} ${userStore.user.lastName}`
})

// Gemeinsame Loading-Status
const loading = ref({
  articles: false,
  users: false,
  orders: false,
})

// ----------------- Artikel verwalten -----------------
const articles = ref([])
const articlesCount = ref([])
const searchQuery = ref('')
const localArticleFilters = ref({ categories: [], price: 0, rating: 0, page: 1, size: 8 })
const currentArticlePage = ref(1)
const pageSize = 8
const hasMore = ref({
  articles: true,
  users: true,
  orders: true,
})

// Fetch Articles
const fetchArticles = async ({
  query = searchQuery.value,
  filters = localArticleFilters.value,
} = {}) => {
  // Reset bei neuer Suchanfrage
  if (query !== searchQuery.value) {
    searchQuery.value = query.trim()
    currentArticlePage.value = 1
    articles.value = []
    hasMore.value.articles = true
  }

  // Überprüfen, ob sich die Filter geändert haben und falls ja ändern
  if (filters && JSON.stringify(filters) !== JSON.stringify(localArticleFilters.value)) {
    localArticleFilters.value = { ...filters } // Filter aktualisieren
    currentArticlePage.value = 1 // Seite zurücksetzen, wenn die Filter geändert wurden
  }

  // Ladezustand aktivieren
  loading.value.articles = true

  // Kategorien als kommagetrennte Liste formatieren für Backend Call
  const categoriesParam =
    filters.categories && filters.categories.length > 0 ? filters.categories.join(',') : undefined

  // Prüfen ob price !=0 ansonsten undefined
  const priceParam = ((p) => (p && p !== 0 ? p : undefined))(parseFloat(filters.price))

  try {
    const response = await axios.get('/api/product', {
      params: {
        search: query || undefined,
        categories: categoriesParam,
        price: priceParam,
        rating: filters.rating || undefined,
        page: currentArticlePage.value,
        size: pageSize,
      },
    })

    // Ergebnisse verarbeiten
    if (currentArticlePage.value === 1) {
      articles.value = response.data.products
    } else {
      articles.value.push(...response.data.products)
    }

    // "Mehr laden" aktualisieren
    hasMore.value.articles = response.data.hasMore
  } catch (error) {
    console.error('Fehler beim Laden der Artikel:', error)
    await Swal.fire({
      title: 'Fehler beim Laden der Artikel!',
      text: error.response?.data?.error || 'Ein unbekannter Fehler ist aufgetreten.',
      icon: 'error',
      confirmButtonText: 'OK',
    })
  } finally {
    loading.value.articles = false
  }
}

// "Mehr laden"-Funktion für Artikel
const loadMoreArticles = async () => {
  if (hasMore.value.articles) {
    currentArticlePage.value++
    await fetchArticles({ query: searchQuery.value, filters: localArticleFilters.value })
  }
}

// Artikel erstellen
const createNewArticle = () => {
  router.push({ name: 'CreateArticle' })
}

// Kategorie erstellen
const createNewCategory = () => {
  router.push({ name: 'CreateCategory' })
}

// Kategorien bearbeiten
const editCategories = () => {
  router.push({ name: 'EditCategory' })
}

// Artikel bearbeiten
const editArticle = (article) => {
  router.push({ name: 'EditArticle', params: { id: article.id } })
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
      // Simuliere das Setzen des Soft-Delete-Status über eine API
      await axios.patch(`/api/product/${id}`, { isDeleted: true })
      const product = articles.value.find((p) => p.id === id)
      if (product) {
        product.isDeleted = true
      }
      await Swal.fire({
        title: 'Entfernt!',
        text: 'Das Produkt wurde erfolgreich entfernt.',
        icon: 'success',
        confirmButtonText: 'OK',
      })
    } catch (error) {
      console.error('Fehler beim Löschen des Produkts:', error)
      await Swal.fire({
        title: 'Fehler beim Löschen des Produkts!',
        text: error.response?.data?.error || 'Ein unbekannter Fehler ist aufgetreten.',
        icon: 'error',
        confirmButtonText: 'OK',
      })
    }
  }
}

// ----------------- User verwalten -----------------
const users = ref([])
const usersCount = ref([])
const userSearchQuery = ref('')
const localUserFilters = ref({ role: '', page: 1, size: 8 })
const currentUserPage = ref(1)

// Fetch Users
const fetchUsers = async ({
  query = userSearchQuery.value,
  filters = localUserFilters.value,
} = {}) => {
  // Reset bei neuer Suchanfrage
  if (query !== userSearchQuery.value) {
    userSearchQuery.value = query.trim()
    currentUserPage.value = 1
    users.value = []
    hasMore.value.users = true
  }

  // Überprüfen, ob sich die Filter geändert haben und falls ja ändern
  if (filters && JSON.stringify(filters) !== JSON.stringify(localUserFilters.value)) {
    localUserFilters.value = { ...filters } // Filter aktualisieren
    currentUserPage.value = 1 // Seite zurücksetzen, wenn die Filter geändert wurden
  }

  // Ladezustand aktivieren
  loading.value.users = true

  try {
    const response = await axios.get('/api/user', {
      params: {
        search: query || undefined,
        role: filters.role || undefined,
        page: currentUserPage.value,
        size: pageSize,
      },
    })

    // Ergebnisse verarbeiten
    if (currentUserPage.value === 1) {
      users.value = response.data.users
    } else {
      users.value.push(...response.data.users)
    }

    // "Mehr laden" aktualisieren
    hasMore.value.users = response.data.hasMore
  } catch (error) {
    console.error('Fehler beim Laden der User:', error)
    await Swal.fire({
      title: 'Fehler beim Laden der User!',
      text: error.response?.data?.error || 'Ein unbekannter Fehler ist aufgetreten.',
      icon: 'error',
      confirmButtonText: 'OK',
    })
  } finally {
    loading.value.users = false
  }
}

// "Mehr laden"-Funktion für User
const loadMoreUsers = async () => {
  if (hasMore.value.users) {
    currentUserPage.value++
    await fetchUsers({ query: userSearchQuery.value, filters: localUserFilters.value })
  }
}

// User bearbeiten
const editUser = (user) => {
  router.push({ name: 'AdminEditUser', params: { id: user.id } })
}

// User löschen
const deleteUser = async (id) => {
  const result = await Swal.fire({
    title: 'User löschen?',
    text: 'Möchten Sie diesen User wirklich löschen? Dieser Vorgang kann nicht rückgängig gemacht werden.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Ja, löschen',
    cancelButtonText: 'Abbrechen',
  })

  if (result.isConfirmed) {
    try {
      await axios.delete(`/api/user/${id}`)
      const index = users.value.findIndex((user) => user.id === id)
      if (index !== -1) {
        users.value.splice(index, 1)
        await Swal.fire({
          title: 'User erfolgreich gelöscht!',
          icon: 'success',
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
        })
      }
    } catch (error) {
      console.error('Fehler beim Löschen des Users:', error)
      await Swal.fire({
        title: 'Fehler beim Löschen des Users!',
        text: error.response?.data?.error || 'Ein unbekannter Fehler ist aufgetreten.',
        icon: 'error',
        confirmButtonText: 'OK',
      })
    }
  }
}

// ----------------- Bestellungen verwalten -----------------
const orders = ref([])
const ordersCount = ref([])
const orderSearchQuery = ref('')
const localOrderFilters = ref({ status: '', page: 1, size: 8 })
const currentOrderPage = ref(1)

// Fetch Orders
const fetchOrders = async ({
  query = orderSearchQuery.value,
  filters = localOrderFilters.value,
} = {}) => {
  // Reset bei neuer Suchanfrage
  if (query !== orderSearchQuery.value) {
    orderSearchQuery.value = query.trim()
    currentOrderPage.value = 1
    orders.value = []
    hasMore.value.orders = true
  }

  // Überprüfen, ob sich die Filter geändert haben und falls ja ändern
  if (filters && JSON.stringify(filters) !== JSON.stringify(localOrderFilters.value)) {
    localOrderFilters.value = { ...filters } // Filter aktualisieren
    currentOrderPage.value = 1 // Seite zurücksetzen, wenn die Filter geändert wurden
  }

  // Ladezustand aktivieren
  loading.value.orders = true

  try {
    const response = await axios.get('/api/order', {
      params: {
        search: query || undefined,
        status: filters.status || undefined,
        page: currentOrderPage.value,
        size: pageSize,
      },
    })

    // Ergebnisse verarbeiten
    if (currentOrderPage.value === 1) {
      orders.value = response.data.orders
    } else {
      orders.value.push(...response.data.orders)
    }

    // "Mehr laden" aktualisieren
    hasMore.value.orders = response.data.hasMore
  } catch (error) {
    console.error('Fehler beim Laden der Bestellungen:', error)
    await Swal.fire({
      title: 'Fehler beim Laden der Bestellungen!',
      text: error.response?.data?.error || 'Ein unbekannter Fehler ist aufgetreten.',
      icon: 'error',
      confirmButtonText: 'OK',
    })
  } finally {
    loading.value.orders = false
  }
}

// "Mehr laden"-Funktion für Bestellungen
const loadMoreOrders = async () => {
  if (hasMore.value.orders) {
    currentOrderPage.value++
    await fetchOrders({ query: orderSearchQuery.value, filters: localOrderFilters.value })
  }
}

// Bestellungen anzeigen
const viewOrder = (id) => {
  router.push({ name: 'ViewOrder', params: { id } })
}

const fetchMetaData = async () => {
  try {
    const productCountResponse = await axios.get('/api/product/count')
    articlesCount.value = productCountResponse.data
  } catch (error) {
    console.error('Fehler beim Abrufen der Artikel Metadaten:', error.message)
    await Swal.fire({
      title: 'Fehler beim Abrufen der Artikel Metadaten!',
      text: error.response?.data?.error || 'Ein unbekannter Fehler ist aufgetreten.',
      icon: 'error',
      confirmButtonText: 'OK',
    })
  }

  try {
    const userCountResponse = await axios.get('/api/user/count')
    usersCount.value = userCountResponse.data
  } catch (error) {
    console.error('Fehler beim Abrufen der User Metadaten:', error.message)
    await Swal.fire({
      title: 'Fehler beim Abrufen der User Metadaten!',
      text: error.response?.data?.error || 'Ein unbekannter Fehler ist aufgetreten.',
      icon: 'error',
      confirmButtonText: 'OK',
    })
  }

  try {
    const orderCountResponse = await axios.get('/api/order/count')
    ordersCount.value = orderCountResponse.data
  } catch (error) {
    console.error('Fehler beim Abrufen der Bestellungs Metadaten:', error.message)
    await Swal.fire({
      title: 'Fehler beim Abrufen der Bestellungs Metadaten!',
      text: error.response?.data?.error || 'Ein unbekannter Fehler ist aufgetreten.',
      icon: 'error',
      confirmButtonText: 'OK',
    })
  }
}

// ----------------- Panel Management -----------------

const fetchPanelData = (panelKey) => {
  switch (panelKey) {
    case 'articles':
      fetchArticles()
      break
    case 'users':
      fetchUsers()
      break
    case 'orders':
      fetchOrders()
      break
    case 'messages':
      router.push({ name: 'Message' })
      break
    default:
      break
  }
}

const selectPanel = (panelKey) => {
  currentPanel.value = panelKey
  // Speichere den Panel-Zustand nur, wenn es nicht 'messages', da wir Messages auf einer eigenen Seite behandeln
  if (panelKey !== 'messages') {
    localStorage.setItem('adminDashboardPanel', panelKey)
  }
  fetchPanelData(panelKey)
}

// Initiales Laden der Standard-Panels
onMounted(() => {
  const savedPanel = localStorage.getItem('adminDashboardPanel')
  if (savedPanel && panels.value.some((p) => p.key === savedPanel)) {
    currentPanel.value = savedPanel // Panel auf gespeicherten Zustand setzen
  }
  fetchPanelData(currentPanel.value)
  fetchMetaData()
})
</script>

<style scoped>
.admin-title {
  font-size: clamp(
    1.5rem,
    5vw,
    3rem
  ); /* Dynamische Schriftgröße: mindestens 1.5rem, maximal 3rem */
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 2px;
  text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  word-break: break-word; /* Lässt den Text umbrechen, falls nötig */
  text-align: center; /* Zentrierung */
  padding: 0 10px; /* Etwas Innenabstand für kleinere Bildschirme */
}

/* Navigationsmenü Styles */
.navigation {
  display: flex;
  flex-wrap: wrap; /* Erlaubt Zeilenumbruch bei kleineren Bildschirmen */
  justify-content: center;
  gap: 10px;
}

.navigation-btn {
  font-size: 1.2rem; /* Größere Schriftgröße */
  font-weight: bold; /* Fettdruck */
  text-transform: uppercase; /* Großbuchstaben */
  letter-spacing: 1px; /* Leichte Zeichenabstände */
  padding: 12px 25px; /* Größere Polsterung */
  border-radius: 10px; /* Runde Ecken */
  border: transparent; /* Klare Rahmenfarbe */
  background: linear-gradient(
    135deg,
    #d4b483,
    #c06e52
  ); /* Farbverlauf mit den gewünschten Farben */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* Leichter Schatten */
  transition: all 0.3s ease; /* Sanfte Übergänge */
  flex: 1 1 calc(33.33% - 20px); /* Responsive Breite */
  text-align: center;
  color: #f1e2c5;
}

.navigation-btn:hover {
  background: linear-gradient(135deg, #c06e52, #d4b483); /* Umgekehrter Farbverlauf beim Hover */
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3); /* Stärkerer Schatten beim Hover */
  transform: translateY(-3px); /* Leichtes Anheben */
  color: white;
}

.navigation-btn:active {
  transform: translateY(1px); /* Leichtes Absenken beim Klick */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* Schatten zurücksetzen */
  color: white;
}

.navigation-btn.btn-active {
  background: linear-gradient(135deg, #c06e52, #8f4c37); /* Aktive Farbe */
  box-shadow: 0 6px 8px rgba(0, 0, 0, 0.2); /* Betonung des aktiven Buttons */
  color: white;
}

.text-center button {
  display: inline-block;
  width: auto;
}

/* Buttons und Karten zentrieren */
.row {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

.admin-dashboard {
  padding: 50px;
}

.header {
  text-align: center;
  margin-bottom: 10px;
}

.stats-row {
  display: flex;
  flex-wrap: wrap; /* Ermöglicht das Umrücken auf kleinere Bildschirme */
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 30px;
}

.stat-card {
  background: rgb(253, 253, 253);
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 5px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
  flex: 1;
}

.orders-stat {
  display: flex;
  justify-content: space-between;
  font-size: 1.2rem;
}

.welcome-message {
  text-align: center;
  font-size: 1.5rem;
  font-weight: normal;
  word-break: break-word;
  color: #4a5043;
  margin-top: -10px;
  margin-bottom: 30px;
}

.dashboard-divider {
  width: 100%; /* Trennlinie hat 100% der Breite */
  height: 4px; /* Höhe der Trennlinie */
  background: linear-gradient(
    to left,
    papayawhip,
    navajowhite,
    papayawhip
  ); /* Farbverlauf von der Mitte nach außen */
  margin: 10px auto; /* Zentrieren und Abstand */
  border-bottom: whitesmoke;
  border-radius: 20px; /* Runde Kanten */
}

.button-group {
  display: flex; /* Flexbox aktivieren */
  flex-wrap: wrap; /* Erlaubt Zeilenumbruch */
  gap: 10px; /* Abstand zwischen den Buttons */
  justify-content: space-between; /* Gleiche Verteilung */
  width: 100%; /* Volle Breite */
  margin-bottom: 10px; /* Abstand nach unten */
}

.button-group button {
  flex: 1 1 calc(33.33% - 10px); /* Flexibles Verhalten: Drittel der Breite */
  min-width: 100px; /* Mindestbreite für die Buttons */
  padding: 12px; /* Einheitliche Polsterung */
  border-radius: 8px; /* Abgerundete Kanten */
  font-size: 1rem; /* Lesbare Schriftgröße */
  text-align: center; /* Zentrierter Text */
  background-color: #c06e52; /* Hintergrundfarbe */
  color: white; /* Textfarbe */
  border: none; /* Kein Rahmen */
  transition: transform 0.3s ease; /* Animation beim Hover */
}

.button-group button:hover {
  transform: translateY(-2px); /* Leichtes Anheben beim Hover */
  background-color: #8f4c37; /* Dunklere Hintergrundfarbe beim Hover */
}
</style>
