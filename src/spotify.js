/**
 * 
 * @param {string} url URL to fetch
 * @param {RequestInit} options Request options 
 */
const authedFetch = (url, options = {}) => {
  if (!options.headers)
    options.headers = {}
  options.headers["Authorization"] = `Bearer ${localStorage.getItem("access_token")}`
  return fetch(url, options)
}

/**
 * 
 * @param {string} id Track ID
 */
export const getTrack = async (id) => {
  return await (await fetch(`https://api.spotify.com/v1/tracks/${id}`)).json();
}

export const getPlaylists = async (limit = 50, offset = 0) => {
  return await (await authedFetch(`https://api.spotify.com/v1/me/playlists?limit=${limit}&offset=${offset}`)).json();
}