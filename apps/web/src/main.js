import { createApp } from 'vue'
import App from './App.vue'
import router from './app/router'
import { installBrowserErrorReporting } from '../../../config/clientErrorReporter.mjs'
import { installBrowserPerformanceReporting } from '../../../config/clientPerformanceReporter.mjs'
import { USER_SESSION_EXPIRED_EVENT } from './shared/api/httpClient.js'
import './assets/main.css'

const app = createApp(App)
installBrowserErrorReporting(app, { environment: import.meta.env })
installBrowserPerformanceReporting({ environment: import.meta.env })
app.use(router)
app.mount('#app')

window.addEventListener(USER_SESSION_EXPIRED_EVENT, () => {
  const currentRoute = router.currentRoute.value
  if (currentRoute.path === '/login') return
  router.replace({
    path: '/login',
    query: { redirect: currentRoute.fullPath, reason: 'expired' }
  })
})
