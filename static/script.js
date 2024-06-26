const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const width = 400;
const height = 400;
canvas.width = width;
canvas.height = height;

const noise = new Noise(Math.random());
let noiseScale = 0.025;
const octaves = 4;
const persistence = 0.5;

let offsetX = 0;
let offsetY = 0;

function terrainMap(x, y) {
  let total = 0;
  let frequency = 0.5;
  let amplitude = 0.25;
  let maxValue = 0; // Used for normalizing result to 0.0 - 1.0

  for (let i = 0; i < octaves; i++) {
    total +=
      noise.simplex2(
        (x + offsetX - 200) * frequency * noiseScale,
        (y + offsetY - 200) * frequency * noiseScale
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
        (x + offsetX - 200) * frequency * noiseScale * 0.12,
        (y + offsetY - 200) * frequency * noiseScale * 0.12
      ) * amplitude;

    maxValue += amplitude;

    amplitude *= persistence;
    frequency *= 2;
  }

  return total / maxValue;
}

function moistureMap(x, y) {
  let total = 0;
  let frequency = 0.25;
  let amplitude = 0.1;
  let maxValue = 0; // Used for normalizing result to 0.0 - 1.0

  for (let i = 0; i < octaves / 2; i++) {
    total +=
      noise.simplex2(
        (x + offsetX - 200) * frequency * noiseScale * 0.06,
        (y + offsetY - 200) * frequency * noiseScale * 0.06
      ) * amplitude;

    maxValue += amplitude;

    amplitude *= persistence;
  }

  return total / maxValue;
}

function determineBiome(elevation, temperature, moisture) {
  if (elevation < 0.1) {
    return "Water";
  } else if (elevation < 0.2) {
    if (temperature > 0) {
      return "Desert";
    } else if (temperature > -0.5) {
      return "Mountains"; // not mountains, but stoney beach or sth
    } else {
      return "IcyBeach";
    }
  } else if (elevation < 0.4) {
    if (temperature > 0.5) {
      if (moisture > 0.5) {
        return "Jungle";
      } else if (moisture > 0) {
        return "Savanna";
      } else if (moisture > -0.25) {
        return "RedDesert";
      } else {
        return "Desert";
      }
    } else if (temperature > -0.5) {
      if (moisture > 0.5) {
        return "Swamp";
      } else if (moisture > 0) {
        return "Forest";
      } else {
        return "Plains";
      }
    } else {
      if (moisture > 0.5) {
        return "Taiga";
      } else {
        return "SnowyPlains";
      }
    }
  } else if (elevation < 0.6) {
    if (temperature > 0.5) {
      if (moisture > 0.5) {
        return "MountainsJungle";
      } else if (moisture > 0) {
        return "MountainsSavanna";
      } else if (moisture > -0.25) {
        return "Badlands";
      } else {
        return "Desert";
      }
    } else if (temperature > -0.5) {
      return "Forest";
    } else {
      return "MountainsTaiga";
    }
  } else if (elevation < 0.75) {
    if (temperature > 0.5) {
      if (moisture > 0.5) {
        return "MountainsJungle";
      } else if (moisture > 0) {
        return "MountainsSavanna";
      } else {
        return "Mountains";
      }
    } else if (temperature > -0.5) {
      return "MountainsForest";
    } else {
      return "MountainsTaiga";
    }
  } else {
    if (temperature > -0.5) {
      return "Mountains";
    } else {
      return "SnowyMountains";
    }
  }
}

