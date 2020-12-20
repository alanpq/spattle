
<template>
  <main id="index">
    <h1>Spattle</h1>
    <section>
      <p>Finding the best song using 1v1 battles.</p>
    </section>
    <button @click="spotifyAuth()">Log in with Spotify</button>
  </main>
</template>

<script>
import "regenerator-runtime";
const getChallenge = async () => {
  const res = await (
    await fetch("http://" + window.location.hostname + ":3000/api/challenge")
  ).json();
  console.log(res);
  console.log("challenge:", res.challenge);
  localStorage.setItem("challenge", res.challenge);
  console.log("verifier:", res.verifier);
  localStorage.setItem("verifier", res.verifier);
  return res.challenge;
};

const constructAuthURI = async () => {
  // https://accounts.spotify.com/authorize
  // TODO: add state param
  const params = new URLSearchParams();
  params.append("client_id", "3a25adc518944ba0b50c6a1376ab6a8a"); // TODO: fetch client id from server
  params.append("response_type", "code");
  params.append("scope", "streaming");
  params.append("redirect_uri", "http://localhost:8080"); // TODO: change redirect url
  params.append("code_challenge_method", "S256");
  const challenge = await getChallenge();
  params.append("code_challenge", challenge);
  return "https://accounts.spotify.com/authorize?" + params.toString();
};

export default {
  name: "index",
  data() {
    return {};
  },
  methods: {
    spotifyAuth: () => {
      constructAuthURI().then((url) => {
        window.location = url;
      });
    },
  },
};
</script>
<style lang="scss" src="./style/style.scss"></style>

<style lang="scss">
main#index {
  display: flex;
  flex-direction: column;
  // justify-content: center;

  margin: 0 40px;

  height: 100%;

  h1 {
    font-size: 15vw;
    text-align: center;
    margin-top: 20vh;
    margin-bottom: 0;
  }

  section {
    margin: 0 10px;
  }

  button {
    margin: 10px auto 0px auto;
    min-width: max-content;
    width: 100%;
    max-width: 300px;
  }
  @media (min-width: 600px) {
    h1 {
      text-align: left;
    }
  }
}
</style>