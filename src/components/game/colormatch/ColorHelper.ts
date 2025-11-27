declare const randomColor: (options?: {
  luminosity?: string;
  hue?: string;
}) => string;

function shuffle(array: string[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

export const getRandomColorPairs = (count: number): string[] => {
  const hueList = [
    "red",
    "orange",
    "yellow",
    "green",
    "blue",
    "purple",
    "pink",
    "monochrome",
  ];

  const luminosityList = ["bright", "light", "dark"];
  const colorList: string[] = [];
  const usedColors = new Set<string>();

  let attempts = 0;
  const maxAttempts = count * 10; // Prevent infinite loop

  while (colorList.length < count && attempts < maxAttempts) {
    attempts++;

    const hueIndex = colorList.length % hueList.length;
    const luminosityIndex =
      Math.floor(colorList.length / hueList.length) % luminosityList.length;

    const color = randomColor({
      luminosity: luminosityList[luminosityIndex],
      hue: hueList[hueIndex],
    });

    // Only add if we haven't used this exact color
    if (!usedColors.has(color)) {
      colorList.push(color);
      usedColors.add(color);
    }
  }

  // If we still don't have enough colors, generate random ones
  while (colorList.length < count) {
    const color = randomColor({
      luminosity: "random",
    });
    if (!usedColors.has(color)) {
      colorList.push(color);
      usedColors.add(color);
    }
  }

  // double current color list
  const fullColorList = [...colorList, ...colorList];

  // Shuffle color list
  shuffle(fullColorList);

  return fullColorList;
};
