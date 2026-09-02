import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';

// Configuration
const INPUT_DIR = 'src/assets/raw-images';
const OUTPUT_DIR = 'public/images';
const SIZES = [400, 800, 1200]; // Generate these widths
const QUALITY = 80;

async function optimizeImages() {
  console.log('🖼️ Starting image optimization...');

  // Ensure output directory exists
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  // Find all images in input directory
  const files = await glob(`${INPUT_DIR}/**/*.{jpg,jpeg,png}`);
  
  if (files.length === 0) {
    console.log(`ℹ️ No local images found in ${INPUT_DIR}. Add some images there to see the script in action!`);
    return;
  }

  for (const file of files) {
    const filename = path.parse(file).name;
    const instance = sharp(file);
    const metadata = await instance.metadata();

    // Original size webp
    await instance
      .webp({ quality: QUALITY })
      .toFile(path.join(OUTPUT_DIR, `${filename}.webp`));
    console.log(`✅ Converted ${filename} to WebP (Original Size)`);

    // Responsive sizes
    for (const size of SIZES) {
      if (metadata.width && metadata.width >= size) {
        await instance
          .resize({ width: size, withoutEnlargement: true })
          .webp({ quality: QUALITY })
          .toFile(path.join(OUTPUT_DIR, `${filename}-${size}w.webp`));
        console.log(`✅ Generated ${filename}-${size}w.webp`);
      }
    }
  }

  console.log('✨ Image optimization complete!');
}

optimizeImages().catch(console.error);
