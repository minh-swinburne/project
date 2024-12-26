function debounce(func, delay = 300) {
  let timer;
  return function (...args) {
    const context = this;
    clearTimeout(timer);
    timer = setTimeout(() => func.apply(context, args), delay);
  };
}

function omit(obj, keys) {
  return Object.fromEntries(
    Object.entries(obj).filter(([key]) => !keys.includes(key))
  );
}

function omitUndefined(obj) {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    if (value !== undefined) {
      acc[key] = value;
    }
    return acc;
  }, {});
}

function capitalizeFirstLetter(string, separator = " ", joiner = " ") {
  return string
    .trim()
    .split(separator)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(joiner);
}

/**
 * Converts an RGB string to an array.
 * @param {string} rgb - RGB color as a string, e.g., "rgb(255, 255, 255)".
 * @returns {number[]} RGB values as an array, e.g., [255, 255, 255].
 */
function parseRgb(rgb) {
  console.log(rgb);
  return rgb.match(/\d+/g).map(Number);
}

/**
 * Converts an RGB array to a string.
 * @param {number[]} rgb - RGB values as an array, e.g., [255, 255, 255].
 * @returns {string} RGB color as a string, e.g., "rgb(255, 255, 255)".
 */
function toRgbString([r, g, b]) {
  return `rgb(${r}, ${g}, ${b})`;
}

function rgbToHex([r, g, b]) {
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

function hexToRgb(hex, string = true) {
  if (!hex.match(/^#([A-Fa-f0-9]{3}){1,2}$/)) {
    return hex;
  }

  let hexValue = hex.replace("#", "");

  if (hexValue.length === 3) {
    hexValue = hexValue
      .split("")
      .map((char) => char + char)
      .join("");
  }

  const r = parseInt(hexValue.substring(0, 2), 16);
  const g = parseInt(hexValue.substring(2, 4), 16);
  const b = parseInt(hexValue.substring(4, 6), 16);

  return string ? toRgbString([r, g, b]) : [r, g, b];
}

function rgbToHsl([r, g, b], string = false) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  if (delta) {
    if (max === r) h = ((g - b) / delta) % 6;
    else if (max === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;
  }
  h = Math.round(h * 60);
  if (h < 0) h += 360;

  const l = (max + min) / 2;
  const s = delta ? delta / (1 - Math.abs(2 * l - 1)) : 0;

  return string ? `hsl(${h}, ${s * 100}, ${l * 100})` : [h, s * 100, l * 100];
}

function hslToRgb([h, s, l], string = false) {
  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let [r, g, b] = [0, 0, 0];
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];

  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);

  return string ? toRgbString([r, g, b]) : [r, g, b];
}

/**
 * Generate a color range based on the number of elements.
 * Some recommended color scales are: Viridis, Plasma, Inferno, Magma, etc.
 * @param {string} type - Type of color scale, either "sequential" or "ordinal"
 * @param {string} scheme - Name of the color scale
 * @param {number} count - Number of colors to generate
 * @param {number} weight - Weight of the color scale, distance from the center. Default is 0.1
 * @param {number} bias - Bias of the color scale, makes the colors closer to one end. Default is 0
 * @returns {array} Array of colors
 * @example
 * colorRange(5, "Viridis")
 * // Returns ["#440154", "#3B528B", "#21908C", "#5DC863", "#FDE725"]
 * @example
 * colorRange(5, "Plasma", 0)
 * // Returns ["#0D0887", "#46039F", "#7201A8", "#9C179E", "#BD3786"]
 */
function colorRange(type, scheme, count, weight = 0.1, bias = 0) {
  type = type === "sequential" ? "interpolate" : "scheme";
  scheme = capitalizeFirstLetter(scheme);
  let interpolator = d3[type + scheme];

  switch (type) {
    case "interpolate":
      if (!interpolator) {
        console.error(
          `Sequential interpolator not found for ${scheme}, using Viridis`
        );
        scheme = "Viridis";
      }
      break;
    case "scheme":
      if (!interpolator) {
        console.error(`Scheme not found for ${scheme}, using Tableau10`);
        scheme = "Tableau10";
      }
      break;
    default:
      console.error(`Invalid type: ${type}, using interpolateSpectral`);
      type = "interpolate";
      scheme = "Spectral";
  }

  return type === "scheme"
    ? d3[type + scheme][count]
    : d3.quantize(
        (t) => interpolator(t * (1 - weight * 2 - bias) + weight + bias),
        count
      );
}

function getLuminance([r, g, b]) {
  const sRGB = [r, g, b].map((v) => v / 255);
  const linearRGB = sRGB.map((v) =>
    v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  );
  return 0.2126 * linearRGB[0] + 0.7152 * linearRGB[1] + 0.0722 * linearRGB[2];
}

/**
 * Calculates the contrast ratio between two colors.
 * @param {string} color1 - The first color in RGB format.
 * @param {string} color2 - The second color in RGB format.
 * @returns {number} The contrast ratio.
 */
function getContrastRatio(color1, color2) {
  const luminance1 = getLuminance(color1);
  const luminance2 = getLuminance(color2);
  const brighter = Math.max(luminance1, luminance2);
  const darker = Math.min(luminance1, luminance2);
  return (brighter + 0.05) / (darker + 0.05);
}

