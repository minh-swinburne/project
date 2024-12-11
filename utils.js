function debounce(func, delay = 300) {
  let timer;
  return function (...args) {
    const context = this;
    clearTimeout(timer);
    timer = setTimeout(() => func.apply(context, args), delay);
  };
}

function capitalizeFirstLetter(string, separator = " ", joiner = " ") {
  return string
    .split(separator)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(joiner);
}

function hexToRgb(hex) {
  let hexValue = hex.replace("#", "");

  if (hexValue.length === 3) {
    hexValue = hexValue
      .split("")
      .map((char) => char + char)
      .join("");
  }

  if (hexValue.length !== 6) {
    throw new Error("Invalid hex value");
  }

  const r = parseInt(hexValue.substring(0, 2), 16);
  const g = parseInt(hexValue.substring(2, 4), 16);
  const b = parseInt(hexValue.substring(4, 6), 16);

  return `rgb(${r}, ${g}, ${b})`;
}