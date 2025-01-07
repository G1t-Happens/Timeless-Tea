import { defineStore } from 'pinia'
import axios from 'axios'

export const useCartStore = defineStore('cart', {
  state: () => ({
    cart: [], // Warenkorb: Liste der Artikel
    shippingAddress: null, // Versandadresse
    paymentMethod: null, // Zahlungsmethode
    orderDetails: null, // Details der letzten Bestellung
    error: null, // Fehler für die Anzeige
  }),

  getters: {
    // Anzahl der Artikel im Warenkorb
    cartItemCount(state) {
      return state.cart.reduce((count, item) => count + item.quantity, 0)
    },
    // Gesamtkosten der Artikel im Warenkorb
    cartTotal(state) {
      return state.cart.reduce((total, item) => total + item.price * item.quantity, 0)
    },
    // Prüft, ob die Bestellung abgeschlossen werden kann
    canPlaceOrder(state) {
      return state.cart.length > 0 && state.shippingAddress && state.paymentMethod
    },
  },

  actions: {
    /**
     * Artikel in den Warenkorb hinzufügen
     * @param {Object} product { id, name, price, quantity }
     */
    addToCart(product) {
      const existingProduct = this.cart.find((item) => item.id === product.id)
      if (existingProduct) {
        existingProduct.quantity += product.quantity
      } else {
        this.cart.push({ ...product })
      }
    },

    /**
     * Artikel aus dem Warenkorb entfernen
     * @param {number} productId
     */
    removeFromCart(productId) {
      this.cart = this.cart.filter((item) => item.id !== productId)
    },

    /**
     * Warenkorb leeren
     */
    clearCart() {
      this.cart = []
    },

    /**
     * Versandadresse festlegen
     * @param {Object} address { street, city, postalCode, country }
     */
    setShippingAddress(address) {
      this.shippingAddress = address
    },

    /**
     * Zahlungsmethode festlegen
     * @param {Object} paymentMethod { type, details }
     */
    setPaymentMethod(paymentMethod) {
      this.paymentMethod = paymentMethod
    },

    /**
     * Bestellung aufgeben
     */
    async placeOrder() {
      if (!this.canPlaceOrder) {
        this.error = 'Bitte füllen Sie alle Felder aus, bevor Sie die Bestellung aufgeben.'
        return
      }

      try {
        const payload = {
          items: this.cart,
          shippingAddress: this.shippingAddress,
          paymentMethod: this.paymentMethod,
          totalAmount: this.cartTotal,
        }

        const response = await axios.post('/api/orders', payload)
        this.orderDetails = response.data

        // Warenkorb nach erfolgreicher Bestellung leeren
        this.clearCart()
      } catch (err) {
        console.error(err)
        this.error = 'Fehler beim Platzieren der Bestellung. Bitte versuchen Sie es später erneut.'
      }
    },
  },
})