/**
 * Enhances the contrast of a color with a background color.
 * @param {string} color - The color to enhance in RGB format.
 * @param {string} bgColor - The background color in RGB format.
 * @param {number} threshold - The minimum contrast ratio. Default is 4.5.
 * @returns {string} The enhanced color in RGB format.
 */
function enhanceContrast(color, bgColor, threshold = 4.5) {
  let rgbColor = parseRgb(color);
  const rgbBgColor = parseRgb(bgColor);

  let [h, s, l] = rgbToHsl(rgbColor, false);
  const [, , bgL] = rgbToHsl(rgbBgColor, false);

  while (getContrastRatio(rgbColor, rgbBgColor) < threshold) {
    l += bgL < 50 ? 5 : -5; // Increase luminance by 5%
    if (l < 0 || l > 100) break; // Stop if adjustment is out of range
    rgbColor = hslToRgb([h, s, l]);
  }

  return toRgbString(rgbColor);
}

/**
 * Gets the actual background color of an element, traversing the DOM hierarchy
 * to find the nearest non-transparent background.
 *
 * @param {Element} element - The DOM element to start with.
 * @returns {string} The nearest non-transparent background color in RGB or HEX format.
 */
function getBgColor(element) {
  let currentElement = element;

  while (currentElement) {
    const computedStyle = getComputedStyle(currentElement);
    const bgColor = computedStyle.backgroundColor;

    if (
      bgColor &&
      bgColor !== "transparent" &&
      bgColor !== "rgba(0, 0, 0, 0)"
    ) {
      return bgColor; // Found a non-transparent background
    }

    currentElement = currentElement.parentElement; // Move up the DOM hierarchy
  }

  // Fallback: Return default background color (usually white)
  return "rgb(255, 255, 255)";
}

/**
 * Filter long data to a specific number based on preferred countries.
 * @param {array} data - The data to filter.
 * @param {number} count - The number of countries to filter. Default is 26.
 * @param {string} dataCol - The country column name of the data to filter. Default is "AreaCode".
 * @param {string} counCol - The country column name of the preferred countries. Default is "code".
 * @returns {array} The filtered data.
 * @example
 * filterCountries(data, 10)
 * // Returns the top 10 countries in the data
 */
function filterCountries(
  data,
  count = 26,
  dataCol = "AreaCode",
  counCol = "code"
) {
  function uniqueCountries(dat) {
    return new Set(dat.map((d) => d[dataCol]));
  }

  if (!data) return [];

  let unique = uniqueCountries(data);
  if (unique.size <= count) return [...data]; // Return a copy of the data

  let countries = [
    { code: "VNM", name: "Viet Nam", region: "Asia" },
    { code: "AUS", name: "Australia", region: "Oceania" },
    { code: "USA", name: "United States", region: "Americas" },
    { code: "FRA", name: "France", region: "Europe" },
    { code: "DZA", name: "Algeria", region: "Africa" },
    { code: "IND", name: "India", region: "Asia" },
    { code: "ARG", name: "Argentina", region: "Americas" },
    { code: "GBR", name: "United Kingdom", region: "Europe" },
    { code: "BWA", name: "Botswana", region: "Africa" },
    { code: "NZL", name: "New Zealand", region: "Oceania" },
    { code: "CHN", name: "China", region: "Asia" },
    { code: "CAN", name: "Canada", region: "Americas" },
    { code: "DEU", name: "Germany", region: "Europe" },
    { code: "AGO", name: "Angola", region: "Africa" },
    { code: "FJI", name: "Fiji", region: "Oceania" },
    { code: "JPN", name: "Japan", region: "Asia" },
    { code: "MEX", name: "Mexico", region: "Americas" },
    { code: "ESP", name: "Spain", region: "Europe" },
    { code: "BEN", name: "Benin", region: "Africa" },
    { code: "VUT", name: "Vanuatu", region: "Oceania" },
    { code: "KOR", name: "South Korea", region: "Asia" },
    { code: "BRA", name: "Brazil", region: "Americas" },
    { code: "SGP", name: "Singapore", region: "Asia" },
    { code: "ITA", name: "Italy", region: "Europe" },
    { code: "IOT", name: "British Indian Ocean Territory", region: "Africa" },
  ].map((d) => d[counCol]).slice(0, count);

  let filteredData = data
    .filter((d) => countries.includes(d[dataCol]))
    .sort(
      (a, b) => countries.indexOf(a[dataCol]) - countries.indexOf(b[dataCol])
    );
  unique = uniqueCountries(filteredData);

  // console.log("Filtered data: ", filteredData);
  // console.log("Unique countries: ", unique);

  if (unique.size < count) {
    let remaining = count - unique.size;
    let remainingCountries = [...uniqueCountries(data)]
      .filter((c) => !unique.has(c))
      .splice(0, remaining);
    let remainingData = data.filter((d) =>
      remainingCountries.includes(d[dataCol])
    );

    filteredData.push(...remainingData);
  }

  return filteredData;
}

function isColor(strColor) {
  var s = new Option().style;
  s.color = strColor;
  return s.color == strColor;
}
