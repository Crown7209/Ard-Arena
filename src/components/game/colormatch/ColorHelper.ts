// Predefined color palette - using distinct pastel colors that are easy to differentiate
const COLOR_PALETTE = [
  "#FFB3BA", // Pastel Pink
  "#BAFFC9", // Pastel Green
  "#BAE1FF", // Pastel Blue
  "#FFFFBA", // Pastel Yellow
  "#FFDFBA", // Pastel Orange
  "#E0BBE4", // Pastel Purple
  "#B4A7D6", // Pastel Lavender
  "#FFCCCB", // Pastel Coral
  "#C7CEEA", // Pastel Periwinkle
  "#B5EAD7", // Pastel Mint
  "#F0E68C", // Pastel Khaki
  "#FFD1DC", // Pastel Rose
  "#DDA0DD", // Pastel Plum
  "#98D8C8", // Pastel Turquoise
  "#F4A460", // Pastel Sandy Brown
  "#DEB887", // Pastel Burlywood
  "#FFB6C1", // Pastel Light Pink
  "#87CEEB", // Pastel Sky Blue
];

function shuffle(array: string[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

export const getRandomColorPairs = (count: number): string[] => {
  // Randomly select colors from the palette
  const shuffledPalette = [...COLOR_PALETTE];
  shuffle(shuffledPalette);
  
  // Select the first N colors needed
  const selectedColors = shuffledPalette.slice(0, count);
  
  // Double the colors to create pairs
  const fullColorList = [...selectedColors, ...selectedColors];
  
  // Shuffle the color list randomly
  shuffle(fullColorList);
  
  return fullColorList;
};
