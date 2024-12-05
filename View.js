const View = {
  template: `
      <div class="v-view view-container">
        <div class="view-controller">
          <button
            v-for="dataset, index in datasets"
            :index="index"
            :class="{ active: dataset.id === this.currentDs.id }"
            @click="switchDataset"
            >
            {{ dataset.name }}
          </button>
        </div>
        <div class="view-info">
          <h2>{{ currentDs.title }}</h2>
          <p>{{ currentDs.description }}</p>
        </div>
        <div class="view-charts">
          <button
            v-for="chart, index in currentDs.charts"
            :index="index"
            :chart-type="chart.type"
            :class="{ active: chart.type === this.currentChart.type }"
            @click="switchChart"
            >
            {{ this.capitalizeFirstLetter(chart.type, "-") }}
          </button>
        </div>
        <v-chart
          :path="path"
          :file="currentDs.file"
          :charts="currentDs.charts">
        </v-chart>
      </div>
    `,
  props: ["path"],
  data() {
    return {
      datasets: [],
      currentDs: {
        id: "",
        name: "",
        title: "",
        description: "",
        file: "",
        charts: [],
      },
      currentChart: {
        type: "",
        key: "",
        value: "",
      },
    };
  },
  mounted() {
    this.loadJson("view.json").then((data) => {
      this.datasets = data;
      this.currentDs = data[0];
      this.currentChart = this.currentDs.charts[0];
    });
  },
  methods: {
    async loadJson(file) {
      return fetch(this.path + "/" + file).then((response) => response.json());
    },
    switchDataset(event) {
      let index = parseInt(event.target.getAttribute("index"));
      this.currentDs = this.datasets[index];
      this.currentChart = this.currentDs.charts[0];
      console.log("Switching to dataset with index " + index);
    },
    switchChart(event) {
      let index = parseInt(event.target.getAttribute("index"));
      this.currentChart = this.currentDs.charts[index];
      console.log("Switching to chart with index " + index);
    },
    capitalizeFirstLetter(string, separator = " ", joiner = " ") {
      return string
        .split(separator)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(joiner);
    }
  },
  computed: {
  }
};
