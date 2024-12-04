const ChartContainer = {
  template: `
      <div class="chart-container">
        <canvas ref="canvas"></canvas>
      </div>
    `,
  props: ["path", "file", "charts"],
  data() {
    return {
      current: null,
    };
  },
  mounted() {
    console.log(this.file);
    // this.chart = new Chart(this.$refs.canvas.getContext("2d"), {
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
          console.log(data);
        });
      },
    },
  },
  methods: {
    async loadCsv() {
      return d3.csv(this.path + "/" + this.file);
    },
  },
};