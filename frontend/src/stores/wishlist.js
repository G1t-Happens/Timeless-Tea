// src/stores/wishlist.js
import { defineStore } from 'pinia'

export const useWishlistStore = defineStore('wishlist', {
  state: () => ({
    items: [] // Array von Produkt-IDs oder vollständigen Produktobjekten
  }),
  getters: {
    // Gibt die Anzahl der Artikel in der Wunschliste zurück
    itemCount: (state) => state.items.length,

    // Überprüft, ob ein bestimmtes Produkt in der Wunschliste ist
    isWished: (state) => (productId) => state.items.includes(productId),

    // Gibt die vollständigen Produktobjekte der Wunschliste zurück
    wishedProducts: (state) => state.items
      .map(id => state.itemsDetails[id])
      .filter(product => product !== undefined)
  },
  actions: {
    // Fügt ein Produkt zur Wunschliste hinzu
    addToWishlist(productId) {
      if (!this.items.includes(productId)) {
        this.items.push(productId)
      }
    },

    // Entfernt ein Produkt aus der Wunschliste
    removeFromWishlist(productId) {
      this.items = this.items.filter(id => id !== productId)
    },

    // Toggle-Funktion zum Hinzufügen oder Entfernen von der Wunschliste
    toggleWishlist(productId) {
      if (this.isWished(productId)) {
        this.removeFromWishlist(productId)
      } else {
        this.addToWishlist(productId)
      }
    }
  }
})
