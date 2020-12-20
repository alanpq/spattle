import Vue from 'vue'
import App from './App.vue'
import VueRouter from 'vue-router'

import Index from './index.vue'
import Battle from './battle.vue'

import "regenerator-runtime"

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

const haveToken = () => {
  const acquired_at = localStorage.getItem("acquired_at");
  if (!acquired_at) return false;
  // TODO: check if we can refresh token after expiry
  if (Date.now() < parseInt(acquired_at) + parseInt(localStorage.getItem("expires_in"))) {
    return true;
  } else { // we need to refresh token
    // TODO: token refreshing
    return false;
  }
}

const loadOrUpdate = async () => {
  if (window.location.search) { // maybe new oauth response?
    const params = new URLSearchParams(window.location.search)
    if (params.get('code')) {
      const formData = new FormData();
      formData.append("client_id", "3a25adc518944ba0b50c6a1376ab6a8a") // TODO: fetch client id from server
      formData.append("grant_type", "authorization_code")
      formData.append("code", params.get('code'))
      formData.append("redirect_uri", "http://localhost:8080") // TODO: change redirect url
      console.log("verifier:", localStorage.getItem("verifier"))
      formData.append("code_verifier", localStorage.getItem("verifier"))
      const res = await (fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams(formData).toString(),
      }).then(res => res.json()))
      console.log(res);
      localStorage.setItem("access_token", res.access_token)
      localStorage.setItem("acquired_at", Date.now())
      localStorage.setItem("expires_in", res.expires_in * 1000)
      localStorage.setItem("refresh_token", res.refresh_token)
    } else {
      console.error(params.get('error'))
    }
    history.replaceState({}, "", location.protocol + '//' +
      location.host +
      location.pathname)
  }

  if (router.currentRoute == "/" && haveToken()) {
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