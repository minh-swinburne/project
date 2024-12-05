const ChartContainer = {
  template: `
      <div class="chart-container">
        <div class="chart-controller">
          {{ type }}
          {{ current }}
        </div>
        <div class="chart-canvas">
          <component
            :is="current"
          ></component>
        </div>
      </div>
    `,
  props: {
    data: { type: Array, required: true },
    type: { type: String, required: true },
    keyCol: { type: String, required: true },
    valCol: { type: String, required: true },
    options: { type: Object, default: () => ({}) },
  },
  data() {
    return {
      // current: null,
    };
  },
  mounted() {
    // console.log(this.$refs.svg);
    // this.chart = new Chart(this.$refs.svg.getContext("2d"), {
    //   type: this.dataset.type,
    //   data: this.dataset.data,
    //   options: this.dataset.options,
    // });
  },
  watch: {},
  methods: {},
  computed: {
    current() {
      const chartMap = {
        bar: "BarChart",
        line: "LineChart",
        geo: "GeoChart",
      };
      return chartMap[this.type];
    },
  },
};