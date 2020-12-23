<template>
  <article class="versus">
    <h3 class="song-a">{{ $data._battle.a.name }}</h3>
    <SongView
      customClass="song-a"
      v-bind:song="$data._battle.a"
      @onClick="play(0)"
    />
    <button class="song-a winner" @click="win(0)">Winner!</button>
    <span>VERSUS</span>
    <h3 class="song-b">{{ $data._battle.b.name }}</h3>
    <SongView
      customClass="song-b"
      v-bind:song="$data._battle.b"
      @onClick="play(1)"
    />
    <button class="song-b winner" @click="win(1)">Winner!</button>
  </article>
</template>

<script>
import SongView from "./SongView";
import PlayerControls from "./PlayerControls";

import * as spotify from "../spotify";
export default {
  props: {
    battle: Object,
  },
  data: function () {
    return {
      _battle: this.battle,
    };
  },
  components: {
    SongView,
    PlayerControls,
  },
  methods: {
    play: function (i) {
      let p;
      console.log(this.battle.a);
      if (i == 0) p = spotify.playDevice(undefined, [this.battle.a.uri]);
      else p = spotify.playDevice(undefined, [this.battle.b.uri]);
      p.then(this.doCheck);
      this.player.progress_ms = 0;
      this.lastUpdateAt = performance.now();
      this.setTrackPercent(0);
    },
    win: async function (song) {
      const res = fetch(
        `${window.location.protocol}//${window.location.host}/api/battle/win/${this.battle.token}?winner=${song}`,
        { method: "POST" }
      ).then((r) => r.json());
      console.log(res);
      this.newBattle();
    },
  },
};
</script>

<style lang="scss">
.versus {
  display: grid;
  $mobileSize: 31vh;
  $songNameH: 1em;
  width: 100%;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: $songNameH $mobileSize 5vh $songNameH $mobileSize;
  grid-template-areas:
    "TITLEA TITLEA TITLEA"
    ". IMGA WINA"
    "VERSUS VERSUS VERSUS"
    "TITLEB TITLEB TITLEB"
    ". IMGB WINB";
  justify-content: center;
  justify-items: center;
  gap: 1.5vh;

  @media only screen and (min-aspect-ratio: 11/10) {
    grid-template-columns: 2fr 1fr 2fr;
    grid-template-rows: 5em min-content min-content;
    grid-template-areas:
      "TITLEA . TITLEB"
      "IMGA VERSUS IMGB"
      "WINA . WINB";
  }

  // height: 50vh;

  align-items: center;

  padding: 0 50px;
  width: 100%;
  margin: auto;
  max-width: 800px;
  box-sizing: border-box;

  // VERSUS
  span {
    grid-area: VERSUS;
    justify-self: center;
    text-align: center;

    font-size: 0.8em;
    @media screen and (min-aspect-ratio: 11/10) {
      font-size: 1em;
      font-weight: bold;
    }
  }

  h3 {
    text-align: center;
    margin: 0;

    &.song-a {
      grid-area: TITLEA;
    }

    &.song-b {
      grid-area: TITLEB;
    }

    @media screen and (min-aspect-ratio: 11/10) {
      margin-bottom: 5px;
    }
  }

  img {
    width: $mobileSize;
    // display: inline;
    // display: none;
  }

  section {
    &.song-a {
      grid-area: IMGA;
    }

    &.song-b {
      grid-area: IMGB;
    }
  }

  button.winner {
    // width: 50%;
    // margin: 0 0 0 10px;
    justify-self: left;

    &.song-a {
      grid-area: WINA;
    }
    &.song-b {
      grid-area: WINB;
    }

    @media screen and (min-aspect-ratio: 11/10) {
      justify-self: center;
      margin: 5px 0 0 0;
    }
  }
}
</style>