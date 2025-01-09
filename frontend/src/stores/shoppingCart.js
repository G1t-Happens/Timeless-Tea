import { defineStore } from 'pinia'

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: JSON.parse(localStorage.getItem('cartItems')) || [],
  }),
  getters: {
    totalAmount: (state) => {
      return state.items.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2)
    },
    totalItems: (state) => {
      return state.items.reduce((total, item) => total + item.quantity, 0)
    },
  },
  actions: {
    addToCart(product, quantity) {
      const existingItem = this.items.find((item) => item.productId === product.id)
      if (existingItem) {
        existingItem.quantity += quantity
      } else {
        this.items.push({
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity,
          image: product.image,
        })
      }
      this.saveCart()
    },
    removeFromCart(productId) {
      this.items = this.items.filter((item) => item.productId !== productId)
      this.saveCart()
    },
    updateQuantity(productId, quantity) {
      const item = this.items.find((item) => item.productId === productId)
      if (item) {
        item.quantity = quantity
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
