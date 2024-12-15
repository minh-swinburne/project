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

  return `rgb(${r}, ${g}, ${b})`;
}

function filterCountries(data, dataCol = "AreaCode", counCol = "code") {
  let countries = [
    { code: "DZA", name: "Algeria", region: "Africa" },
    { code: "AGO", name: "Angola", region: "Africa" },
    { code: "BEN", name: "Benin", region: "Africa" },
    { code: "BWA", name: "Botswana", region: "Africa" },
    { code: "IOT", name: "British Indian Ocean Territory", region: "Africa" },
    { code: "CAN", name: "Canada", region: "Americas" },
    { code: "USA", name: "United States", region: "Americas" },
    { code: "BRA", name: "Brazil", region: "Americas" },
    { code: "ARG", name: "Argentina", region: "Americas" },
    { code: "MEX", name: "Mexico", region: "Americas" },
    { code: "CHN", name: "China", region: "Asia" },
    { code: "IND", name: "India", region: "Asia" },
    { code: "JPN", name: "Japan", region: "Asia" },
    { code: "SGP", name: "Singapore", region: "Asia" },
    { code: "KOR", name: "South Korea", region: "Asia" },
    { code: "VNM", name: "Viet Nam", region: "Asia" },
    { code: "FRA", name: "France", region: "Europe" },
    { code: "DEU", name: "Germany", region: "Europe" },
    { code: "ESP", name: "Spain", region: "Europe" },
    { code: "ITA", name: "Italy", region: "Europe" },
    { code: "GBR", name: "United Kingdom", region: "Europe" },
    { code: "AUS", name: "Australia", region: "Oceania" },
    { code: "NZL", name: "New Zealand", region: "Oceania" },
    { code: "FJI", name: "Fiji", region: "Oceania" },
    { code: "VUT", name: "Vanuatu", region: "Oceania" },
  ];

  countries = countries.map((d) => d[counCol]);

  return data.length > 25
    ? data.filter((d) => countries.includes(d[dataCol]))
    : [...data];  // Return a copy of the data
}