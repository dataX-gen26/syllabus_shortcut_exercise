import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/main.scss'
import './assets/bootstrap-custom.scss'

const app = createApp(App)

app.use(router)

app.mount('#app')