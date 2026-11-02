/** The gap between a button and the menu it opens, in pixels. */
const gap = 4;

/**
 * Places a menu below the button that opens it, right-aligned with the button, in coordinates of the whole page.
 * The page's width is that of its root element, which excludes any scrollbar.
 */
export function placeMenuBelow(
  button: { bottom: number; right: number },
  scroll: { x: number; y: number },
  pageWidth: number,
) {
  return { top: button.bottom + scroll.y + gap, right: pageWidth - button.right - scroll.x };
}
