import { get } from "http";

export const sliderData = {
  active: false,
}

/**
 *  @param {Element} track Track DOM
 */
export const attachListeners = (track, setTrackCB, pushTrackCB) => {
  const getRelativePos = (x) => {
    const rect = track.getBoundingClientRect();
    return Math.min(1, Math.max(0, (x - rect.left) / track.getBoundingClientRect().width))
  }

  track.addEventListener("mousedown", (e) => {
    sliderData.active = true;
    if (e.target.nodeName === "SPAN") {
      const rect = e.target.getBoundingClientRect();
      setTrackCB(getRelativePos(rect.left + rect.width / 2));
    } else {
      setTrackCB(getRelativePos(e.clientX));
    }
  })
  document.addEventListener("mousemove", (e) => {
    if (!sliderData.active) return;
    setTrackCB(getRelativePos(e.clientX))
    e.preventDefault(true);
  })
  document.addEventListener("mouseup", (e) => {
    if (!sliderData.active) return;
    sliderData.active = false;
    pushTrackCB(getRelativePos(e.clientX));
  })
}