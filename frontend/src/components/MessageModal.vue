<template>
  <div class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <!-- Anzeige der Message Infos -->
      <h3 class="modal-title break-text">{{ message.subject }}</h3>
      <p class="break-text"><strong>Name:</strong> {{ message.name }}</p>
      <p class="break-text"><strong>Email:</strong> {{ message.email }}</p>
      <p class="break-text"><strong>Nachricht:</strong> {{ message.message }}</p>
      <p>
        <small>Erstellt am: {{ new Date(message.createdAt).toLocaleString() }}</small>
      </p>

      <!-- Actions -->
      <div class="actions">
        <button class="btn btn-secondary" @click="closeModal">Schließen</button>
        <button class="btn btn-primary" @click="toggleReply">Antworten</button>
        <button class="btn btn-delete" @click="emitDelete(message.id)">Löschen</button>
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
import Swal from 'sweetalert2'

defineProps({
  message: {
    type: Object,
    required: true,
  },
})

const emits = defineEmits(['close', 'reply', 'delete'])
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

const emitDelete = async (id) => {
  const result = await Swal.fire({
    backdrop: false,
    title: 'Nachricht löschen?',
    text:
      'Möchten Sie dieses Nachricht wirklich löschen? Dieser Vorgang kann im' +
      ' nachhinein nicht mehr rückgängig gemacht werden!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Ja, löschen',
    cancelButtonText: 'Abbrechen',
  })

  if (result.isConfirmed) {
    emits('delete', id)
    emits('close')
  }
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
  overflow: hidden; /* Verhindert Scrollen der Seite im Hintergrund */
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  width: 90%; /* Standardbreite: 90% des Viewports */
  max-width: 800px; /* Maximalbreite */
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
  text-align: left;
  display: flex;
  flex-direction: column; /* Alle Inhalte untereinander */
  gap: 1rem; /* Abstand zwischen Elementen */
  max-height: 90vh; /* Begrenzung der maximalen Höhe */
  overflow-y: auto; /* Aktiviert vertikales Scrollen bei Überlauf */
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
  flex-wrap: wrap;
  gap: 1rem; /* Abstand zwischen Buttons, falls sie umbrechen */
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 5px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1; /* Buttons gleich breit */
  min-width: 120px; /* Mindestbreite der Buttons */
}

.btn-delete {
  background-color: #ff4d4d;
  color: white;
  border: none;
}

.btn-delete:hover {
  background-color: #ff1a1a;
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

.break-text {
  word-wrap: break-word; /* Ermöglicht Zeilenumbruch bei langen Wörtern */
  white-space: normal; /* Ermöglicht Zeilenumbruch */
  overflow-wrap: break-word; /* Fällt zurück auf den Umbruch, wenn kein Platz mehr vorhanden ist */
}
</style>
