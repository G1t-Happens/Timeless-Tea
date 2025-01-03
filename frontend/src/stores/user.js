// /store/user.js
import { defineStore } from "pinia";
import axios from "axios";
import router from "@/router"; // Import the router

export const useUserStore = defineStore("user", {
  state: () => ({
    user: null,
  }),

  actions: {
    async fetchUser() {
      if (this.user == null) {
        try {
          const response = await axios.get("/sessionUser");
          this.user = response.data;
          return this.user;
        } catch (error) {
          if (error.response && error.response.status === 403) {
            console.log("No user session found.");
            this.user = null;
          } else {
            console.error("Error fetching user:", error);
          }
          return null;
        }
      }
    },

    async signIn(email, password) {
      let loginInformation = { emailAddress: email, password: password };
      axios
        .post("/login", loginInformation)
        .then((response) => {
          this.user = response.data;
          if (this.user.isAdmin) {
            router.push("/admin");
          } else {
            router.push("/user");
          }
        })
        .catch((error) => {
          window.alert("Falsches Password oder Username!");
          console.error("Login failed:", error);
        });
    },
    async signUp(firstName, lastName, email, password) {
      let registerInformation = {
        firstName: firstName,
        lastName: lastName,
        emailAddress: email,
        password: password,
      };
      axios
        .post("/register", registerInformation)
        .then((response) => {
          this.user = response;
          router.push("/user");
        })
        .catch((error) => {
          console.error("Login failed:", error);
        });
    },
    async logout() {
      await axios.get("/logout")
      this.user = null;
    }
  },
});
