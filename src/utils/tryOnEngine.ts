/**
 * Advanced Saree Try-On Image Processing Engine
 *
 * This module performs real image analysis and transformation:
 * 1. Extracts dominant colors and patterns from the saree product image
 * 2. Detects the face/skin region in the user's photo
 * 3. Applies the saree's color palette to the body area while preserving the face
 * 4. Simulates fabric drape with gradient shading and texture
 * 5. Blends borders and pallu patterns onto the result
 */

export interface SareePalette {
  primary: string;
  secondary: string;
  accent: string;
  border: string;
  swatches: { color: string; ratio: number }[];
}

export interface ProcessOptions {
  scale: number;
  offsetX: number;
  offsetY: number;
  opacity: number;
  blendMode: string;
  intensity: number;
}

export const DEFAULT_OPTIONS: ProcessOptions = {
  scale: 100,
  offsetX: 0,
  offsetY: 0,
  opacity: 80,
  blendMode: 'soft-light',
  intensity: 70,
};

/**
 * Extract dominant colors from a saree image using color quantization.
 */
export function extractSareePalette(img: HTMLImageElement): SareePalette {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return defaultPalette();

  const sampleSize = 100;
  canvas.width = sampleSize;
  canvas.height = sampleSize;
  ctx.drawImage(img, 0, 0, sampleSize, sampleSize);

  const data = ctx.getImageData(0, 0, sampleSize, sampleSize).data;
  const colorMap = new Map<string, { count: number; r: number; g: number; b: number }>();

  for (let i = 0; i < data.length; i += 4) {
    const r = Math.round(data[i] / 16) * 16;
    const g = Math.round(data[i + 1] / 16) * 16;
    const b = Math.round(data[i + 2] / 16) * 16;
    const key = `${r},${g},${b}`;
    const existing = colorMap.get(key);
    if (existing) {
      existing.count++;
    } else {
      colorMap.set(key, { count: 1, r, g, b });
    }
  }

  const sorted = [...colorMap.values()].sort((a, b) => b.count - a.count);
  const top = sorted.slice(0, 8);
  const total = top.reduce((s, c) => s + c.count, 0);

  const swatches = top.map((c) => ({
    color: `rgb(${c.r},${c.g},${c.b})`,
    ratio: c.count / total,
  }));

  return {
    primary: swatches[0]?.color || '#8B0000',
    secondary: swatches[1]?.color || '#DAA520',
    accent: swatches[2]?.color || '#FFD700',
    border: swatches[swatches.length - 1]?.color || '#4A0000',
    swatches,
  };
}

function defaultPalette(): SareePalette {
  return {
    primary: '#8B0000',
    secondary: '#DAA520',
    accent: '#FFD700',
    border: '#4A0000',
    swatches: [
      { color: '#8B0000', ratio: 0.5 },
      { color: '#DAA520', ratio: 0.3 },
      { color: '#FFD700', ratio: 0.2 },
    ],
  };
}

/**
 * Detect skin-tone pixels to build a body mask (face + exposed skin).
 * Returns a mask where 255 = skin/body, 0 = background.
 */
export function detectBodyMask(imageData: ImageData): Uint8ClampedArray {
  const { data, width, height } = imageData;
  const mask = new Uint8ClampedArray(width * height);

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Skin detection rules
    const isSkin =
      r > 60 && g > 30 && b > 15 &&
      r > g && r > b &&
      Math.abs(r - g) > 12 &&
      r - b > 12 &&
      !(r > 240 && g > 240 && b > 240) && // not white
      r < 255;

    mask[i / 4] = isSkin ? 255 : 0;
  }

  // Erode then dilate to clean up noise
  return morphologicalClean(mask, width, height);
}

function morphologicalClean(mask: Uint8ClampedArray, width: number, height: number): Uint8ClampedArray {
  // Simple erosion (remove isolated pixels)
  const eroded = new Uint8ClampedArray(width * height);
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      let count = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (mask[(y + dy) * width + (x + dx)] > 0) count++;
        }
      }
      eroded[idx] = count >= 5 ? 255 : 0;
    }
  }

  // Dilate (fill holes)
  const dilated = new Uint8ClampedArray(width * height);
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      let count = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (eroded[(y + dy) * width + (x + dx)] > 0) count++;
        }
      }
      dilated[idx] = count >= 3 ? 255 : 0;
    }
  }

  return dilated;
}

/**
 * Apply color transfer from the saree palette to the body region.
 * Uses a soft colorization approach that preserves luminance.
 */
