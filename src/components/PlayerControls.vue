<template>
  <article class="controls">
    <button
      :class="{
        pause: $data._player.is_playing,
        play: !$data._player.is_playing,
      }"
      @click="playPause()"
    >
      <PauseSVG v-if="$data._player.is_playing" />
      <PlaySVG v-else />
    </button>
    <section class="track"><span></span></section>
    <!-- TODO: auto refresh devices -->
    <div :class="{ devices: true, open }" @click="toggleDevicesMenu($event)">
      <ul>
        <li
          v-for="device in $data._devices"
          v-bind:key="device.id"
          @click="setDevice(device.id)"
        >
          {{ device.name }}
        </li>
      </ul>
    </div>
  </article>
</template>

<script>
import PlaySVG from "../assets/PlaySVG";
import PauseSVG from "../assets/PauseSVG";

import * as track from "../track";
import * as spotify from "../spotify";

const trackCol = {
  bg: "rgba(0,0,0,0.5)",
  fg: "var(--accent)",
};

export default {
  name: "PlayerControls",
  data: function () {
    return {
      _player: this.player,
      _devices: this.devices,
      open: false,
      track: null,
      trackDot: null,
    };
  },
  mounted: function () {
    this.track = document.querySelector(".controls .track");
    this.trackDot = this.track.children[0];

    track.attachListeners(
      this.track,
      (v) => {
        this.setTrackPercent(v);
      },
      (v) => {
        if (!this.player.item) return;
        this.setTrackPercent(v);
        spotify.seekTo(Math.round(this.player.item.duration_ms * v));
      }
    );

    this.track.style.background = `linear-gradient(90deg, ${trackCol.fg} 0%, ${
      trackCol.fg
    } ${0 * 100}%, ${trackCol.bg} ${0 * 100}%, ${trackCol.bg} 100%)`;
  },
  methods: {
    playPause: function () {
      let p;
      if (this.player.is_playing) p = spotify.pauseDevice();
      else p = spotify.playDevice();
      p.then(this.doCheck);
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
      this.track.style.background = `linear-gradient(90deg, ${
        trackCol.fg
      } 0%, ${trackCol.fg} ${val * 100}%, ${trackCol.bg} ${val * 100}%, ${
        trackCol.bg
      } 100%)`;
      this.trackDot.style.left = `${val * 100}%`;
      // console.log(this);
    },

    setDevice: async function (id) {
      console.log(await spotify.switchDevice(id));
    },
    toggleDevicesMenu: async function (e) {
      console.log(e);
      if (e.target.className.indexOf("devices") == -1) return;
      this.devicesOpen = !this.devicesOpen;
      this.devices = (await spotify.getDevices()).devices;
    },
  },
  props: {
    player: Object,
    devices: Array,
  },
  components: {
    PlaySVG,
    PauseSVG,
  },
};
</script>

<style lang="scss">
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
</style>