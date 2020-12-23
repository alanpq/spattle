<template>
  <main id="battle">
    <h1>Which song is better?</h1>
    <article class="versus">
      <h3 class="song-a">{{ battle.a.name }}</h3>
      <section class="song-a">
        <img class="song-a" v-bind:src="battle.a.img" />
        <button class="song-a play-song" @click="play(0)">
          <PlaySVG />
        </button>
      </section>
      <button class="song-a winner" @click="win(0)">Winner!</button>
      <span>VERSUS</span>
      <h3 class="song-b">{{ battle.b.name }}</h3>
      <section class="song-b">
        <img class="song-b" v-bind:src="battle.b.img" />
        <button class="song-b play-song" @click="play(1)">
          <PlaySVG />
        </button>
      </section>
      <button class="song-b winner" @click="win(1)">Winner!</button>
    </article>
    <article class="controls">
      <button
        :class="{ pause: player.is_playing, play: !player.is_playing }"
        @click="playPause()"
      >
        <PauseSVG v-if="player.is_playing" />
        <PlaySVG v-else />
      </button>
      <section class="track"><span></span></section>
      <div
        :class="{ devices: true, open: devicesOpen }"
        @click="toggleDevicesMenu($event)"
      >
        <ul>
          <li
            v-for="device in devices"
            v-bind:key="device.id"
            @click="setDevice(device.id)"
          >
            {{ device.name }}
          </li>
        </ul>
      </div>
    </article>
    <!-- <button @click="newBattle()">New Battle</button> -->
    <article class="text">
      <p>Not seeing songs you like? You can:</p>
      <section class="playlist-add">
        <button @click="addPlaylists()">Add all songs from my playlists</button>
        <span>
          Succesfully added
          <em>10</em>
          songs!
        </span>
      </section>
      <p>or search a song/album to add (not working):</p>
      <input
        @keydown="keyDown($event)"
        type="text"
        placeholder="Song/Album name"
        disabled
      />
      test
    </article>
  </main>
</template>

<script>
import PlaySVG from "./assets/PlaySVG";
import PauseSVG from "./assets/PauseSVG";

import * as track from "./track";
import * as spotify from "./spotify";
const addTrack = async (id) => {
  console.log("adding track id " + id);
  console.log(
    await (
      await fetch(
        `${window.location.protocol}//${window.location.host}/api/addtrack/` +
          id,
        {
          method: "POST",
        }
      )
    ).text()
  );
};

