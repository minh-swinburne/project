function init() {
  const q1Container = ".view-container#q1";

  const app = Vue.createApp();

  app.component("v-chart", ChartContainer);
  app.component("v-view", View);
  app.mount("#app");
}

init();