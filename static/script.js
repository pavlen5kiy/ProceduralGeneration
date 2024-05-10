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

function temperatureMap(x, y) {
  let total = 0;
  let frequency = 0.2;
  let amplitude = 0.15;
  let maxValue = 0; // Used for normalizing result to 0.0 - 1.0

  for (let i = 0; i < octaves / 4; i++) {
    total +=
      noise.simplex2(
        (x + offsetX) * frequency * noiseScale * 0.12,
        (y + offsetY) * frequency * noiseScale * 0.12
      ) * amplitude;

    maxValue += amplitude;

    amplitude *= persistence;
    frequency *= 2;
  }

  return total / maxValue;
}

function moistureMap(x, y) {
  let total = 0;
  let frequency = 0.5;
  let amplitude = 0.1;
  let maxValue = 0; // Used for normalizing result to 0.0 - 1.0

  for (let i = 0; i < octaves / 2; i++) {
    total +=
      noise.simplex2(
        (x + offsetX) * frequency * noiseScale * 0.5,
        (y + offsetY) * frequency * noiseScale * 0.5
      ) * amplitude;

    maxValue += amplitude;

    amplitude *= persistence;
  }

  return total / maxValue;
}

// Function to determine biome based on elevation, temperature, and moisture
function determineBiome(elevation, temperature, moisture) {
  if (elevation < 0.1) {
    return "Water";
  } else if (elevation < 0.2) {
    if (temperature > -0.75) {
      return "Desert";
    } else {
      return "Mountains"; // not mountains, but stoney beach or sth
    }
  } else if (elevation < 0.4) {
    if (moisture < 0.5) {
      if (temperature > 0.2) {
        return "Desert";
      } else if (temperature > -0.5) {
        return "Plains";
      } else {
        return "SnowyPlains";
      }
    } else {
      if (temperature > 0.5) {
        if (moisture > 0.5) {
          return "Jungle";
        } else {
          return "Savanna";
        }
      } else if (temperature > -0.5) {
        return "Forest";
      } else {
        return "Taiga";
      }
    }
  } else if (elevation < 0.6) {
    if (temperature > 0.5) {
      return "Jungle";
    } else if (temperature > 0) {
      return "Savanna";
    } else if (temperature > -0.5) {
      return "Forest";
    } else {
      return "Taiga";
    }
  } else if (elevation < 0.75) {
    if (temperature > 0.5) {
      return "Forest";
    } else {
      return "Mountains";
    }
  } else {
    return "SnowyMountains";
  }
}

// Function to determine color based on biome
function determineColor(biome, elevation, oceanTemperature) {
  switch (biome) {
    case "Water":
      const blue = Math.floor((255 * Math.abs(elevation - 0.2)) / 3);
      const green = 15 * (oceanTemperature * 10);
      return `rgb(0, ${green}, ${255 - blue})`;
    case "Plains":
      return "rgb(127, 204, 25)";
    case "Forest":
      return "rgb(0, 87, 0)";
    case "Mountains":
      return "rgb(141, 144, 158)";
    case "Desert":
      return "rgb(247, 233, 163)";
    case "Jungle":
      return "rgb(0, 217, 58)";
    case "Savanna":
      return "rgb(103, 117, 53)";
    case "Taiga":
      return "rgb(22, 126, 134)";
    default:
      return "rgb(255, 255, 255)";
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
      const temperature = temperatureMap(x, y);
      const moisture = moistureMap(x, y);

      const biome = determineBiome(elevation, temperature, moisture);
      const color = determineColor(biome, elevation, temperature);
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
      offsetY -= 5;
      break;
    case "s":
      offsetY += 5;
      break;
    case "a":
      offsetX -= 5;
      break;
    case "d":
      offsetX += 5;
      break;
    case "[":
      // Adjust noise scale for zooming out
      noiseScale *= 1.02; // Zoom out
      break;
    case "]":
      // Adjust noise scale for zooming in
      noiseScale *= 0.98; // Zoom in
      break;
    default:
      return; // Exit this handler for other keys
  }

  // Redraw terrain
  setTimeout(generateTerrainWithBiomes, 1000 / 30);
});
