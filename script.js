function init() {
  const q1Container = ".view-container#q1";

  const app = Vue.createApp();

  app.component("chart-container", ChartContainer);
  app.component("view-container", ViewContainer);
  app.mount("#app");
}

init();