const BarChart = {
  template: `
    <div class="chart bar-chart">
      <svg v-once ref="svg" class="chart-svg"></svg>
    </div>`,

  props: {
    data: { type: Array, required: true },
    keyCol: { type: String, required: true },
    valCol: { type: String, required: true },
    minVal: { type: Number, default: 0 },
    maxVal: { type: Number, default: 0 },
    filters: { type: Object, default: () => ({}) },
    config: { type: Object, default: () => ({}) },
  },

  data() {
    return {
      svg: null,
      xScale: null,
      yScale: null,
      xAxis: null,
      yAxis: null,
    };
  },
};