const BarChart = {
  template: `
    <div class="chart bar-chart">
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

      scaleX: null,
      scaleY: null,

      padding: {
        x: 60,
        y: 50,
        inner: 0.05,
        outer: 0.1,
      },
    };
  },

  created() {
    console.log(this.config);

    this.scaleX = d3.scaleBand();
    this.scaleY = d3.scaleLinear();
    this.color = isColor(this.config.color) ? this.config.color : "steelblue";

    if (this.config.padding) {
      console.log("Padding exists");

      for (let p in this.config.padding) {
        this.padding[p] = this.config.padding[p];
      }
    }
  },

  mounted() {
    console.log("BarChart mounted");

    this.svg = d3
      .select(this.$refs.svg)
      .attr("width", this.config.width || 500)
      .attr("height", this.config.height || 300);

    this.updateSize();
    this.updateScales();
    this.render();

    this.resizeHandler = debounce(() => {
      this.updateSize();
      this.updateScales();
      this.render();
    }, 100);

    window.addEventListener("resize", this.resizeHandler);

    // this.$nextTick(() => {
    //   // this.config.width = 888;
    // });
  },

  beforeDestroy() {
    window.removeEventListener("resize", this.resizeHandler);
  },

  methods: {
    render() {
      console.log("Rendering BarChart");

      this.svg
        .selectAll("rect.chart-rect")
        .data(this.sortedData)
        .join("rect")
        .classed("chart-rect bar-chart-rect", true)
        .attr("x", (d) => this.scaleX(d[this.features.key]))
        .attr("y", (d) => this.scaleY(d[this.features.value]))
        .attr("width", this.scaleX.bandwidth())
        .attr("height", (d) => {
          let maxY = this.scaleY(this.minVal);
          let y = this.scaleY(d[this.features.value]);

          return maxY - y < 0 ? 0 : maxY - y;
        })
        .attr("fill", this.color);
    },

    updateSize() {
      this.size = this.svg.node().getBoundingClientRect();
      // console.log(this.size);
    },

    updateScales() {
      console.log("Updating scales");
      // console.log(this.padding.outer);

      this.scaleX
        .domain(this.keys)
        .rangeRound([this.padding.x, this.size.width - this.padding.x])
        .paddingInner(this.padding.inner)
        .paddingOuter(this.padding.outer);

      this.scaleY
        .domain(this.domain)
        .nice()
        .range([this.size.height - this.padding.y, this.padding.y]);

      try {
        this.$refs.axisX.render();
        this.$refs.axisY.render();
      } catch (e) {
        console.log("Failed to update axes", e);
      }

      console.log(this.keys.length);
      console.log(this.scaleX.domain());
      console.log(this.scaleX.range());
    },
  },

  computed: {
    sortedData() {
      return this.filteredData.sort(
        (a, b) => b[this.features.value] - a[this.features.value]
      );
    },

    filteredData() {
      let count = (this.size.width - this.padding.x * 2) / 40;
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
      return this.sortedData.map((d) => d[this.features.key]);
    },

    domain() {
      return [Math.floor(this.minVal), Math.ceil(this.maxVal)];
    },

    axisConfig() {
      return omitUndefined({
        // width: this.size.width,
        // height: this.size.height,
        padding: omit(this.padding, ["inner", "outer"]),
      });
    },
  },

  watch: {
    data: {
      deep: true,
      handler() {
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
