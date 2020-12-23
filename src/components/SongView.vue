<template>
  <section :class="$data._class">
    <img :class="$data._class" v-bind:src="bong.img" />
    <button :class="$data._class" class="play-song" @click="$emit('onClick')">
      <PlaySVG />
    </button>
  </section>
</template>

<script>
import PlaySVG from "../assets/PlaySVG";

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
  components: {
    PlaySVG,
  },
};
</script>

<style lang="scss">
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

button.play-song {
  height: 100%;
  border-radius: 0;
  background-color: rgba(0, 0, 0, 0);
  transition: background-color 0.1s ease-in-out;
  display: flex;
  align-items: flex-end;
  z-index: 10;
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
</style>