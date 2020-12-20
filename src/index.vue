
<template>
  <main id="index">
    <h1>Spattle</h1>
    <section>
      <p>Finding the best song using 1v1 battles.</p>
    </section>
    <router-link tag="button" to="battle">Log in with Spotify</router-link>
  </main>
</template>

<script>
export default {
  name: "index",
  data() {
    return {};
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