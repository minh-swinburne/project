const ChartContainer = {
  template: `
      <div class="chart-container">
        <div class="chart-data">
          Path: {{ path }}
          <br>
          File: {{ file }}
          <br>
          Chart types: {{ types ? types.join(", ") : "None" }}
        </div>
        <svg ref="svg" class="chart-svg"></svg>
      </div>
    `,
  props: ["path", "file", "charts"],
  data() {
    return {
      data: [],
      current: null,
    };
  },
  mounted() {
    console.log(this.$refs.svg);
    // this.chart = new Chart(this.$refs.svg.getContext("2d"), {
    //   type: this.dataset.type,
    //   data: this.dataset.data,
    //   options: this.dataset.options,
    // });
  },
  watch: {
    file: {
      deep: true, // Ensures nested changes in dataset trigger the watcher
      handler() {
        console.log(this.file);
        // this.updateChart();
        this.loadCsv().then((data) => {
          this.data = data;
          console.log(data);
        });
      },
    },
    charts() {
      // this.types = this.charts.map((chart) => chart.type);
      // console.log(this.types);
    }
  },
  methods: {
    async loadCsv() {
      return d3.csv(this.path + "/" + this.file);
    },
  },
  computed: {
    types() {
      return this.charts
        ? this.charts.map((chart) => chart.type)
        : [];
    },
  },
};