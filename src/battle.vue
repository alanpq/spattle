<template>
  <main id="battle">
    <h1>Which song is better?</h1>
    <!-- TODO: add 'play both' button -->
    <Versus v-bind:battle="battle" v-bind:player="player" />
    <span class="nowplaying">{{(player.item || {name:''}).name}}</span>
    <PlayerControls v-bind:player="player" />
    <!-- <button @click="newBattle()">New Battle</button> -->
    <TrackAdder />
  </main>
</template>

<script>
import PlaySVG from "./assets/PlaySVG";
import PauseSVG from "./assets/PauseSVG";

import Versus from "./components/Versus";
import PlayerControls from "./components/PlayerControls";
import TrackAdder from "./components/TrackAdder";

import * as spotify from "./spotify";

const playbackState = {};

export default {
  name: "battle",
  data() {
    return {
      battle: {
        token: "",
        a: {
          name: "Test Song TITLE 1",
          img:
            "https://i.scdn.co/image/ab67616d0000b273869f7cf031b24df4dbb1f778",
        },
        b: {
          name: "Test Song TITLE 2",
          img:
            "https://i.scdn.co/image/ab67616d0000b273869f7cf031b24df4dbb1f778",
        },
      },
      devicesOpen: false,
      player: playbackState,
      stateUpdateInt: "",
    };
  },
  mounted: function () {
    this.startCheck();
  },
  beforeUnmount: function () {
    clearInterval(this.stateUpdateInt);
  },
  methods: {
    doCheck: async function () {
      this.player = (await spotify.getInfo()) || {};
      this.player.lastUpdateAt = performance.now();
      // this.tickTrackPercent(this.lastUpdateAt);
    },
    startCheck: function () {
      this.stateUpdateInt = setInterval(this.doCheck, 2000);
    },
  },
  components: {
    PlaySVG,
    PauseSVG,
    Versus,
    PlayerControls,
    TrackAdder,
  },
};
</script>


<style lang="scss">
@keyframes lds-ring {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
main#battle {
  @media only screen and (min-aspect-ratio: 11/10) {
    padding-top: 20px;
  }

  text-align: center;

  .nowplaying {
    position: relative;
    top: 20px;
    overflow: hidden;
    font-size: .9em;
  }

  h1 {
    text-align: center;
    margin: 0;
    height: 10vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  article {
    padding: 0 50px;
  }

  article.text {
    position: absolute;
    left: 0;
    right: 0;
    top: 100vh;
    @media screen and (min-aspect-ratio: 11/10) {
      position: unset;
    }
  }
}
</style>

<style lang="scss" src="./style/style.scss"></style>