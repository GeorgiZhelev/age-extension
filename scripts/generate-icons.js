import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Make sure the icons directory exists
const iconsDir = path.join(__dirname, '../public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate SVG icon content
const generateSVGIcon = (size) => {
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="#1a1a1a" />
      <text x="${size/2}" y="${size/2 + 5}" font-family="Arial" font-size="${size/2}" fill="#bfbdb3" text-anchor="middle">A</text>
    </svg>
  `;
};

// Write each icon size
const sizes = [48, 96];
sizes.forEach(size => {
  const iconPath = path.join(iconsDir, `icon-${size}.svg`);
  // For now, we'll write SVG files as placeholders
  // In a real app, you'd use a library like sharp to convert SVGs to PNGs
  fs.writeFileSync(
    iconPath, 
    generateSVGIcon(size)
  );
  console.log(`Generated icon: ${iconPath}`);
});

console.log('Icon generation complete'); 