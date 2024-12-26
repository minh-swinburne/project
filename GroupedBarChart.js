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

    if (this.config.padding) {
      console.log("Padding exists");

      this.padding = { ...this.padding, ...this.config.padding };
    }
  },

  mounted() {
    console.log("GroupedBarChart mounted");

    this.svg = d3
      .select(this.$refs.svg)
      .attr("width", this.config.width || 500)
      .attr("height", this.config.height || 300);

    this.currentGroup = Object.keys(this.features.group)[0];

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
      let count = this.groups.length;
      let range = colorRange(
        this.config.color?.type,
        this.config.color?.scheme || "YlGnBu",
        count > 1 ? count : 2,
        0.1,
        0.05
      );

      if (this.config.color?.reverse) {
        range.reverse();
      }

      this.colorScale.domain(this.groups).range(range);

      console.log(this.colorScale.domain());
      console.log(this.colorScale.range());
      console.log(this.colorScale("Spirits"));
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
        this.$refs.axisX.render();
        this.$refs.axisY.render();
      } catch (e) {
        console.log("Failed to update axes");
      }

      // console.log(this.keys.length);
      // console.log(this.scaleX.domain());
      // console.log(this.scaleX.range());
    },
  },

  computed: {
    groupedData() {
      return d3.group(this.filteredData, (d) => d[this.features.key]);
    },

    filteredData() {
      let count = Math.round((this.size.width - this.padding.x * 2) / 100);
      let filtered = filterCountries(this.data, count);
      let max = this.data.reduce(
        (max, d) =>
          d[this.features.value] > max[this.features.value] ? d : max,
        this.data[0]
      );

      console.log("Filtered data for GroupedBarChart");
      console.log(filtered);
      console.log(max);

      return filtered.includes(max)
        ? filtered
        : [max, ...filtered.splice(0, count - 1)];
    },

    keys() {
      let keys = [
        ...new Set(this.filteredData.map((d) => d[this.features.key])),
      ];
      let keyData = this.filteredData.filter(
        (d) =>
          d[this.currentGroup] ===
            this.features.group[this.currentGroup]?.sortKey ?? this.groups[0]
      );

      keys.sort(
        (a, b) =>
          (this.features.group[this.currentGroup]?.sortOrder === "asc"
            ? 1
            : -1) *
          (keyData.find((d) => d[this.features.key] === a)[
            this.features.value
          ] -
            keyData.find((d) => d[this.features.key] === b)[
              this.features.value
            ])
      );
      console.log(keys);
      return keys;
    },

    groups() {
      let groups = [
        ...new Set(this.filteredData.map((d) => d[this.currentGroup])),
      ];

      groups.sort((a, b) =>
        this.features.group[this.currentGroup]?.groupOrder
          ? this.features.group[this.currentGroup]?.groupOrder.indexOf(a) -
            this.features.group[this.currentGroup]?.groupOrder.indexOf(b)
          : a.localeCompare(b)
      );

      return groups;
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
    currentGroup: {
      immediate: true,
      handler(newVal) {
        console.log("Group changed: " + newVal);
        this.$parent.getFilters([newVal], true);
        this.$parent.updateData();
      },
    },

    data: {
      handler() {
        if (this.svg) {
          this.updateScales();
          this.render();
        }
      },
    },

    config: {
      deep: true,
      handler() {
        if (this.svg) {
          this.render();
        }
      },
    },
  },
};
