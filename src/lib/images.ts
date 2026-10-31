export const MAX_FILE_BYTES = 12 * 1024 * 1024;
export const MAX_PIXELS = 40_000_000;
const MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export function validateFile(file: File): void {
  if (!MIME_TYPES.includes(file.type)) throw new Error('Choose a JPEG, PNG or WebP photograph.');
  if (file.size === 0) throw new Error('This file is empty. Please choose another photo.');
  if (file.size > MAX_FILE_BYTES) throw new Error('Your photo is too large. Choose a file under 12 MB.');
}
export function validateDimensions(width: number, height: number): void {
  if (!Number.isSafeInteger(width) || !Number.isSafeInteger(height) || width <= 0 || height <= 0 || width * height > MAX_PIXELS || Math.max(width, height) > 16384) throw new Error('Choose a photo under 40 megapixels and 16,384 pixels per side.');
  if (Math.min(width, height) < 200) throw new Error('For a sharp poster, choose a photo at least 200 pixels on each side.');
}
export async function loadPhoto(file: File): Promise<HTMLImageElement> {
  validateFile(file);
  // Check content as well as declared MIME type; SVG/HTML are never accepted.
  const bytes = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  const isPNG = bytes[0] === 137 && bytes[1] === 80 && bytes[2] === 78 && bytes[3] === 71 && bytes[4] === 13 && bytes[5] === 10 && bytes[6] === 26 && bytes[7] === 10;
  const isJPEG = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  const isWebP = String.fromCharCode(...bytes.slice(0,4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8,12)) === 'WEBP';
  if (!(file.type === 'image/png' && isPNG || file.type === 'image/jpeg' && isJPEG || file.type === 'image/webp' && isWebP)) throw new Error('This file does not contain a valid JPEG, PNG or WebP photo.');
  const url = URL.createObjectURL(file);
  try {
    const photo = new Image();
    photo.src = url;
    await photo.decode();
    validateDimensions(photo.naturalWidth, photo.naturalHeight);
    // Normalize orientation through browser decoding. Keep only pixels in memory,
    // discard metadata, and release the original object URL immediately.
    const canvas = document.createElement('canvas');
    const scale = Math.min(1, 2400 / Math.max(photo.naturalWidth, photo.naturalHeight));
    canvas.width = Math.round(photo.naturalWidth * scale);
    canvas.height = Math.round(photo.naturalHeight * scale);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Your browser could not prepare the photo.');
    ctx.drawImage(photo, 0, 0, canvas.width, canvas.height);
    const normalized = new Image();
    normalized.src = canvas.toDataURL('image/png');
    await normalized.decode();
    return normalized;
  } catch (error) {
    if (error instanceof Error && /Choose|sharp|browser/.test(error.message)) throw error;
    throw new Error('We could not open this photo. Try another JPEG, PNG or WebP.');
  } finally { URL.revokeObjectURL(url); }
}
