function init() {
  const q1Container = ".view-container#q1";

  const app = Vue.createApp();
  let geoData;
  d3.json("data/countries.geo.json").then((geo) => {
    geoData = geo; // Save GeoJSON globally
    app.provide("geoData", geoData);
  });

  app.component("v-geo-chart", GeoChart);
  app.component("v-chart", ChartContainer);
  app.component("v-view", View);
  app.mount("#app");
}

init();