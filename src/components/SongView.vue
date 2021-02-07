<template>
  <section class="song" :class="$data._class">
    <img :class="$data._class" v-bind:src="bong.img" />
    <!-- TODO: give feedback when playing with no active device -->
    <button :class="$data._class" class="play-song" @click="$emit('onClick')">
      <PlaySVG />
    </button>
    <button :class="$data._class" class="win-song" @click="$emit('win')">
      <CrownSVG />
    </button>
    <button :class="$data._class" class="extern-link" @click="openExtern()">
      <SpotifySVG />
    </button>
  </section>
</template>

<script>
import PlaySVG from "../assets/PlaySVG";
import CrownSVG from "../assets/CrownSVG";
import SpotifySVG from "../assets/SpotifySVG";

export default {
  name: "SongView",
  data: function () {
    return {
      _class: this.customClass,
      bong: this.song,
    };
  },
  props: {
    customClass: String,
    song: Object,
    onClick: Function,
  },
  methods: {
    openExtern: function() {
      // let win = window.open(this.song.external_urls.spotify + '?go=1&play=1&nd=1', 'spattle_extern');
      window.location = this.song.uri;
      // setTimeout(function () {
      //   win = window.open(this.song.uri, 'spattle_extern');
      // }, 500);

    }
  },
  components: {
    PlaySVG,
    SpotifySVG,
    CrownSVG,
  },
};
</script>

<style lang="scss">
section.song {
  display: grid;
  transform: scale(1);
  transition: transform 0.1s ease-in-out;
  grid-template-rows: 100% min-content;

  overflow: hidden;

  &:active {
    transform: scale(0.95);
  }
  // &:hover img {
  //   filter: blur(2px);
  // }

  &.song-a {
    grid-area: IMGA;
  }

  &.song-b {
    grid-area: IMGB;
  }

  // img {
  //   transition: filter 0.1s ease-in-out;
  //   filter: blur(0px);
  // }

  img,
  button {
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

  button {
    $size: 20%;
    $winSize: 25%;
    $pad: 5px;
    background: var(--accent);
    box-shadow: 0px 0px 10px -3px black;
    transition: background-color 0.1s ease-in-out;
    display: flex;
    align-items: flex-end;
    z-index: 10;

    margin-top: auto;
    margin-bottom: $pad;

    border-radius: 50%;
    width: $size;
    height: $size;
    padding: 0;

    svg {
      // margin: 20%;
      padding: 5px;
      opacity: 1;
      transition: background-color 0.1s ease-in-out;
      height: 100%;
      width: 100%;
    }

    &:hover {
      background-color: var(--accentLight);
      svg {
        // background: #34e071;
      }
    }

    &:active {
      background-color: var(--accentDark);
      svg {
        // background: #209e4c;
      }
    }

    &.song-b {
      justify-content: end;
    }
    justify-content: start;

    
    &.win-song {
      margin-left: auto;
      margin-right: auto;
      
      width: $winSize;
      height: $winSize;

      svg {
        transform: scale(0.6);
      }

      background: #f7c42d;
      &:hover {
        background-color: #ffd452;
        svg {
          // background: #34e071;
        }
      }

      &:active {
        background-color: #dfaf22;
        svg {
          // background: white;
        }
      }
    }
    &.extern-link {
      //margin-left: auto;
      margin-right: auto;
      margin-left: $pad;
      &.song-b {
        margin-left: auto;
        margin-right: $pad;
      }
    }
    &.play-song {
      background: transparent;
      height: 100%;
      width: 100%;
      border-radius: 0;
      box-shadow: none;

      padding: $pad;

      &.song-b {
        justify-content: start;
      }
      justify-content: end;
      svg {
        width: $size;
        height: $size;
        background: var(--accent);
        border-radius: 50%;
        box-shadow: 0px 0px 10px -3px black;
        &:hover {
          background-color: var(--accentLight);
        }

        &:active {
          background-color: var(--accentDark);
        }
      }
    }
  }
}
</style>