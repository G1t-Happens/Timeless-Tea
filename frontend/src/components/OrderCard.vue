<template>
  <div class="order-card mb-1 shadow-sm">
    <div class="order-header">
      <h5>Bestellung ID: {{ order.id }}</h5>
      <span :class="['status', order.orderStatus]">{{ order.orderStatus }}</span>
    </div>
    <div class="order-details">
      <p class="detail-item">
        <span class="detail-label">Vorname:</span>
        <span class="detail-value">{{ order.user.firstName }}</span>
      </p>
      <p class="detail-item">
        <span class="detail-label">Nachname:</span>
        <span class="detail-value">{{ order.user.lastName }}</span>
      </p>
      <p class="detail-item">
        <span class="detail-label">Gesamtbetrag:</span>
        <span class="detail-value">{{ formatCurrency(order.totalAmount) }}</span>
      </p>
      <p class="detail-item">
        <span class="detail-label">Bestellt am:</span>
        <span class="detail-value">{{ formatDate(order.createdAt) }}</span>
      </p>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    order: {
      type: Object,
      required: true,
    },
  },
  methods: {
    formatCurrency(amount) {
      return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
      }).format(amount)
    },
    formatDate(timestamp) {
      return new Date(timestamp).toLocaleDateString('de-DE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    },
  },
}
</script>

<style scoped>
/* Grundlayout */
.order-card {
  border: 1px solid #e5e5e5;
  border-radius: 12px;
  padding: 20px;
  background-color: #ffffff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.order-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}

/* Header */
.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.order-header h5 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #333333;
}

.status {
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 0.875rem;
  font-weight: 500;
  text-transform: capitalize;
  color: #ffffff;
}

.status.open {
  background-color: #f7b731;
}

.status.processing {
  background-color: #3498db;
}

.status.successful {
  background-color: #20bf6b;
}

.status.failed {
  background-color: #e74c3c;
}

.status.refunded {
  background-color: #8e44ad; /* Beispiel: Lila Farbe für 'Erstattet' */
}

.status.canceled {
  background-color: #eb3b5a;
}

/* Details */
.order-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  font-size: 1rem;
  color: #555555;
}

.detail-label {
  font-weight: 500;
  color: #888888;
}

.detail-value {
  font-weight: 600;
  color: #333333;
}

/* Responsives Verhalten */
@media (max-width: 768px) {
  .order-card {
    padding: 16px;
  }

  .order-header h5 {
    font-size: 1rem;
  }

  .detail-item {
    font-size: 0.9rem;
  }
}
</style>
