<template>
  <header class="py-2">
    <div class="header-container">

      <!-- Einstellungen -->
      <a href="/settings.html" class="icon-wrapper" aria-label="Settings">
        <img
          src="@/assets/icons/settings.png"
          alt="Settings"
          class="round-icon-responsive"
        />
      </a>

      <!-- Banner Logo -->
      <div class="logo-center">
        <router-link to="/">
          <button class="btn btn-image" type="button">
            <img
              src="@/assets/images/banner_logo.png"
              class="banner-logo-responsive"
              alt="Tea Logo"
            />
          </button>
        </router-link>
      </div>

      <!-- Account/Logout + Warenkorb -->
      <div class="d-flex align-items-center position-relative" ref="accountContainerRef">

        <!-- Account-Icon -->
        <img
          :src="currentAccountIcon"
          :class="['round-icon-responsive', user ? 'icon-glow' : '']"
          alt="Account-Icon"
          @click="handleAccountIconClick"
          class="icon-wrapper"
        />

        <!-- Logout-Popup -->
        <transition name="fade">
          <div
            v-if="user && showLogoutPopup"
            ref="popupRef"
            class="logout-popup"
            @click.stop
          >
            <button @click="logout" class="btn btn-danger">Abmelden</button>
          </div>
        </transition>

        <!-- Shopping Cart -->
        <a href="/search.html" class="icon-wrapper" aria-label="ShoppingCart">
          <img
            src="@/assets/icons/shopingcart.png"
            alt="ShoppingCart"
            class="round-icon-responsive"
          />
        </a>
      </div>

    </div>
  </header>
</template>


<script setup>
  import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
  import { useRouter } from 'vue-router'
  import { useUserStore } from '@/stores/user.js'
  import accountIcon from '@/assets/icons/account.png'
  import accountLoggedInIcon from '@/assets/icons/accountLoggedIn.png'
  const userStore = useUserStore()
  const router = useRouter()
  const user = computed(() => userStore.user)
  const showLogoutPopup = ref(false)
  const popupRef = ref(null)
  const accountContainerRef = ref(null)

  // currentAccountIcon -> Wählt automatisch das richtige Icon
  // je nachdem, ob ein User eingeloggt ist (userStore.user != null).
  const currentAccountIcon = computed(() => {
    return user.value ? accountLoggedInIcon : accountIcon
  })

  //Globale Klick-Listener registrieren, um "außerhalb"-Klick zu erkennen
  const handleGlobalClick = (event) => {
    if (!showLogoutPopup.value || !popupRef.value || !accountContainerRef.value) return
    const target = event.target

    // Prüfen, ob der Klick außerhalb des accountContainersRef ist
    if (!accountContainerRef.value.contains(target)) {
      showLogoutPopup.value = false
    }
  }

  onMounted(() => {
    window.addEventListener('click', handleGlobalClick)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('click', handleGlobalClick)
  })

  //handleAccountIconClick:
  const handleAccountIconClick = () => {
    if (!user.value) {
      router.push('/login')
    } else {
      showLogoutPopup.value = !showLogoutPopup.value
    }
  }


  // logout -> Pinia-Store anweisen, auszuloggen.
  // Schließt das Popup und leitet auf die Startseite weiter.
  const logout = async () => {
    try {
      await userStore.logout()
      showLogoutPopup.value = false
      await router.push('/')
    } catch (error) {
      console.error('Fehler beim Logout:', error)
    }
  }
</script>

<style scoped>
  header {
    background-image: url('@/assets/images/banner.png');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  }

  /* Header Container */
  .header-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 0 15px; /* Einheitlicher Abstand für den Header */
  }

  /* Icon Wrapper */
  .icon-wrapper {
    margin: 0 10px; /* Abstand zwischen Icons */
    display: inline-flex;
    align-items: center;
  }

  /* Logo-Center */
  .logo-center {
    flex: 1; /* Logo bleibt zentriert */
    text-align: center;
  }

  /* Logout Popup */
  .logout-popup {
    position: absolute;
    top: 70px;
    right: 15px;
    background: white;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    border-radius: 8px;
    padding: 12px 16px;
    z-index: 1000;
    min-width: 130px;
  }

  .logout-popup button {
    width: 100%;
    padding: 8px 12px;
    cursor: pointer;
    border: none;
    border-radius: 4px;
    background-color: #C06E52;
    color: white;
    font-weight: bold;
    transition: background-color 0.2s ease;
  }

  .logout-popup button:hover {
    background-color: #8F4C37;
  }
</style>

