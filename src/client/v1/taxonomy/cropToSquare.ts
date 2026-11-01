/**
 * Gives the texture repeat and offset that show the centered square of an image, as CSS's `object-fit: cover` would.
 * Each pair is in texture coordinates, which run from 0 to 1 across the image.
 */
export function cropToSquare(width: number, height: number) {
  const aspect = width / height;
  if (aspect >= 1) return { repeat: [1 / aspect, 1], offset: [(1 - 1 / aspect) / 2, 0] };
  return { repeat: [1, aspect], offset: [0, (1 - aspect) / 2] };
}
