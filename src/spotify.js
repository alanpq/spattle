/**
 * 
 * @param {string} id Track ID
 */
const getTrack = async (id) => {
  return await (await fetch(`https://api.spotify.com/v1/tracks/${id}`)).json();
}