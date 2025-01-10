<template>
  <div class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <h3 class="modal-title">{{ message.subject }}</h3>
      <p><strong>Name:</strong> {{ message.name }}</p>
      <p><strong>Email:</strong> {{ message.email }}</p>
      <p><strong>Nachricht:</strong> {{ message.message }}</p>
      <p>
        <small>Erstellt am: {{ new Date(message.createdAt).toLocaleString() }}</small>
      </p>

      <!-- Actions -->
      <div class="actions">
        <button class="btn btn-exit" @click="closeModal">Schließen</button>
        <button class="btn btn-reply" @click="toggleReply">Antworten</button>
      </div>

      <!-- Reply Section -->
      <div v-if="isReplying" class="reply-section">
        <textarea
          v-model="replyText"
          placeholder="Schreiben Sie Ihre Antwort hier..."
          rows="4"
        ></textarea>
        <button :disabled="!replyText.trim()" class="btn btn-send" @click="sendReply">
          Senden
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  message: {
    type: Object,
    required: true,
  },
})

const emits = defineEmits(['close', 'reply'])
const isReplying = ref(false)
const replyText = ref('')

const closeModal = () => {
  emits('close')
}

const toggleReply = () => {
  isReplying.value = !isReplying.value
}

const sendReply = () => {
  emits('reply', replyText.value)
  replyText.value = ''
  isReplying.value = false
  emits('close')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  width: 500px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
  text-align: left;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

.actions {
  display: flex;
  justify-content: space-between;
  margin-top: 1.5rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 5px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-exit {
  background-color: #c06e52;
  color: white;
  border: none;
}

.btn-exit:hover {
  background-color: #c0392b;
  transform: scale(1.05);
}

.btn-reply {
  background-color: #4a5043;
  color: white;
  border: none;
}

.btn-reply:hover {
  background-color: #9fa86d;
  transform: scale(1.05);
}

.reply-section {
  margin-top: 1.5rem;
}

textarea {
  width: 100%;
  padding: 1rem;
  border-radius: 5px;
  border: 1px solid #ddd;
  font-size: 1rem;
  margin-bottom: 1rem;
}

textarea:focus {
  outline: none;
  border-color: #007bff;
}

.btn-send {
  background-color: #28a745;
  color: white;
  border: none;
}

.btn-send:hover {
  background-color: #218838;
  transform: scale(1.05);
}

.btn-send:disabled {
  background-color: #d6d6d6;
  cursor: not-allowed;
}
</style>