const addTracks = async (ids) => {
  console.log(ids);
  return await fetch(
    `${window.location.protocol}//${window.location.host}/api/addtracks/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tracks: ids }),
    }
  ).then((res) => res.json());
};

const fetchTrackDetails = async (obj) => {
  const track = await spotify.getTrack(obj.id);
  console.log(track);
  Object.assign(obj, track);
  if (track.images) obj.img = track.images[0].url;
  else obj.img = track.album.images[0].url;
};

const dom = {
  playlistAddBtn: document.querySelector(".playlist-add button"),
  playlistAddMsg: document.querySelector(".playlist-add span"),
  track: document.querySelector(".controls .track"),
  trackDot: undefined,
};
const trackCol = {
  bg: "rgba(0,0,0,0.5)",
  fg: "var(--accent)",
};

window.addEventListener("load", () => {});
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
      devices: [{ name: "Test Device 1" }, { name: "Test Device 2" }],
      player: playbackState,
      stateUpdateInt: "",
      lastUpdateAt: 0,
    };
  },
  mounted: function () {
    dom.playlistAddBtn = document.querySelector(".playlist-add button");
    dom.playlistAddMsg = document.querySelector(".playlist-add span");
    dom.track = document.querySelector(".controls .track");
    dom.trackDot = dom.track.children[0];

    track.attachListeners(
      dom.track,
      (v) => {
        this.setTrackPercent(v);
      },
      (v) => {
        if (!this.player.item) return;
        this.setTrackPercent(v);
        spotify.seekTo(Math.round(this.player.item.duration_ms * v));
      }
    );

    dom.track.style.background = `linear-gradient(90deg, ${trackCol.fg} 0%, ${
      trackCol.fg
    } ${0 * 100}%, ${trackCol.bg} ${0 * 100}%, ${trackCol.bg} 100%)`;
    this.startCheck();
    this.newBattle();
  },
  beforeUnmount: function () {
    clearInterval(this.stateUpdateInt);
  },
  methods: {
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
      console.log(this.battle);
    },
    tickTrackPercent: function (now) {
      if (!this.player.item || track.sliderData.active) return;
      const val =
        (this.player.progress_ms + (now - this.lastUpdateAt)) /
        this.player.item.duration_ms;
      this.setTrackPercent(val);
      if (this.player.is_playing)
        window.requestAnimationFrame(this.tickTrackPercent.bind(this));
    },
    setTrackPercent: function (val) {
      //background: linear-gradient(90deg, red 0%, red 78%, blue 78%, blue 100%);
      dom.track.style.background = `linear-gradient(90deg, ${trackCol.fg} 0%, ${
        trackCol.fg
      } ${val * 100}%, ${trackCol.bg} ${val * 100}%, ${trackCol.bg} 100%)`;
      dom.trackDot.style.left = `${val * 100}%`;
      // console.log(this);
    },
    doCheck: async function () {
      this.player = (await spotify.getInfo()) || {};
      this.lastUpdateAt = performance.now();
      this.tickTrackPercent(this.lastUpdateAt);
    },
    startCheck: function () {
      this.stateUpdateInt = setInterval(this.doCheck, 2000);
    },
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
    playPause: function () {
      let p;
      if (this.player.is_playing) p = spotify.pauseDevice();
      else p = spotify.playDevice();
      p.then(this.doCheck);
    },
    addPlaylists: async () => {
      document.querySelector(".playlist-add button").className = "loading";
      const uris = [];
      const playlists = (await spotify.getPlaylists()).items;
      console.log(playlists);
      for (let i = 0; i < playlists.length; i++) {
        const p = (await spotify.getPlaylist(playlists[i].id)).items;
        // console.log(pl);
        // console.log(p);
        p.forEach((track) => {
          if (track.is_local) return;
          // console.log(track);
          uris.push(track.track.uri.split(":")[2]);
        });
      }
      console.log(uris);
      let sum = 0;
      const promises = [];
      for (let i = 0; i < uris.length; i += 50) {
        promises.push(
          addTracks(uris.slice(i, i + 50)).then((json) => {
            sum += json.count;
          })
        );
      }
      Promise.all(promises).then(() => {
        document.querySelector(".playlist-add button").className = "";
        dom.playlistAddMsg.className = "active";
        dom.playlistAddMsg.children[0].innerText = sum;
        setTimeout(() => {
          dom.playlistAddMsg.className = "";
        }, 5000);
      });
    },
    keyDown: (e) => {
      if (e.keyCode != 13) return;
      addTrack(e.target.value);
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
    toggleDevicesMenu: async function (e) {
      console.log(e);
      if (e.target.className.indexOf("devices") == -1) return;
      this.devicesOpen = !this.devicesOpen;
      this.devices = (await spotify.getDevices()).devices;
    },
    setDevice: async function (id) {
      console.log(await spotify.switchDevice(id));
    },
  },
  components: {
    PlaySVG,
    PauseSVG,
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

  .controls {
    position: absolute;
    bottom: 2vh;
    left: 0;
    right: 0;
    padding: 0;
    margin: 0 5vw;

    display: grid;
    grid-template-columns: 40px auto 40px;
    gap: 10px;
    align-items: center;
    justify-items: center;

    @media only screen and (min-aspect-ratio: 11/10) {
      position: unset;
      padding: 20px 50px;
      max-width: 800px;
      margin: 10px auto;
    }
    .play,
    .pause {
      margin: 2px;
      // margin-right: 7px + 5px;
      box-sizing: border-box;
      // width: 30px;
      // height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 10px;
      svg {
        width: 100%;
        height: 100%;
        display: inline;
      }
    }

    .pause {
      padding: 11px;
    }

    .devices {
      font-family: glue1-spoticon;
      // padding: 7px;
      // margin-left: 5px;
      background: transparent;
      border-radius: 0;
      width: 40px;
      height: 40px;
      text-align: center;
      z-index: 6;
      &.open ul {
        display: inline-block;
      }
      ul {
        position: relative;
        top: 55%;
        text-align: left;
        background: var(--bg2);
        border-radius: 5px;
        font-family: spotify-circular;
        height: fit-content;
        width: max-content;
        display: none;

        list-style: none;
        margin: 0;
        padding: 5px;
        z-index: 5;

        box-shadow: rgba(0, 0, 0, 0.5) 0px 1px 5px -1px;
        li {
          padding: 8px 15px;
          margin: 2px 0;
          border-radius: 5px;
          &:hover {
            background: rgba(255, 255, 255, 0.486);
          }
          &:active {
            background: rgba(255, 255, 255, 0.2);
          }
        }

        &::before {
          // bottom: -20px;
          pointer-events: none;
          top: -20px;
          left: 20px;
          // right: 138px;
          margin-left: -10px;
          margin-right: -10px;
          border: 10px solid transparent;
          border-bottom-color: transparent;
          border-bottom-color: var(--bg2);
          position: absolute;
          content: "";
        }
      }

      &:hover::before,
      &.opends::before {
        color: var(--accent);
      }

      &::before {
        transition: color 0.1s ease-in-out;
        text-align: center;
        position: relative;
        top: 30%;
        // left: 21.5%;
        content: "";
        font-size: 16px;
      }
    }

    .track {
      width: 100%;
      height: 5px;
      background: linear-gradient(
        90deg,
        var(--accent) 0%,
        var(--accent) 0%,
        rgba(0, 0, 0, 0.5) 0%,
        rgba(0, 0, 0, 0.5) 100%
      );

      border: 10px solid var(--bg1);
      border-left: none;
      border-right: none;
      box-sizing: content-box;

      span {
        $size: 15px;
        transform: translateX(-$size/2);
        content: " ";
        background: white;
        width: $size;
        height: $size;
        display: inline-block;
        position: relative;
        top: -$size/3;

        left: 0%;

        border-radius: 50%;
      }
    }
  }

  .playlist-add {
    display: flex;
    flex-direction: column;
    width: min-content;
    align-items: center;

    button {
      min-width: fit-content;
      word-wrap: none;
      white-space: nowrap;
      text-overflow: clip;
      z-index: 1;
      &.loading {
        color: transparent;
        padding: 3px 0px;
        &::before {
          content: " ";
          width: 1em;
          height: 1em;
          display: inline-block;
          position: relative;
          top: 2px;
          left: calc(50% - 10px);
          // right: 10px;
          border-radius: 50%;
          border: 8px solid #fff;
          animation: lds-ring 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
          border-color: rgba(255, 255, 255, 0.486) transparent transparent
            transparent;
        }
      }
    }

    span {
      color: var(--fg2);
      position: relative;
      transform: translateY(-100%);
      transition: transform 0.1s ease-in-out, opacity 0.1s ease-in-out;
      opacity: 0;
      &.active {
        opacity: 1;
        transform: translateY(0%);
      }
      em {
        font-style: normal;
        font-weight: bold;
      }
    }
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

    img,
    button.play-song {
      // width: 100%;
      // height: 50%;
      grid-row: 1/2;
      grid-column: 1/2;

      @media screen and (min-aspect-ratio: 11/10) {
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

    section {
      display: grid;
      transform: scale(1);
      transition: transform 0.1s ease-in-out;
      &:active {
        transform: scale(0.95);
      }

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

    button.play-song {
      height: 100%;
      border-radius: 0;
      background-color: rgba(0, 0, 0, 0);
      transition: background-color 0.1s ease-in-out;
      display: flex;
      align-items: flex-end;
      &.song-b {
        justify-content: start;
      }
      justify-content: end;
      &:hover {
        background-color: rgba(0, 0, 0, 0.5);
        svg {
          // background: #34e071;
        }
      }

      &:active {
        background-color: rgba(0, 0, 0, 0.7);
        svg {
          background: #209e4c;
        }
      }

      svg {
        width: 15%;
        height: 15%;
        border-radius: 50%;
        padding: 5px;
        // margin: 20%;
        opacity: 1;
        background: var(--accent);
        transition: background-color 0.1s ease-in-out;
      }
    }
  }

  article.text {
    position: absolute;
    top: 100vh;
    @media screen and (min-aspect-ratio: 11/10) {
      position: unset;
    }
  }
}
</style>

<style lang="scss" src="./style/style.scss"></style>