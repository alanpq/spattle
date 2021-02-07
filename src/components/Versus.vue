<template>
  <article class="versus">
    <section class="title song-a">
      <h3 class="song-a">{{ $data._battle.a.name }}</h3>
      <h4 class="song-a">
        {{
          $data._battle.a.artistStr
        }}
      </h4>
    </section>
    <SongView
      customClass="song-a"
      v-bind:song="$data._battle.a"
      @onClick="play(0)"
    />
    <button
      class="song-a winner"
      @click="win(0)"
      @mouseover="$event.target.innerText = 'Winner!'"
      @mouseleave="$event.target.innerText = 'Choose a winner'"
    >
      Choose a winner
    </button>
    <span>VERSUS</span>
    <section class="title song-b">
      <h3 class="song-b">{{ $data._battle.b.name }}</h3>
      <h4 class="song-b">
        {{ $data._battle.b.artistStr }}
      </h4>
    </section>
    <SongView
      customClass="song-b"
      v-bind:song="$data._battle.b"
      @onClick="play(1)"
    />
    <button
      class="song-b winner"
      @click="win(1)"
      @mouseover="$event.target.innerText = 'Winner!'"
      @mouseleave="$event.target.innerText = 'Choose a winner'"
    >
      Choose a winner
    </button>
  </article>
</template>

<script>
import SongView from "./SongView";
import PlayerControls from "./PlayerControls";

const fetchTrackDetails = async (obj) => {
  const track = await spotify.getTrack(obj.id);
  console.log(track);
  Object.assign(obj, track);
  if (track.images) obj.img = track.images[0].url;
  else obj.img = track.album.images[0].url;

  const c = obj.artists.reduce((acc, artist) => {
    return `${acc}, ${artist.name}`;
  }, "");
  obj.artistStr = c.slice(2, 27) + ((c.length > 27) ? "..." : "")
};

import * as spotify from "../spotify";
export default {
  props: {
    battle: Object,
    player: Object,
  },
  data: function () {
    return {
      _battle: this.battle,
      // _player: this.player,
    };
  },
  components: {
    SongView,
    PlayerControls,
  },
  mounted: function () {
    this.newBattle();
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
      // this.setTrackPercent(0);
    },
    win: async function (song) {
      const res = fetch(
        `${window.location.protocol}//${window.location.host}/api/battle/win/${this.battle.token}?winner=${song}`,
        { method: "POST" }
      ).then((r) => r.json());
      console.log(res);
      this.newBattle();
    },

    fetchBattleDetails: async function () {
      await Promise.all([
        fetchTrackDetails(this.battle.a),
        fetchTrackDetails(this.battle.b),
      ]);
      console.log(this.battle.a.artistStr)
      console.log(this.battle.b.artistStr)
    },
    newBattle: async function () {
      console.log("Getting new battle..");
      const ids = await (
        await fetch(
          `${window.location.protocol}//${window.location.host}/api/battle`
        )
      ).json();
      this.battle.a.id = ids.a;
      this.battle.b.id = ids.b;
      this.battle.token = ids.token;
      this.fetchBattleDetails();
    },
  },
};
</script>

<style lang="scss">
.versus {
  display: grid;
  $mobileSize: 31vh;
  $artistH: 0.5em;
  $songNameH: 1.5em - $artistH;
  width: 100%;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: $songNameH $artistH $mobileSize 5vh $songNameH $artistH $mobileSize;
  grid-template-areas:
    "TITLEA TITLEA TITLEA"
    "ARTISTA ARTISTA ARTISTA"
    ". IMGA WINA"
    "VERSUS VERSUS VERSUS"
    "TITLEB TITLEB TITLEB"
    "ARTISTB ARTISTB ARTISTB"
    ". IMGB WINB";
  justify-content: center;
  justify-items: center;
  $gap: 1.5vh;
  gap: $gap;

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

    @media screen and (min-aspect-ratio: 11/10) {
      margin-bottom: 0px;
    }
  }

  h4 {
    text-align: center;
    margin: 0;
    align-self: flex-end;
    &.song-a {
      grid-area: ARTISTA;
    }

    &.song-b {
      grid-area: ARTISTB;
    }
  }

  img {
    width: $mobileSize;
    // display: inline;
    // display: none;
  }

  section {
    &.song {
      &.song-a {
        grid-area: IMGA;
      }

      &.song-b {
        grid-area: IMGB;
      }
    }
    &.title {
      &.song-a {
        grid-area: TITLEA;
      }

      &.song-b {
        grid-area: TITLEB;
      }
    }
  }

  button.winner {
    // width: 50%;
    // margin: 0 0 0 10px;
    justify-self: left;

    width: 150px;

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