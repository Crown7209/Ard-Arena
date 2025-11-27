// Predefined color palette - using distinct pastel colors that are easy to differentiate
const COLOR_PALETTE = [
  "#FF0000", // Red
  "#0000FF", // Blue
  "#00AA00", // Green
  "#FFD700", // Gold
  "#FF8C00", // Dark Orange
  "#800080", // Purple
  "#00FFFF", // Cyan
  "#FF00FF", // Magenta
  "#FF1493", // Deep Pink
  "#008080", // Teal
  "#8B4513", // Saddle Brown
  "#4B0082", // Indigo
  "#DC143C", // Crimson
  "#4169E1", // Royal Blue
  "#32CD32", // Lime Green
  "#FF4500", // Orange Red
  "#20B2AA", // Light Sea Green
  "#9932CC", // Dark Orchid
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
