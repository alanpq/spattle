/**
 * 
 * @param {string} code The code/refresh token 
 * @param {"refresh_token" | "authorization_code"} type Whether this is a refresh token or regular code
 */
export const getToken = async (code, type = "authorization_code") => {
  const formData = new FormData();
  formData.append("client_id", "3a25adc518944ba0b50c6a1376ab6a8a") // TODO: fetch client id from server
  formData.append("grant_type", type)
  if (type == "authorization_code") {
    formData.append("code", code)
    formData.append("redirect_uri", window.location.protocol + "//" + window.location.host)
    console.log("verifier:", localStorage.getItem("verifier"))
    formData.append("code_verifier", localStorage.getItem("verifier"))
  } else if (type == "refresh_token") {
    formData.append("grant_type", "refresh_token")
    formData.append("refresh_token", code)
  }
  const res = await (fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams(formData).toString(),
  }).then(res => res.json()))
  console.log(res);
  localStorage.setItem("access_token", res.access_token)
  localStorage.setItem("acquired_at", Date.now())
  localStorage.setItem("expires_in", res.expires_in * 1000)
  localStorage.setItem("refresh_token", res.refresh_token)
}


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
      if (json.error.status == 401 && json.error.message == "Invalid access token") {
        // something went wrong with access token, wipe it down
        localStorage.setItem("access_token", undefined)
        localStorage.setItem("acquired_at", undefined)
        localStorage.setItem("expires_in", undefined)
        localStorage.setItem("refresh_token", undefined)
        window.location = '/'
      }
      if (json.error.status == 401 && json.error.message == "The access token expired") {
        console.log('time to refresh')
        getToken(localStorage.getItem("refresh_token"), "refresh_token");
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