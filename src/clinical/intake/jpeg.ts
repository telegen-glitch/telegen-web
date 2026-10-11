/**
 * Removes metadata from a JPEG: EXIF (location, device, time), XMP, ICC and
 * comments, keeping only what is needed to show the image. The browser already
 * re-encodes photos through a canvas; this is the server-side guarantee.
 */
export function stripJpegMetadata(input: Uint8Array): Uint8Array {
  const n = input.length;
  if (n < 4 || input[0] !== 0xff || input[1] !== 0xd8) throw new Error("not a JPEG");
  const parts: Uint8Array[] = [input.subarray(0, 2)];
  let i = 2;
  while (i < n) {
    if (input[i] !== 0xff) throw new Error("corrupt JPEG");
    let marker = input[i + 1];
    while (marker === 0xff && i + 2 < n) marker = input[++i + 1];
    if (marker === 0xd9) {
      parts.push(input.subarray(i, i + 2));
      break;
    }
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      parts.push(input.subarray(i, i + 2));
      i += 2;
      continue;
    }
    if (i + 4 > n) throw new Error("corrupt JPEG");
    const end = i + 2 + ((input[i + 2] << 8) | input[i + 3]);
    if (end > n) throw new Error("corrupt JPEG");
    // Start of scan: the compressed image follows to the end of the file.
    if (marker === 0xda) {
      parts.push(input.subarray(i));
      break;
    }
    const metadata = (marker >= 0xe1 && marker <= 0xef) || marker === 0xfe;
    if (!metadata) parts.push(input.subarray(i, end));
    i = end;
  }
  const out = new Uint8Array(parts.reduce((s, p) => s + p.length, 0));
  let o = 0;
  for (const p of parts) {
    out.set(p, o);
    o += p.length;
  }
  return out;
}
