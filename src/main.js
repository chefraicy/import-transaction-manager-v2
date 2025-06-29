import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import './assets/styles.css'

// Import views
import Dashboard from './views/Dashboard.vue'
import Transactions from './views/Transactions.vue'
import FileManager from './views/FileManager.vue'
import Permits from './views/Permits.vue'
import KPIDashboard from './views/KPIDashboard.vue'
import Logs from './views/Logs.vue'

// Create router
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'Dashboard', component: Dashboard },
    { path: '/transactions', name: 'Transactions', component: Transactions },
    { path: '/file-manager', name: 'FileManager', component: FileManager },
    { path: '/permits', name: 'Permits', component: Permits },
    { path: '/kpi-dashboard', name: 'KPIDashboard', component: KPIDashboard },
    { path: '/logs', name: 'Logs', component: Logs }
  ]
})

// Create app
const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')