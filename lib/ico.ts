export interface IcoImage {
  size: number;
  /** RGBA pixels, top-down, `size * size * 4` bytes. */
  rgba: Uint8ClampedArray | Uint8Array;
}

/**
 * Encode a real multi-resolution .ico. Each entry is a 32-bit BMP (BGRA,
 * bottom-up, with a 1-bit AND mask), the variant every browser, crawler and
 * operating system has understood since Windows XP. Renaming a PNG to .ico
 * mostly works in browsers and fails nearly everywhere else.
 */
export function encodeIco(images: IcoImage[]): Uint8Array {
  const HEADER = 6;
  const ENTRY = 16;
  const BMP_HEADER = 40;

  const payloads = images.map(({ size, rgba }) => {
    const maskRow = Math.ceil(size / 32) * 4;
    const bytes = new Uint8Array(BMP_HEADER + size * size * 4 + maskRow * size);
    const view = new DataView(bytes.buffer);
    view.setUint32(0, BMP_HEADER, true);
    view.setInt32(4, size, true);
    view.setInt32(8, size * 2, true); // colour rows + mask rows
    view.setUint16(12, 1, true);
    view.setUint16(14, 32, true);
    view.setUint32(20, size * size * 4 + maskRow * size, true);

    for (let y = 0; y < size; y++) {
      const source = (size - 1 - y) * size * 4;
      const target = BMP_HEADER + y * size * 4;
      const mask = BMP_HEADER + size * size * 4 + y * maskRow;
      for (let x = 0; x < size; x++) {
        const s = source + x * 4;
        const t = target + x * 4;
        bytes[t] = rgba[s + 2];
        bytes[t + 1] = rgba[s + 1];
        bytes[t + 2] = rgba[s];
        bytes[t + 3] = rgba[s + 3];
        if (rgba[s + 3] === 0) bytes[mask + (x >> 3)] |= 0x80 >> (x & 7);
      }
    }
    return bytes;
  });

  const total =
    HEADER +
    ENTRY * images.length +
    payloads.reduce((sum, payload) => sum + payload.length, 0);
  const out = new Uint8Array(total);
  const view = new DataView(out.buffer);
  view.setUint16(2, 1, true); // type: icon
  view.setUint16(4, images.length, true);

  let offset = HEADER + ENTRY * images.length;
  images.forEach(({ size }, index) => {
    const entry = HEADER + ENTRY * index;
    out[entry] = size >= 256 ? 0 : size;
    out[entry + 1] = size >= 256 ? 0 : size;
    view.setUint16(entry + 4, 1, true); // planes
    view.setUint16(entry + 6, 32, true); // bits per pixel
    view.setUint32(entry + 8, payloads[index].length, true);
    view.setUint32(entry + 12, offset, true);
    out.set(payloads[index], offset);
    offset += payloads[index].length;
  });
  return out;
}
