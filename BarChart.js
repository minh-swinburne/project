const BarChart = {
  template: `
    <div class="chart bar-chart">
      <svg ref="svg" class="chart-svg">
        <v-axis
          v-if="svg"
          orient="bottom"
          :scale="xScale"
          :config="axisConfig"
        ></v-axis>
      </svg>
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
      xPadding: 30,
      yPadding: 50,
    };
  },

  created() {
    this.xScale = d3
      .scaleBand()
      .domain(this.data.map((d) => d[this.keyCol]))
      .range([0, this.config.width || 500])
      .padding(0.1);

    // console.log(this.xScale);

    this.yScale = d3
      .scaleLinear()
      .domain([
        this.minVal,
        this.maxVal || d3.max(this.data, (d) => d[this.valCol]),
      ])
      .range([this.config.height || 300, 0]);
  },

  mounted() {
    console.log("BarChart mounted");
    console.log(this.svg ? "SVG exists" : "SVG does not exist");

    this.svg = d3
      .select(this.$refs.svg)
      .attr("width", this.config.width || 500)
      .attr("height", this.config.height || 300);

    console.log(this.svg ? "SVG exists" : "SVG does not exist");

    this.$nextTick(() => {
      // this.config.width = 888;
    });

    // console.log(this.$refs.svg.attributes["width"].value);
  },

  methods: {
    render() {
      console.log("Rendering BarChart");
      console.log(this.data);
    },
  },

  computed: {
    axisConfig() {
      return {
        width: this.config.width,
        height: this.config.height,
        padding: [this.xPadding, this.yPadding],
      };
    },
  },

  watch: {
    data: {
      deep: true,
      handler() {
        this.render();
      },
    },

    config: {
      deep: true,
      handler() {
        this.render();
      },
    },
  }
};