/**
 * Keeps the page's text from being selected until the pointer is released,
 * so that dragging out of a scene to turn or move its camera does not select the text around it.
 */
export function suppressSelectionUntilRelease() {
  const preventSelection = (event: Event) => event.preventDefault();
  const release = () => {
    document.removeEventListener("selectstart", preventSelection);
    window.removeEventListener("pointerup", release);
    window.removeEventListener("pointercancel", release);
  };
  document.getSelection()?.removeAllRanges();
  document.addEventListener("selectstart", preventSelection);
  window.addEventListener("pointerup", release);
  window.addEventListener("pointercancel", release);
}
