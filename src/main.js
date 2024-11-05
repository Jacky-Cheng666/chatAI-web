import 'normalize.css'
import 'ant-design-vue/es/message/style/css';
import './assets/style/main.css'
import 'babel-polyfill'
import 'highlight.js/styles/atom-one-dark.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import App from './App.vue'
import router from './router'
import '@/permission'

const app = createApp(App)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
app.use(pinia)
app.use(router)

app.mount('#app')
