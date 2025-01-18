// /store/user.js
import { defineStore } from 'pinia'
import axios from 'axios'
import router from '@/router'
import Swal from 'sweetalert2'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
  }),

  actions: {
    async fetchUser() {
      if (this.user == null) {
        try {
          const response = await axios.get('/api/sessionUser')
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
        .post('/api/login', loginInformation)
        .then((response) => {
          this.user = null
          this.user = response.data
          if (this.user.isAdmin) {
            router.push('/admin')
          } else {
            router.push('/user')
          }
        })
        .catch((error) => {
          Swal.fire({
            backdrop: false,
            title: 'Login fehlgeschlagen',
            text: error.response?.data?.error || 'Ein unbekannter Fehler ist aufgetreten.',
            icon: 'error', // SVG-Icon
            confirmButtonText: 'Okay',
            iconColor: 'red',
            confirmButtonColor: '#4a5043',
          })
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
        .post('/api/register', registerInformation)
        .then((response) => {
          this.user = null
          this.user = response.data
          router.push('/user')
        })
        .catch((error) => {
          Swal.fire({
            backdrop: false,
            title: 'Registrierung fehlgeschlagen',
            text: error.response.data.error || 'Ein unbekannter Fehler ist aufgetreten.',
            icon: 'error',
            confirmButtonText: 'Okay',
          })
        })
    },
    async logout() {
      await axios.get('/api/logout')
      this.user = null
    },
  },
})
