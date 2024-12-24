const LineChart = {
  template: `
    <div class="chart line-chart">
      <svg ref="svg" class="chart-svg">
        <v-axis
          v-if="svg"
          ref="axisX"
          orient="bottom"
          class="axis-x"
          :scale="scaleX"
          :config="{
            tickSizeOuter: 0,
            ...axisConfig,
            ...(config.axis?.x || {}),
          }"
        ></v-axis>
        <v-axis
          v-if="svg"
          ref="axisY"
          orient="left"
          class="axis-y"
          :scale="scaleY"
          :config="{
            domainLine: false,
            gridLines: true,
            ...axisConfig,
            ...(config.axis?.y || {}),
          }"
        ></v-axis>
      </svg>
    </div>
  `,

  props: {
    data: { type: Array, required: true },
    features: { type: Object, required: true },
    minVal: { type: Number, default: 0 },
    maxVal: { type: Number, default: 0 },
    config: { type: Object, default: () => ({}) },
  },

  data() {
    return {
      svg: null,
      size: null,

      line: null,
      currentLine: "",

      scaleX: null,
      scaleY: null,

      colorScale: null,
      colorNull: "#ccc",

      padding: {
        x: 60,
        y: 50,
      },
    };
  },

  created() {
    this.scaleX = d3.scaleTime();
    this.scaleY = d3.scaleLinear();
    this.colorScale = d3.scaleOrdinal().unknown(this.colorNull);

    this.line = d3
      .line()
      .x((d) => this.scaleX(d[this.features.key]))
      .y((d) => this.scaleY(d[this.features.value]));
    this.currentLine = this.features.line[0];

    console.log(this.currentLine);

    if (this.config.padding) {
      this.padding = { ...this.padding, ...this.config.padding };
    }
  },

  mounted() {
    console.log("LineChart mounted");

    this.svg = d3
      .select(this.$refs.svg)
      .attr("width", this.config.width || 500)
      .attr("height", this.config.height || 300);

    this.updateSize();
    this.updateColor();
    this.updateScales();
    this.render();

    this.resizeHandler = debounce(() => {
      this.updateSize();
      this.updateScales();
      this.render();
    }, 100);

    window.addEventListener("resize", this.resizeHandler);
  },

  beforeDestroy() {
    window.removeEventListener("resize", this.resizeHandler);
  },

  methods: {
    render() {
      console.log("Rendering LineChart...");
      console.log(this.lines);

      this.svg
        .selectAll("g.chart-group")
        .data(this.linedData)
        .join("g")
        .classed("chart-group line-chart-group", true)
        .selectAll("path.chart-path")
        .data(([key, values]) => [values])
        .join("path")
        .classed("chart-path line-chart-path", true)
        .attr("d", this.line)
        .attr("fill", "none")
        .attr("stroke-width", 1.5)
        .attr("stroke", ([key, values]) => this.colorScale(key));
    },

    updateSize() {
      this.size = this.svg.node().getBoundingClientRect();
    },

    updateColor() {
      this.colorScale.domain(this.lines).range(d3.schemeTableau10);
    },

    updateScales() {
      const { x: paddingX, y: paddingY } = this.padding;
      const width = this.size.width;
      const height = this.size.height;

      this.scaleX
        .domain(d3.extent(this.data, (d) => d[this.features.key]))
        .range([paddingX, width - paddingX]);

      this.scaleY
        .domain(this.domain)
        .nice()
        .range([height - paddingY, paddingY]);

      try {
        this.$refs.axisX.render();
        this.$refs.axisY.render();
      } catch (e) {
        console.log("Failed to update axes: ", e);
      }
    },
  },

  computed: {
    linedData() {
      return d3.group(this.filteredData, (d) => d[this.currentLine]);
    },

    filteredData() {
      let count = Math.min(this.config.maxLines ?? 6);
      let filtered = filterCountries(this.data, count);
      let max = this.data.reduce(
        (max, d) =>
          d[this.features.value] > max[this.features.value] ? d : max,
        this.data[0]
      );

      console.log("Filtered data for BarChart");
      console.log(filtered);
      console.log(max);

      return filtered.includes(max)
        ? filtered
        : [max, ...filtered.splice(0, count - 1)];
    },

    keys() {
      return this.filteredData.map((d) => d[this.features.key]);
    },

    lines() {
      let lines = this.filteredData.map((d) => d[this.currentLine]);
      return [...new Set(lines)];
    },

    domain() {
      return [Math.floor(this.minVal), Math.ceil(this.maxVal)];
    },
  },

  watch: {
    lines: "updateColor",

    currentLine: {
      handler(newVal) {
        console.log("Line group changed: " + newVal);
        this.$parent.updateFilters([newVal]);
      },
    },

    data: {
      deep: true,
      handler() {
        console.log("Data changed");
        this.updateScales();
        this.render();
      },
    },

    config: {
      deep: true,
      handler() {
        this.render();
      },
    },
  },
};
