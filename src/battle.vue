<template>
  <main id="battle">
    <h1>Which song is better?</h1>
    <article class="versus">
      <h3 class="song-a">STAR FRUITS SURF RIDER</h3>
      <img
        class="song-a"
        src="https://i.scdn.co/image/ab67616d0000b273869f7cf031b24df4dbb1f778"
      />
      <span>VERSUS</span>
      <h3 class="song-b">STAR FRUITS SURF RIDER</h3>
      <img
        class="song-b"
        src="https://i.scdn.co/image/ab67616d0000b273869f7cf031b24df4dbb1f778"
      />
    </article>
    <article>
      <p>Not seeing songs you like? You can:</p>
      <button @click="addPlaylists()">Add all songs from my playlists</button>
      <p>or search a song/album to add:</p>
      <input type="text" placeholder="Song/Album name" />
    </article>
  </main>
</template>

<script>
import * as spotify from "./spotify";

export default {
  name: "battle",
  data() {
    return {
      msg: "Welcome to Your Vue.js App",
    };
  },
  methods: {
    addPlaylists: async () => {
      console.log(await spotify.getPlaylists());
    },
  },
};
</script>


<style lang="scss">
main#battle {
  padding-top: 20px;

  h1 {
    text-align: center;
  }
  article {
    padding: 0 50px;
  }

  .versus {
    display: grid;
    grid-template-columns: 2fr 1fr 2fr;
    grid-template-rows: min-content min-content;

    // height: 50vh;

    align-items: center;

    padding: 50px;
    padding-top: 0;
    width: 100%;
    margin: auto;
    max-width: 800px;
    box-sizing: border-box;

    span {
      grid-row: 2/3;
      grid-column: 2/3;
      text-align: center;

      font-weight: bold;
    }

    h3 {
      text-align: center;
      margin: 0;
      margin-bottom: 5px;
      grid-row: 1/2;
      &.song-a {
        grid-column: 1/2;
      }

      &.song-b {
        grid-column: 3/4;
      }
    }

    img {
      // width: 100%;
      // height: 100%;
      width: 100%;
      grid-row: 2/3;
      &.song-a {
        grid-column: 1/2;
      }

      &.song-b {
        grid-column: 3/4;
      }
    }
  }
}
</style>

<style lang="scss" src="./style/style.scss"></style>