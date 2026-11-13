import sharp from 'sharp';
import fs from 'fs';

async function generateAssets() {
  const masterPath = 'public/logo-master.jpg';
  const { data, info } = await sharp(masterPath)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const getPixel = (x, y) => {
    const idx = (y * info.width + x) * info.channels;
    return [data[idx], data[idx + 1], data[idx + 2]];
  };

  // Squircle alpha mask (w = 288, h = 288, r = 56)
  function getSquircleAlpha(x, y, w = 288, h = 288, r = 56) {
    let cx = -1, cy = -1;
    if (x < r && y < r) { cx = r; cy = r; }
    else if (x >= w - r && y < r) { cx = w - r - 1; cy = r; }
    else if (x < r && y >= h - r) { cx = r; cy = h - r - 1; }
    else if (x >= w - r && y >= h - r) { cx = w - r - 1; cy = h - r - 1; }

    if (cx === -1) return 255;
    const dist = Math.hypot(x - cx, y - cy);
    if (dist <= r - 1) return 255;
    if (dist >= r + 1) return 0;
    return Math.round((1 - (dist - (r - 1)) / 2) * 255);
  }

  // 1. Light Mode Icon (Dark Green Squircle)
  const sq1_x = 106, sq1_y = 486, w = 288, h = 288;
  const sq1Rgba = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const [r, g, b] = getPixel(sq1_x + x, sq1_y + y);
      const alpha = getSquircleAlpha(x, y, w, h, 56);
      const idx = (y * w + x) * 4;
      sq1Rgba[idx] = r;
      sq1Rgba[idx + 1] = g;
      sq1Rgba[idx + 2] = b;
      sq1Rgba[idx + 3] = alpha;
    }
  }

  await sharp(sq1Rgba, { raw: { width: w, height: h, channels: 4 } })
    .png()
    .toFile('public/logo-icon-light.png');
  console.log('Saved public/logo-icon-light.png');

  // 2. Dark Mode Icon (Lime Squircle)
  const sq2_x = 1546, sq2_y = 486;
  const sq2Rgba = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const [r, g, b] = getPixel(sq2_x + x, sq2_y + y);
      const alpha = getSquircleAlpha(x, y, w, h, 56);
      const idx = (y * w + x) * 4;
      sq2Rgba[idx] = r;
      sq2Rgba[idx + 1] = g;
      sq2Rgba[idx + 2] = b;
      sq2Rgba[idx + 3] = alpha;
    }
  }

  await sharp(sq2Rgba, { raw: { width: w, height: h, channels: 4 } })
    .png()
    .toFile('public/logo-icon-dark.png');
  console.log('Saved public/logo-icon-dark.png');

  // Multi-size icons
  const sizes = [16, 32, 40, 48, 72, 180, 192, 512];
  for (const s of sizes) {
    await sharp('public/logo-icon-light.png')
      .resize(s, s, { fit: 'contain' })
      .png()
      .toFile(`public/icon-${s}.png`);
  }
  fs.copyFileSync('public/icon-32.png', 'public/icon.png');
  fs.copyFileSync('public/icon-180.png', 'public/apple-icon.png');
  fs.copyFileSync('public/icon-32.png', 'public/favicon.ico');
  console.log('Saved all app icons and favicons');
}

generateAssets().catch(console.error);
