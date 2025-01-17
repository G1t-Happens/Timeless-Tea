// src/stores/wishlist.js
import { defineStore } from 'pinia'

export const useWishlistStore = defineStore('wishlist', {
  state: () => ({
    // Versuche aus dem localStorage zu lesen, oder initialisiere mit leerem Array
    items: JSON.parse(localStorage.getItem('wishlistItems')) || [],
  }),
  getters: {
    // Wie viele Produkte sind in der Wunschliste?
    itemCount: (state) => state.items.length,

    // Prüft, ob ein bestimmtes Produkt bereits gewünscht ist
    isWished: (state) => (productId) => {
      return state.items.some((item) => item.id === productId)
    },
  },
  actions: {
    // Produkt in die Wunschliste aufnehmen (inkl. aller Felder, die du speichern möchtest)
    addToWishlist(product) {
      // Prüfen, ob Produkt bereits existiert
      const existingItem = this.items.find((item) => item.id === product.id)

      // Nur hinzufügen, wenn noch nicht vorhanden
      if (!existingItem) {
        this.items.push({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          averageRating: product.averageRating,
          reviews: product.reviews,
          quantity: product.quantity,
          description: product.description || '',
          productCategories: product.productCategories || [],
          // weitere Felder, falls notwendig
        })
        this.saveWishlist()
      }
    },

    // Produkt aus der Wunschliste entfernen
    removeFromWishlist(productId) {
      this.items = this.items.filter((item) => item.id !== productId)
      this.saveWishlist()
    },

    // Toggle-Funktion: Hinzufügen oder Entfernen
    toggleWishlist(product) {
      if (this.isWished(product.id)) {
        this.removeFromWishlist(product.id)
      } else {
        this.addToWishlist(product)
      }
    },

    // Wunschliste in localStorage speichern
    saveWishlist() {
      localStorage.setItem('wishlistItems', JSON.stringify(this.items))
    },
    clearWishlist() {
      // 1) Array im Store leeren
      this.items = []

      // 2) Eintrag im localStorage entfernen
      localStorage.setItem('wishlistItems', JSON.stringify(this.items))
    },
  },
})
