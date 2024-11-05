import { defineStore } from 'pinia'
export const useNavbarStore = defineStore('navbar', {
  state: () => ({
    showLogin: false
  }),
  actions: {
    openLogin() {
      this.showLogin = true
    },
    closeLogin() {
      this.showLogin = false
    }
  },
  persist: true
})