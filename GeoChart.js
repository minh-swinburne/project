const GeoChart = {
  template: `
    <div class="chart geo-chart">
      <svg ref="svg"></svg>
    </div>`,
  props: {
    data: { type: Array, required: true },
    options: { type: Object, default: () => ({}) },
  },
  mounted() {
    this.renderChart();
  },
  methods: {
    renderChart() {
      const svg = d3
        .select(this.$refs.svg)
        .attr("width", this.options.width || 500)
        .attr("height", this.options.height || 300);

      // Add your D3.js geo chart logic here, using `this.data`
      console.log("Rendering Geo Chart", this.data);
    },
  },
};
