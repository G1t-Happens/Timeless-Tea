<template>
  <div class="messages-container">
    <div v-if="loading" class="loading-spinner">Lädt...</div>

    <div v-else>
      <!-- Nachrichtenliste -->
      <div
        class="message-card"
        v-for="message in paginatedMessages"
        :key="message.id"
        @click="openModal(message)"
      >
        <div class="message-header">
          <h3>{{ message.subject }}</h3>
          <span class="message-time">{{ formatDate(message.createdAt) }}</span>
        </div>
        <div class="message-details">
          <p><strong>Name:</strong> {{ message.name }}</p>
        </div>
      </div>

      <!-- Pagination -->
      <div class="pagination">
        <button
          :disabled="currentPage === 1"
          @click="changePage(currentPage - 1)"
          class="pagination-button"
        >
          Vorherige
        </button>
        <span>{{ currentPage }} / {{ totalPages }}</span>
        <button
          :disabled="currentPage === totalPages"
          @click="changePage(currentPage + 1)"
          class="pagination-button"
        >
          Nächste
        </button>
      </div>
    </div>

    <!-- Modal für Nachricht -->
    <MessageModal
      v-if="selectedMessage"
      :message="selectedMessage"
      @close="closeModal"
      @reply="sendReply"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import MessageModal from '@/components/MessageModal.vue'

const messages = ref([])
const loading = ref(false)
const currentPage = ref(1)
const messagesPerPage = 4
const selectedMessage = ref(null)

// Fetch Nachrichten
const fetchMessages = async () => {
  loading.value = true
  try {
    const response = await axios.get('/api/message')
    messages.value = response.data.data
  } catch (error) {
    console.error('Fehler beim Laden der Nachrichten:', error)
  } finally {
    loading.value = false
  }
}

// Nachrichten formatieren
const formatDate = (timestamp) => {
  const date = new Date(timestamp)
  return date.toLocaleString()
}

// Pagination-Logik
const totalMessages = computed(() => messages.value.length)

const totalPages = computed(() => {
  if (totalMessages.value > 0) {
    return Math.ceil(totalMessages.value / messagesPerPage)
  }
  return 1
})

const paginatedMessages = computed(() => {
  const start = (currentPage.value - 1) * messagesPerPage
  const end = start + messagesPerPage
  return messages.value.slice(start, end)
})

const changePage = (page) => {
  if (page > 0 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const openModal = (message) => {
  selectedMessage.value = message
}

const closeModal = () => {
  selectedMessage.value = null
}

const sendReply = (replyText) => {
  // Hier könnte man die Antwort an die API senden
  console.log('Antwort gesendet:', replyText)
  closeModal()
}

onMounted(() => {
  fetchMessages()
})
</script>

<style scoped>
.messages-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.loading-spinner {
  text-align: center;
  font-size: 1.5rem;
  color: #555;
}

.message-card {
  background: #f9f9f9;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
}

.message-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  margin-bottom: 10px;
}

.message-time {
  font-size: 0.9rem;
  color: #888;
}

.message-details p {
  margin: 5px 0;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
}

.pagination-button {
  background-color: #4a5043;
  color: white;
  border: none;
  padding: 10px 15px;
  margin: 0 10px;
  border-radius: 4px;
}

.pagination-button:hover {
  background-color: #9fa86d;
  color: white;
  border: none;
  padding: 10px 15px;
  margin: 0 10px;
  border-radius: 4px;
  transform: scale(1.1);
}

.pagination-button:disabled {
  background-color: #ddd;
  cursor: not-allowed;
}

.pagination span {
  font-size: 1.1rem;
  color: #333;
}
</style>
