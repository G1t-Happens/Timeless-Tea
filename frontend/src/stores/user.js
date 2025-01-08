// /store/user.js
import { defineStore } from 'pinia'
import axios from 'axios'
import router from '@/router'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
  }),

  actions: {
    async fetchUser() {
      if (this.user == null) {
        try {
          const response = await axios.get('/sessionUser')
          this.user = response.data
          return this.user
        } catch (error) {
          console.error('Error fetching user:', error)
          return null
        }
      }
    },

    async signIn(email, password) {
      let loginInformation = { emailAddress: email, password: password }
      axios
        .post('/login', loginInformation)
        .then((response) => {
          this.user = response.data
          if (this.user.isAdmin) {
            router.push('/admin')
          } else {
            router.push('/user')
          }
        })
        .catch((error) => {
          window.alert('Falsches Password oder Username!')
          console.error('Login failed:', error)
        })
    },
    async signUp(userData) {
      // Baue das Objekt für den Request
      let registerInformation = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        emailAddress: userData.emailAddress,
        password: userData.password,
        address: {
          country: userData.address.country,
          city: userData.address.city,
          postalCode: userData.address.postalCode,
          street: userData.address.street,
          houseNumber: userData.address.houseNumber,
          state: userData.address.state,
          addressAddition: userData.address.addressAddition,
        },
      }
      axios
        .post('/register', registerInformation)
        .then((response) => {
          this.user = response.data
          router.push('/user')
        })
        .catch((error) => {
          console.error('Registration failed:', error)
        })
    },
    async logout() {
      await axios.get('/logout')
      this.user = null
    },
  },
})
