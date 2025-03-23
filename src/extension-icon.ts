// This file generates SVG icons that will be used for the extension
// You can replace these with real icons later

const generateSVGIcon = (size: number): string => {
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="#1a1a1a" />
      <text x="${size/2}" y="${size/2 + 5}" font-family="Arial" font-size="${size/2}" fill="#bfbdb3" text-anchor="middle">A</text>
    </svg>
  `;
};

export const icons = {
  48: generateSVGIcon(48),
  96: generateSVGIcon(96)
}; 