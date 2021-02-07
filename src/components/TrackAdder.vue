<template>
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
    <p>or search a song/album to add:</p>
    <input
      @keydown="keyDown($event)"
      type="text"
      placeholder="Song/Album name"
    />
    <section class="results" v-if="(search.tracks != undefined || search.albums != undefined)">
      <h2 class="track">Tracks</h2>
      <ul class="track result" v-if="search.tracks != undefined">
        <SearchResult
          v-for="result in search.tracks.items"
          v-bind:key="result.id"
          v-bind:result="result"
          @add-track="addTrack(result.id)"
        />
      </ul>
      <h2 class="album">Albums</h2>
      <ul class="album result" v-if="search.albums != undefined">
        <SearchResult
          v-for="result in search.albums.items"
          v-bind:key="result.id"
          v-bind:result="result"
          @add-track="addTracks(result.details.tracks.items.map((e) => e.id))"
        />
      </ul>
    </section>
  </article>
</template>

<style lang="scss">
.playlist-add {
    display: flex;
    flex-direction: column;
    width: min-content;
    align-items: center;

    width: 100%;

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

section.results {
  margin: auto;
  margin-top: 25px;
  margin-bottom: 50px;
  display: grid;
  gap: 20px;
  grid-template-rows: min-content auto min-content auto;
  grid-template-areas:
    "trackTitle"
    "tracks"
    "albumTitle"
    "albums";

  @media only screen and (min-aspect-ratio: 11/10) {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: min-content auto;
    grid-template-areas:
      "trackTitle albumTitle"
      "tracks albums";
  }

  h2 {
    align-self: center;
    justify-self: center;
    margin: 0;
    &.track {
      grid-area: trackTitle;
    }
    &.album {
      grid-area: albumTitle;
    }
  }
}
</style>

<script>
import SearchResult from "./SearchResult";

import * as spotify from "../spotify";

export default {
  props: {},
  data: function () {
    return {
      playlistAddBtn: null,
      playlistAddMsg: null,
      search: { tracks: undefined, albums: undefined },
      searchBouncer: -1,
    };
  },
  components: {
    SearchResult,
  },
  mounted: function () {
    this.playlistAddMsg = document.querySelector(".playlist-add span");
    this.playlistAddBtn = document.querySelector(".playlist-add button");
  },
  methods: {
    addTrack: async (id) => {
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
    },
    addTracks: async (ids) => {
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
    },
    addPlaylists: async function () {
      this.playlistAddBtn.className = "loading";
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
          this.addTracks(uris.slice(i, i + 50)).then((json) => {
            sum += json.count;
          })
        );
      }
      const finish = () => {
        this.playlistAddBtn.className = "";
        this.playlistAddMsg.className = "active";
        this.playlistAddMsg.children[0].innerText = sum;
        setTimeout(() => {
          this.playlistAddMsg.className = "";
        }, 5000);
      }
      Promise.all(promises).then(finish).catch(finish); // FIXME: add a timeout maybe
    },
    searchDebounce: async function (q) {
      const result = await spotify.search(q);
      let a = spotify
        .getTracks(result.tracks.items.map((t) => t.id))
        .then((res) =>
          res.tracks.forEach((el, i) => (result.tracks.items[i].details = el))
        );
      let b = spotify
        .getAlbums(result.albums.items.map((t) => t.id))
        .then((res) =>
          res.albums.forEach((el, i) => (result.albums.items[i].details = el))
        );
      await Promise.all([a, b]);
      this.search = result;
    },
    keyDown: function (e) {
      // if (e.keyCode != 13) return;
      clearTimeout(this.searchBouncer);
      this.searchBouncer = setTimeout(this.searchDebounce, 300, e.target.value);
    },
  },
};
</script>
