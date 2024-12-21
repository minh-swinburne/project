const GroupedBarChart = {
  template: `
    <div class="chart grouped-bar-chart">
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

  emits: ["update:group"],

  data() {
    return {
      svg: null,
      size: null,

      scaleX: null,
      scaleY: null,
      scaleFX: null,
      currentGroup: "",

      colorScale: null,
      colorNull: "#ccc",

      padding: {
        x: 60,
        y: 50,
        inner: 0.1,
        outer: 0.2,
      },
    };
  },

  created() {
    console.log(this.config);

    this.scaleX = d3.scaleBand();
    this.scaleY = d3.scaleLinear();

    this.scaleFX = d3.scaleBand();
    this.colorScale = d3.scaleOrdinal().unknown(this.colorNull);

    this.currentGroup = this.features.group[0];
    this.color = isColor(this.config.color) ? this.config.color : "steelblue";

    if (this.config.padding) {
      console.log("Padding exists");

      for (let p in this.config.padding) {
        this.padding[p] = this.config.padding[p];
      }
    }
  },

  mounted() {
    console.log("GroupedBarChart mounted");

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
      console.log("Rendering GroupedBarChart");
      console.log(this.groups);
      console.log(d3.group(this.sortedData, (d) => d[this.features.key]));

      this.svg
        .selectAll("g.chart-group")
        .data(this.groupedData)
        .join("g")
        .classed("chart-group grouped-bar-chart-group", true)
        .attr("transform", ([key]) => `translate(${this.scaleX(key)}, 0)`)
        .selectAll("rect.chart-rect")
        .data(([, values]) => values)
        .join("rect")
        .classed("chart-rect grouped-bar-chart-rect", true)
        .attr("x", (d) => this.scaleFX(d[this.currentGroup]))
        .attr("y", (d) => this.scaleY(d[this.features.value]))
        .attr("width", this.scaleFX.bandwidth())
        .attr("height", (d) => {
          let maxY = this.scaleY(this.minVal);
          let y = this.scaleY(d[this.features.value]);

          return maxY - y < 0 ? 0 : maxY - y;
        })
        .attr("fill", (d) => this.colorScale(d[this.currentGroup]));
    },

    updateSize() {
      this.size = this.svg.node().getBoundingClientRect();
      // console.log(this.size);
    },

    updateColor() {
      let range = colorRange(
        this.groups.length,
        this.config.color || "Turbo"
      ).reverse();
      console.log(range);

      // let cssObj = window.getComputedStyle(this.$el);
      // let bgColor = cssObj.getPropertyValue("background-color");

      if (this.$refs.svg && this.groups.length > 1) {
        // console.log(this.$refs.svg.parentElement);
        range = range.map((color) =>
          enhanceContrast(color, getBgColor(this.$refs.svg), 2)
        );
        console.log(range);
      }

      this.colorScale.domain(this.groups).range(range);

      try{console.log(
        enhanceContrast(this.colorScale.range()[1], "rgb(249, 249, 249)")
      );}catch(e){console.log(e);}
    },

    updateScales() {
      console.log("Updating scales");
      // console.log(this.padding.outer);
      console.log(this.groups);

      this.scaleX
        .domain(this.keys)
        .rangeRound([this.padding.x, this.size.width - this.padding.x])
        .paddingInner(this.padding.inner)
        .paddingOuter(this.padding.outer);

      this.scaleY
        .domain(this.domain)
        .range([this.size.height - this.padding.y, this.padding.y]);

      this.scaleFX
        .domain(this.groups)
        .rangeRound([0, this.scaleX.bandwidth()])
        .padding(this.padding.inner / 2);

      try {
        this.$refs.axisX.update();
        this.$refs.axisY.update();
      } catch (e) {
        console.log("Failed to update axes");
      }

      console.log(this.keys.length);
      console.log(this.scaleX.domain());
      console.log(this.scaleX.range());
    },
  },

  computed: {
    sortedData() {
      let sorted = [...this.data].sort(
        (a, b) => b[this.features.value] - a[this.features.value]
      );
      let max = sorted[0];

      sorted = filterCountries(sorted);
      sorted.unshift(max);

      return [...new Set(sorted)];
    },

    groupedData() {
      return d3.group(this.sortedData, (d) => d[this.features.key]);
    },

    keys() {
      return this.sortedData.map((d) => d[this.features.key]);
    },

    groups() {
      let groups = this.sortedData.map((d) => d[this.currentGroup]);
      return [...new Set(groups)];
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
    groups: "updateColor",

    currentGroup: {
      immediate: true,
      handler(newVal) {
        console.log("Group changed: " + newVal);
        this.$parent.updateFilters([newVal]);
      },
    },

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