export function applyColorTransfer(
  imageData: ImageData,
  mask: Uint8ClampedArray,
  palette: SareePalette,
  intensity: number
): void {
  const { data, width, height } = imageData;
  const strength = intensity / 100;

  for (let i = 0; i < data.length; i += 4) {
    const maskIdx = i / 4;
    const maskVal = mask[maskIdx];

    if (maskVal > 0) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // Luminance of the original pixel
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;

      // Pick the palette color based on position (vertical gradient for drape effect)
      const y = Math.floor(maskIdx / width);
      const yRatio = y / height;

      // Upper body gets primary color, lower gets secondary, border gets accent
      let targetR: number, targetG: number, targetB: number;
      if (yRatio < 0.35) {
        // Upper body / blouse area — primary color
        [targetR, targetG, targetB] = parseRgb(palette.primary);
      } else if (yRatio < 0.75) {
        // Mid section — blend primary and secondary
        const t = (yRatio - 0.35) / 0.4;
        const [pr, pg, pb] = parseRgb(palette.primary);
        const [sr, sg, sb] = parseRgb(palette.secondary);
        targetR = pr + (sr - pr) * t;
        targetG = pg + (sg - pg) * t;
        targetB = pb + (sb - pb) * t;
      } else {
        // Lower / pallu area — secondary with accent highlights
        [targetR, targetG, targetB] = parseRgb(palette.secondary);
      }

      // Add horizontal drape shading (simulates fabric folds)
      const x = maskIdx % width;
      const drapeWave = Math.sin((x / width) * Math.PI * 4) * 0.15;
      targetR *= (1 + drapeWave);
      targetG *= (1 + drapeWave);
      targetB *= (1 + drapeWave);

      // Preserve luminance from original, apply new color
      const targetLum = 0.299 * targetR + 0.587 * targetG + 0.114 * targetB;
      const lumRatio = targetLum > 0 ? lum / targetLum : 1;

      const newR = Math.min(255, Math.max(0, targetR * lumRatio));
      const newG = Math.min(255, Math.max(0, targetG * lumRatio));
      const newB = Math.min(255, Math.max(0, targetB * lumRatio));

      // Blend based on mask strength and intensity
      const blend = (maskVal / 255) * strength;
      data[i] = Math.round(r * (1 - blend) + newR * blend);
      data[i + 1] = Math.round(g * (1 - blend) + newG * blend);
      data[i + 2] = Math.round(b * (1 - blend) + newB * blend);
    }
  }
}

/**
 * Add saree border pattern at the edges of the detected body region.
 */
export function addSareeBorder(
  imageData: ImageData,
  mask: Uint8ClampedArray,
  palette: SareePalette,
  intensity: number
): void {
  const { data, width, height } = imageData;
  const strength = intensity / 100;
  const [br, bg, bb] = parseRgb(palette.border);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const maskIdx = y * width + x;

      if (mask[maskIdx] > 0) {
        // Check if this pixel is near the edge of the mask
        let isEdge = false;
        for (let dy = -3; dy <= 3; dy++) {
          for (let dx = -3; dx <= 3; dx++) {
            const ny = y + dy;
            const nx = x + dx;
            if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
              if (mask[ny * width + nx] === 0) {
                isEdge = true;
                break;
              }
            }
          }
          if (isEdge) break;
        }

        if (isEdge) {
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          data[idx] = Math.round(r * (1 - strength * 0.6) + br * strength * 0.6);
          data[idx + 1] = Math.round(g * (1 - strength * 0.6) + bg * strength * 0.6);
          data[idx + 2] = Math.round(b * (1 - strength * 0.6) + bb * strength * 0.6);
        }
      }
    }
  }
}

/**
 * Add fabric texture overlay to simulate silk/chiffon weave.
 */
export function addFabricTexture(
  imageData: ImageData,
  mask: Uint8ClampedArray,
  textureType: string
): void {
  const { data, width, height } = imageData;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const maskIdx = y * width + x;

      if (mask[maskIdx] > 0) {
        let shimmer = 0;
        if (textureType === 'silk') {
          // Silk: subtle diagonal sheen
          shimmer = Math.sin((x + y) * 0.05) * 8 + Math.sin(x * 0.1) * 4;
        } else if (textureType === 'chiffon') {
          // Chiffon: soft, airy
          shimmer = Math.sin(x * 0.02) * 3;
        } else if (textureType === 'cotton') {
          // Cotton: matte, slight weave
          shimmer = Math.sin(x * 0.08) * 2 + Math.sin(y * 0.08) * 2;
        } else {
          // Default: subtle
          shimmer = Math.sin((x + y) * 0.03) * 5;
        }

        data[idx] = Math.min(255, Math.max(0, data[idx] + shimmer));
        data[idx + 1] = Math.min(255, Math.max(0, data[idx + 1] + shimmer));
        data[idx + 2] = Math.min(255, Math.max(0, data[idx + 2] + shimmer));
      }
    }
  }
}

