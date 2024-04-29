// Set up canvas
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Define canvas size
const width = 400;
const height = 400;
canvas.width = width;
canvas.height = height;

// Set up Perlin noise parameters
const noise = new Noise(Math.random());
let noiseScale = 0.025;
const octaves = 4;
const persistence = 0.5;

// Initialize position
let offsetX = 0;
let offsetY = 0;

// Function to generate Perlin noise
function perlinNoise(x, y) {
  let total = 0;
  let frequency = 0.5;
  let amplitude = 0.25;
  let maxValue = 0; // Used for normalizing result to 0.0 - 1.0

  for (let i = 0; i < octaves; i++) {
    total +=
      noise.simplex2(
        (x + offsetX) * frequency * noiseScale,
        (y + offsetY) * frequency * noiseScale
      ) * amplitude;

    maxValue += amplitude;

    amplitude *= persistence;
    frequency *= 2;
  }

  return total / maxValue;
}

// Function to determine biome based on elevation, temperature, and moisture
function determineBiome(elevation, temperature, moisture) {
  if (elevation < 0.1) {
    return "Water";
  } else if (elevation < 0.2) {
    return "Desert";
  } else if (elevation < 0.4) {
    return "Plains";
  } else if (elevation < 0.6) {
    return "Forest";
  } else if (elevation < 0.75) {
    return "Mountains";
  } else {
    return "SnowyMountains";
  }
}

// Function to determine color based on biome
function determineColor(biome, elevation, oceanTemperature) {
  switch (biome) {
    case "Water":
      const blue = Math.floor((255 * Math.abs(elevation - 0.2)) / 3);
      const green = 255 * (oceanTemperature * 10);
      return `rgb(0, ${green}, ${255 - blue})`; // Blue color for water
    case "Plains":
      return "rgb(130, 255, 47)"; // Green grass color
    case "Forest":
      return "rgb(34, 139, 34)"; // Forest color
    case "Mountains":
      return "rgb(192, 192, 192)"; // Gray color for mountains
    case "SnowyMountains":
      return "rgb(255, 255, 255)"; // White color for snowy mountains
    case "Desert":
      return "rgb(255, 255, 102)"; // Yellow color for desert
    default:
      return "rgb(255, 255, 255)"; // Default color
  }
}

// Function to draw a pixel on the canvas
function drawPixel(x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, 1, 1);
}

// Function to generate terrain and biomes
function generateTerrainWithBiomes() {
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const elevation = perlinNoise(x, y);
      const oceanTemperature = elevation;

      const biome = determineBiome(elevation);
      const color = determineColor(biome, elevation, oceanTemperature);
      drawPixel(x, y, color);
    }
  }
}

// Generate terrain with biomes
generateTerrainWithBiomes();

// Handle arrow key press events
document.addEventListener("keydown", function (event) {
  switch (event.key) {
    case "w":
      offsetY -= 10;
      break;
    case "s":
      offsetY += 10;
      break;
    case "a":
      offsetX -= 10;
      break;
    case "d":
      offsetX += 10;
      break;
    case "[":
        // Adjust noise scale for zooming out
        noiseScale /= 0.9; // Zoom out
        break;
    case ']':
        // Adjust noise scale for zooming in
        noiseScale *= 0.9; // Zoom in
        break;
    default:
      return; // Exit this handler for other keys
  }

  // Redraw terrain
  setTimeout(generateTerrainWithBiomes, 1000 / 30);
});
