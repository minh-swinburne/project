function init() {
  d3.json("data/countries.geo.json").then((geo) => {
    geoData = geo; // Save GeoJSON globally
    chart1(geoData);
    chart5(geoData);
  });
}

init();
