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
    <p>or search a song/album to add (not working):</p>
    <input
      @keydown="keyDown($event)"
      type="text"
      placeholder="Song/Album name"
      disabled
    />
    test
  </article>
</template>

<script>
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
export default {
  props: {},
  data: function () {
    return {
      playlistAddBtn: null,
      playlistAddMsg: null,
    };
  },
  mounted: function () {
    this.playlistAddMsg = document.querySelector(".playlist-add span");
    this.playlistAddBtn = document.querySelector(".playlist-add button");
  },
  methods: {
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
        this.playlistAddBtn.className = "";
        this.playlistAddMsg.className = "active";
        this.playlistAddMsg.children[0].innerText = sum;
        setTimeout(() => {
          this.playlistAddMsg.className = "";
        }, 5000);
      });
    },
    keyDown: (e) => {
      if (e.keyCode != 13) return;
      addTrack(e.target.value);
    },
  },
};
</script>

<style lang="scss">
</style>