import Vue from 'vue'
import App from './App.vue'
import VueRouter from 'vue-router'

import Index from './index.vue'
import Battle from './battle.vue'

const routes = {
  '/': Index,
  '/battle': Battle
}

const router = new VueRouter(
  {
    routes: [
      {
        path: '/',
        name: 'index',
        component: Index,
      },
      {
        path: '/battle',
        name: 'battle',
        component: Battle,
        // props: true,
      },
    ]
  }
)

Vue.use(VueRouter)
const app = new Vue({
  el: '#app',
  render: h => h(App),
  router,
})