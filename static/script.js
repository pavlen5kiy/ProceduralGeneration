// Set up canvas
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Define canvas size
const width = 1000;
const height = 1000;
canvas.width = width;
canvas.height = height;

// Set up Perlin noise parameters
const noise = new Noise(Math.random());
const noiseScale = 0.005;
const octaves = 4;
const persistence = 0.5;

// Function to generate Perlin noise
function perlinNoise(x, y) {
  let total = 0;
  let frequency = 1;
  let amplitude = 1;
  let maxValue = 0; // Used for normalizing result to 0.0 - 1.0

  for (let i = 0; i < octaves; i++) {
    total +=
      noise.simplex2(x * frequency * noiseScale, y * frequency * noiseScale) *
      amplitude;

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
        return "Desert"
    } else if (elevation < 0.4) {
        if (moisture < 0.3 & temperature > 0.5) {
            return "Desert";
        } else {
            return "Plains";
        }
    } else if (elevation < 0.6) {
        if (moisture < 0.4 & temperature > 0.5) {
            return "Plains";
        } else {
            return "Forest";
        }
    } else if (elevation < 0.75) {
        if (temperature > 0.9) {
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
            const blue = Math.floor(255 * Math.abs(elevation - 0.2) / 3);
            const green = 255 * (1 - oceanTemperature) / 3;
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

// Generate terrain with biomes
generateTerrainWithBiomes();

// Function to generate terrain and biomes
function generateTerrainWithBiomes() {
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const elevation = perlinNoise(x, y);
            const temperature = Math.random(); // Placeholder value for temperature
            const oceanTemperature = perlinNoise(x, y)
            const moisture = Math.random(); // Placeholder value for moisture
            const biome = determineBiome(elevation, temperature, moisture);
            const color = determineColor(biome, elevation, oceanTemperature);
            drawPixel(x, y, color);
        }
    }
}
