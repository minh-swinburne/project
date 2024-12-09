const View = {
  template: `
      <div class="v-view view-container">
        <div class="view-controller">
          <h3>Choose a dataset:</h3>

          <button
            v-if="datasets.length > 0"
            v-for="dataset, index in datasets"
            :class="{ active: dataset.id === currentDs.id }"
            @click="switchDataset(index)"
            >
            {{ dataset.name }}
          </button>

          <p v-else>Loading datasets...</p>
        </div>
        <div class="view-info">
          <h2>{{ currentDs.title }}</h2>
          <p>{{ currentDs.description }}</p>

          <small>
            Data count:
            {{ data.length }}
          </small>
        </div>
        <div class="view-charts">
          <button
            v-for="chart, index in currentDs.charts"
            :chart-type="chart.type"
            :class="{ active: chart.type === currentChart.type }"
            @click="switchChart(index)"
            >
            {{ capitalizeFirstLetter(chart.type, "-") }}
          </button>
        </div>
        <div class="view-canvas">
          <v-chart
            v-if="data.length > 0"
            v-bind:data="data"
            :id="currentDs.id + '-' + currentChart.type"
            :type="currentChart.type"
            :key-col="currentChart.key"
            :val-col="currentChart.value"
            :config="currentChart.config"
          </v-chart>

          <p v-else>Loading data...</p>
        </div>
      </div>
    `,

  props: ["path"],

  data() {
    return {
      datasets: [],
      data: [],

      datasetsLoaded: false,
      dataLoaded: false,

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
        config: {},
      },
    };
  },

  mounted() {
    this.loadJson("view.json").then((data) => {
      this.datasets = data;
      this.switchDataset(0);
    });
  },

  methods: {
    async loadJson(file) {
      return fetch(this.path + "/" + file)
        .then((response) => response.json())
        .catch((error) => console.error(error));
    },

    async loadCsv(file) {
      return d3
        .csv(this.path + "/" + file)
        .catch((error) => console.error(error));
    },

    switchDataset(index) {
      this.currentDs = this.datasets[index];
      this.currentChart = this.currentDs.charts[0];

      this.loadCsv(this.currentDs.file).then((data) => {
        this.data = data;
      });
      // console.log("Switching to dataset with index " + index);
    },

    switchChart(index) {
      this.currentChart = this.currentDs.charts[index];
      // console.log("Switching to chart with index " + index);
    },

    capitalizeFirstLetter(string, separator = " ", joiner = " ") {
      return string
        .split(separator)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(joiner);
    },
  },

  computed: {},
};
