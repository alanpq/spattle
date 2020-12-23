import Vue from 'vue'
import App from './App.vue'
import VueRouter from 'vue-router'

import Index from './index.vue'
import Battle from './battle.vue'

import "regenerator-runtime"
import * as spotify from './spotify'

const routes = {
  '/': Index,
  '/battle': Battle
}

const router = new VueRouter(
  {
    mode: 'history',
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

const haveToken = () => {
  const acquired_at = localStorage.getItem("acquired_at");
  if (!acquired_at) return false;
  // TODO: check if we can refresh token after expiry
  if (Date.now() < parseInt(acquired_at) + parseInt(localStorage.getItem("expires_in"))) {
    return true;
  } else { // we need to refresh token
    return false;
  }
}

const loadOrUpdate = async () => {
  if (window.location.search) { // maybe new oauth response?
    const params = new URLSearchParams(window.location.search)
    if (params.get('code')) {
      await spotify.getToken(params.get('code'))
    } else {
      console.error(params.get('error'))
    }
    history.replaceState({}, "", location.protocol + '//' +
      location.host +
      location.pathname)
  }
  if (router.currentRoute.path == "/" && haveToken()) {
    console.log("already have token")
    router.push("/battle")
  }
}

window.onpopstate = loadOrUpdate;
window.onload = loadOrUpdate;




Vue.use(VueRouter)
const app = new Vue({
  el: '#app',
  render: h => h(App),
  router,
})
