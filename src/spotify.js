/**
 * 
 * @param {string} url URL to fetch
 * @param {RequestInit} options Request options 
 */
export const authedFetch = (url, options = {}) => {
  if (!options.headers)
    options.headers = {}
  options.headers["Authorization"] = `Bearer ${localStorage.getItem("access_token")}`
  return fetch(url, options).then(res => {
    if (res.status == 204)
      return {}
    return res.json()
  }).then((json) => {
    // console.log(json)
    if (json.error) {
      if (json.error.status == 401 && json.error.message == "The access token expired") {
        // console.log('time to refresh')
        // alert("spotify token expired (this popup is temporary)")
        // window.location = "/";
      }
      throw new Error(JSON.stringify(json.error));
    }
    return json;
  })
}

/**
 * 
 * @param {string} id Track ID
 * @returns {object}
 */
export const getTrack = async (id) => {
  return await authedFetch(`https://api.spotify.com/v1/tracks/${id}`);
}

export const getPlaylists = async (limit = 50, offset = 0) => {
  return await authedFetch(`https://api.spotify.com/v1/me/playlists?limit=${limit}&offset=${offset}`);
}

export const getPlaylist = async (id) => {
  return await authedFetch(`https://api.spotify.com/v1/playlists/${id}/tracks`);
}

export const getAlbums = async (ids) => {
  return await authedFetch(`https://api.spotify.com/v1/albums/${ids.join(',')}`);
}

export const getDevices = async () => {
  return await authedFetch(`https://api.spotify.com/v1/me/player/devices`);
}

export const switchDevice = async (id, play = false) => {
  return await authedFetch('https://api.spotify.com/v1/me/player', {
    method: "PUT",
    body: JSON.stringify({
      device_ids: [id],
      play,
    })
  })
}


export const playDevice = async (ctx_uri = undefined, uris = undefined, offset = undefined, position_ms = undefined) => {
  return await authedFetch('https://api.spotify.com/v1/me/player/play', {
    method: "PUT",
    body: JSON.stringify({
      context_uri: ctx_uri,
      uris,
      offset,
      position_ms,
    })
  })
}
export const pauseDevice = async () => {
  return await authedFetch('https://api.spotify.com/v1/me/player/pause', {
    method: "PUT",
  })
}

export const seekTo = async (position_ms) => {
  return await authedFetch('https://api.spotify.com/v1/me/player/seek?position_ms=' + position_ms, {
    method: "PUT",
  })
}

export const getInfo = async () => {
  return await authedFetch('https://api.spotify.com/v1/me/player');
}