function determineColor(biome, elevation, temperature) {
  switch (biome) {
    case "Water":
      const green = 15 * (temperature * 10);
      const blue = Math.floor((255 * Math.abs(elevation - 0.2)) / 3) - green;
      return `rgb(0, ${green}, ${255 - blue})`;
    case "Plains":
      return "rgb(127, 204, 25)";
    case "Forest":
      return "rgb(0, 124, 0)";
    case "MountainsForest":
      return "rgba(0, 87, 0)";
    case "Mountains":
      return "rgb(141, 144, 158)";
    case "SnowyMountains":
      return "rgb(255, 255, 255)";
    case "Desert":
      return "rgb(247, 233, 163)";
    case "Jungle":
      return "rgb(0, 217, 58)";
    case "MountainsJungle":
      return "rgb(0, 153, 40)";
    case "Savanna":
      return "rgb(103, 117, 53)";
    case "MountainsSavanna":
      return "rgb(72, 82, 37)";
    case "Taiga":
      return "rgb(22, 126, 134)";
    case "MountainsTaiga":
      return "rgb(15, 88, 94)";
    case "IcyBeach":
      return "rgb(102, 153, 216)";
    case "SnowyPlains":
      return "rgb(255, 255, 255)";
    case "Badlands":
      return "rgb(137, 70, 31)";
    case "RedDesert":
      return "rgb(159, 82,36)";
    case "Swamp":
      return "rgb(53, 57, 29)";
    default:
      return "rgb(255, 0, 0)";
  }
}

function drawPixel(x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, 1, 1);
}

function generateMap() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const elevation = terrainMap(x, y);
      const temperature = temperatureMap(x, y);
      const moisture = moistureMap(x, y);

      const biome = determineBiome(elevation, temperature, moisture);
      const color = determineColor(biome, elevation, temperature);
      drawPixel(x, y, color);
    }
  }
}

generateMap();

document.addEventListener("keydown", function (event) {
  const moveSpeed = 20;
  const zoomInParam = 0.98;
  const zoomOutParam = 1.02;

  switch (event.key) {
    case "w":
      offsetY -= moveSpeed;
      break;
    case "s":
      offsetY += moveSpeed;
      break;
    case "a":
      offsetX -= moveSpeed;
      break;
    case "d":
      offsetX += moveSpeed;
      break;
    case "[":
      noiseScale *= zoomOutParam;
      break;
    case "]":
      noiseScale *= zoomInParam;
      break;
    default:
      return;
  }

  // Redraw terrain
  setTimeout(generateMap, 1000 / 30);
});

// Add this function to dynamically populate the biome hints table
function populateBiomeHints() {
  const biomeHintsTable = document.getElementById("biome-hints");

  const biomes = [
    { name: "Water", color: "rgb(0, 150, 255)" },
    { name: "Plains", color: "rgb(127, 204, 25)" },
    { name: "Forest", color: "rgb(0, 124, 0)" },
    { name: "Mountains Forest", color: "rgba(0, 87, 0)" },
    { name: "Mountains / Stoney Beach", color: "rgb(141, 144, 158)" },
    { name: "Snowy Mountains / Snowy Plains", color: "rgb(255, 255, 255)" },
    { name: "Desert / Beach", color: "rgb(247, 233, 163)" },
    { name: "Jungle", color: "rgb(0, 217, 58)" },
    { name: "Mountains Jungle", color: "rgb(0, 153, 40)" },
    { name: "Savanna", color: "rgb(103, 117, 53)" },
    { name: "Mountains Savanna", color: "rgb(72, 82, 37)" },
    { name: "Taiga", color: "rgb(22, 126, 134)" },
    { name: "Mountains Taiga", color: "rgb(15, 88, 94)" },
    { name: "Icy Beach", color: "rgb(102, 153, 216)" },
    { name: "Badlands", color: "rgb(137, 70, 31)" },
    { name: "Red Desert", color: "rgb(159, 82, 36)" },
    { name: "Swamps", color: "rgb(53, 57, 29)" },
  ];

  biomes.forEach((biome) => {
    const row = document.createElement("tr");
    const squareCell = document.createElement("td");
    const nameCell = document.createElement("td");
    const square = document.createElement("div");

    square.classList.add("biome-square");
    square.style.backgroundColor = biome.color;
    nameCell.textContent = biome.name;

    squareCell.appendChild(square);
    row.appendChild(squareCell);
    row.appendChild(nameCell);

    biomeHintsTable.appendChild(row);
  });
}

// Call the function to populate biome hints table
populateBiomeHints();