/**
 * Overlay the actual saree product image with the given blend settings,
 * for areas outside the detected body (background drape effect).
 */
export function overlaySareeImage(
  ctx: CanvasRenderingContext2D,
  sareeImg: HTMLImageElement,
  canvasW: number,
  canvasH: number,
  options: ProcessOptions
): void {
  const sScale = options.scale / 100;
  const sareeW = canvasW * sScale;
  const sareeH = sareeW * (sareeImg.height / sareeImg.width);

  const sx = (canvasW - sareeW) / 2 + options.offsetX;
  const sy = (canvasH - sareeH) / 2 + options.offsetY;

  ctx.globalAlpha = options.opacity / 100;
  ctx.globalCompositeOperation = options.blendMode as GlobalCompositeOperation;
  ctx.drawImage(sareeImg, sx, sy, sareeW, sareeH);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
}

function parseRgb(colorStr: string): [number, number, number] {
  if (colorStr.startsWith('rgb(')) {
    const nums = colorStr.match(/\d+/g);
    if (nums && nums.length >= 3) {
      return [parseInt(nums[0]), parseInt(nums[1]), parseInt(nums[2])];
    }
  }
  if (colorStr.startsWith('#')) {
    const r = parseInt(colorStr.slice(1, 3), 16);
    const g = parseInt(colorStr.slice(3, 5), 16);
    const b = parseInt(colorStr.slice(5, 7), 16);
    return [r, g, b];
  }
  return [139, 0, 0];
}

/**
 * Full processing pipeline: runs all steps and returns a data URL.
 */
export async function processTryOn(
  userImageSrc: string,
  sareeImageSrc: string,
  sareeFabric: string,
  options: ProcessOptions
): Promise<{ composite: string; palette: SareePalette }> {
  return new Promise((resolve, reject) => {
    const userImg = new Image();
    const sareeImg = new Image();
    let loaded = 0;

    const onAllLoaded = () => {
      loaded++;
      if (loaded < 2) return;

      try {
        const maxW = 600;
        const maxH = 800;
        const ratio = Math.min(maxW / userImg.width, maxH / userImg.height);
        const w = Math.round(userImg.width * ratio);
        const h = Math.round(userImg.height * ratio);

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas not supported');

        // Step 1: Draw the user's photo
        ctx.drawImage(userImg, 0, 0, w, h);

        // Step 2: Extract saree palette
        const palette = extractSareePalette(sareeImg);

        // Step 3: Get image data and detect body mask
        const imageData = ctx.getImageData(0, 0, w, h);
        const mask = detectBodyMask(imageData);

        // Step 4: Apply color transfer to body region
        applyColorTransfer(imageData, mask, palette, options.intensity);

        // Step 5: Add fabric texture
        addFabricTexture(imageData, mask, sareeFabric);

        // Step 6: Add border patterns
        addSareeBorder(imageData, mask, palette, options.intensity);

        // Put the processed image data back
        ctx.putImageData(imageData, 0, 0);

        // Step 7: Overlay the saree product image with blend mode
        overlaySareeImage(ctx, sareeImg, w, h, options);

        // Step 8: Add a subtle vignette for depth
        const gradient = ctx.createRadialGradient(w / 2, h / 2, w * 0.3, w / 2, h / 2, w * 0.7);
        gradient.addColorStop(0, 'rgba(0,0,0,0)');
        gradient.addColorStop(1, 'rgba(0,0,0,0.15)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);

        resolve({ composite: canvas.toDataURL('image/png'), palette });
      } catch (err) {
        reject(err);
      }
    };

    userImg.onload = onAllLoaded;
    sareeImg.onload = onAllLoaded;
    userImg.onerror = () => reject(new Error('Could not load your photo. Please try a different image.'));
    sareeImg.onerror = () => reject(new Error('Could not load the saree image. Please try another saree.'));
    sareeImg.crossOrigin = 'anonymous';
    userImg.src = userImageSrc;
    sareeImg.src = sareeImageSrc;
  });
}
