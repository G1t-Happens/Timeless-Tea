import { defineStore } from 'pinia'

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: JSON.parse(localStorage.getItem('cartItems')) || [],
  }),
  getters: {
    // Gesamtpreis (Preis * productQuantity)
    totalAmount: (state) => {
      return state.items
        .reduce((total, item) => total + item.price * item.productQuantity, 0)
        .toFixed(2)
    },
    // Gesamtanzahl aller Artikel im Warenkorb (aufsummierte productQuantity)
    totalItems: (state) => {
      return state.items.reduce((total, item) => total + item.productQuantity, 0)
    },
    isWished: (state) => (productId) => {
      return state.items.some((item) => item.id === productId)
    },
  },
  actions: {
    addToCart(product, quantity) {
      const existingItem = this.items.find((item) => item.id === product.id)
      if (existingItem) {
        existingItem.productQuantity += quantity
      } else {
        this.items.push({
          productQuantity: quantity,
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          averageRating: product.averageRating,
          reviews: product.reviews,
          quantity: product.quantity,
          description: product.description || '',
          productCategories: product.productCategories || [],
        })
      }
      this.saveCart()
    },
    removeFromCart(productId) {
      this.items = this.items.filter((item) => item.id !== productId)
      this.saveCart()
    },
    updateQuantity(productId, quantity) {
      const item = this.items.find((item) => item.id === productId)
      if (item) {
        item.productQuantity = quantity
        this.saveCart()
      }
    },
    clearCart() {
      this.items = []
      this.saveCart()
    },
    saveCart() {
      localStorage.setItem('cartItems', JSON.stringify(this.items))
    },
  },
})
