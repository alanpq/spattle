<template>
  <li>
    <img
      v-bind:src="
        result.details.images
          ? result.details.images.slice(-1)[0].url
          : result.details.album.images.slice(-1)[0].url
      "
    />
    <h3 v-bind:aria-label="result.name">{{ result.name }}</h3>
    <h4>
      {{
        result.artists
          .reduce((acc, artist) => {
            return `${acc}, ${artist.name}`;
          }, "")
          .slice(2)
      }}
    </h4>
    <button
      class="play"
      @click="
        play(
          result.type == 'track'
            ? [result.uri]
            : result.details.tracks.items.map((e) => e.uri)
        )
      "
    >
      <PlaySVG />
    </button>

    <button class="add" @click="addTrack()">+</button>
  </li>
</template>

<style lang="scss">
ul.result {
  list-style: none;
  margin: 0;
  padding: 5px;

  background: var(--bg3);

  height: 40vh;
  overflow: hidden scroll;

  display: flex;
  flex-direction: column;

  li {
    $size: 64px;
    display: grid;
    width: 100%;
    height: $size;
    grid-template-columns: $size auto $size - 20px $size - 25px;
    grid-template-rows: 1.3em auto;
    grid-template-areas:
      "img title play add"
      "img artists play add";

    justify-content: stretch;
    align-items: flex-start;

    margin-bottom: 5px;

    &:hover {
      background: var(--bg2);
    }

    img {
      grid-area: img;
    }

    h3 {
      grid-area: title;
      margin: 0 0 0 5px;
      overflow: hidden;
    }

    h4 {
      grid-area: artists;
      margin: 0 0 0 5px;
      font-weight: normal;
      overflow: hidden;
    }

    h3,
    h4 {
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    button {
      justify-self: center;
      align-self: center;
      text-align: center;
      padding: 0;
      width: $size - 30px;
      height: $size - 30px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-content: center;
      align-items: center;
      &.play {
        grid-area: play;
      }

      &.add {
        grid-area: add;
        font-size: $size - 30px;
        padding-bottom: 2.5px;
        // vertical-align: middle;
      }
    }
  }
}
</style>

<script>
import PlaySVG from "../assets/PlaySVG";
import * as spotify from "../spotify";
export default {
  props: {
    result: Object,
  },
  components: {
    PlaySVG,
  },
  emits: ["add-track"],
  methods: {
    play: (uris) => {
      spotify.playDevice(undefined, uris);
    },
    addTrack: function () {
      this.$emit("add-track");
    },
  },
};
</script>