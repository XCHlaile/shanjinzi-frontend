import { createApp } from 'vue'
import App from './App.vue'
import router from './app/router'
import { ADMIN_SESSION_EXPIRED_EVENT } from './api/client.js'
import { installBrowserErrorReporting } from '../../../config/clientErrorReporter.mjs'
import { installBrowserPerformanceReporting } from '../../../config/clientPerformanceReporter.mjs'
import './assets/main.css'

const app = createApp(App)
installBrowserErrorReporting(app, { environment: import.meta.env })
installBrowserPerformanceReporting({ environment: import.meta.env })

window.addEventListener(ADMIN_SESSION_EXPIRED_EVENT, () => {
  const current = router.currentRoute.value
  if (current.path === '/login') return
  router.replace({
    path: '/login',
    query: { redirect: current.fullPath, reason: 'expired' }
  })
})

app.use(router)
app.mount('#app')
