const GeoChart = {
  template: `
    <div class="chart geo-chart">
      <svg v-once ref="svg" class="chart-svg">
        <defs>
          <pattern id="diagonalHatch"
            width="4.5" height="4.5"
            patternTransform="rotate(45)"
            patternUnits="userSpaceOnUse"
          >
            <line x1="0" y1="0" x2="0" y2="4.5" stroke="#ccc" stroke-width="2" />
          </pattern>
        </defs>
      </svg>
    </div>
  `,

  props: {
    data: { type: Array, required: true },
    keyCol: { type: String, required: true },
    valCol: { type: String, required: true },
    minVal: { type: Number, default: 0 },
    maxVal: { type: Number, default: 0 },
    domainSize: { type: Number, default: 9 },
    config: { type: Object, default: () => ({}) },
  },

  inject: ["geoKey", "geoData"],

  data() {
    return {
      svg: null,
      size: null,

      projection: null,
      path: null,
      legend: null,

      colorRange: null,
      colorScale: null,
      // colorNull: "#ccc",
      colorNull: "url(#diagonalHatch)",
    };
  },

  mounted() {
    console.log("GeoChart mounted");
    // console.log(this.maxVal);

    this.svg = d3
      .select(this.$refs.svg)
      .attr("width", this.config.width || 500)
      .attr("height", this.config.height || 300);

    this.projection = d3.geoEqualEarth();
    this.path = d3.geoPath().projection(this.projection);

    this.colorRange = d3
      .range(0, 1, 1 / this.domainSize)
      .map(
        d3["interpolate" + (this.config.color || "YlGnBu")] ||
          d3.interpolateYlGnBu
      );
    // console.log(this.color);

    this.colorScale = d3
      .scaleQuantize()
      .domain(this.domain)
      .range(this.colorRange);

    this.updateSize();
    this.configProjection();
    this.fitProjection();
    this.render();

    // console.log(this.colorScale.domain());
    // console.log(this.colorScale.range());
    this.drawLegend();

    window.addEventListener(
      "resize",
      debounce(() => {
        this.updateSize();
        this.fitProjection();
        this.render();
      }, 100)
    );
  },

  methods: {
    render() {
      console.log("Drawing map");
      // console.log(this.geoData.features);

      this.svg
        .selectAll("path.geo-chart-path")
        .data(this.geoData.features)
        .join("path")
        .classed("chart-path geo-chart-path", true)
        .attr("d", this.path)
        .attr("fill", (d) => {
          const value = this.data.find(
            (row) => row[this.keyCol] === d[this.geoKey]
          );

          return value !== undefined
            ? this.colorScale(value[this.valCol])
            : this.colorNull;
        })
        .attr("stroke", "#333")
        .attr("stroke-width", 0.5)
        .on("mouseover", this.mouseOver)
        .on("mousemove", this.mouseMove)
        .on("mouseout", this.mouseOut);

      this.drawLegend();
    },

    drawLegend() {
      console.log("Drawing legend");
      // console.log(this.colorScale.range().map(this.colorScale.invertExtent));

      // Legend dimensions
      const legendHeight = 10; // Height of the gradient
      const legendWidth = this.size.width * 0.8; // Legend spans 80% of the SVG width
      const legendX = (this.size.width - legendWidth) / 2; // Centered horizontally
      const legendY = 30; // Position at the bottom
      const tickSize = 6; // Tick height

      const colors = this.colorScale.range();
      colors.unshift(hexToRgb(this.colorNull)); // Add the "No Data" color at the beginning

      const cellWidth = legendWidth / (colors.length + 1);
      const strokeColor = "#666";
      const thresholds = this.colorScale
        .thresholds()
        .concat(this.colorScale.domain());

      // console.log(colors);
      // console.log(this.colorScale.thresholds());
      // console.log(this.domainSize);
      // console.log(d3.ticks(...this.colorScale.domain(), this.domainSize));

      // Scale for ticks
      const legendScale = d3
        .scaleLinear()
        .domain(this.domain)
        .range([cellWidth * 2, legendWidth]);

      // Axis for ticks
      const axis = d3
        .axisBottom(legendScale)
        .ticks(this.domainSize)
        .tickFormat(d3.format(".2"))
        .tickValues(thresholds)
        .tickSize(tickSize);

      this.svg.selectAll("g.chart-legend").remove();

      this.legend = this.svg
        .append("g")
        .classed("chart-legend", true)
        .attr(
          "transform",
          `translate(${legendX}, ${this.size.height - legendY})`
        );

      this.legend
        .selectAll("rect.chart-legend-color")
        .data(colors)
        .join("rect")
        .classed("chart-legend-color", true)
        .attr("x", (d, i) => (i === 0 ? 0 : (i + 1) * cellWidth))
        .attr("y", 0)
        .attr("width", cellWidth)
        .attr("height", legendHeight)
        .attr("stroke", strokeColor)
        .attr("fill", (d) => d);

      // Add text for "No Data" cell
      this.legend
        .append("text")
        .attr("x", cellWidth / 2)
        .attr("y", legendHeight + 15)
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .text("No Data");

      this.legend
        .append("g")
        .classed("chart-legend-axis", true)
        .attr("transform", `translate(0, ${legendHeight})`)
        .call(axis)
        .select(".domain")
        .remove(); // Remove the axis line

      // console.log(this.legend.selectAll("g.tick line"));
      this.legend.selectAll("g.tick line").attr("stroke", strokeColor);
    },

    updateSize() {
      this.size = this.svg.node().getBoundingClientRect();
    },

    configProjection() {
      // console.log(this.projection.scale());
      const projectionConfig = this.config.projection;

      if (projectionConfig) {
        projectionConfig.forEach((config) => {
          // console.log(config);
          if (typeof this.projection[config.method] === "function") {
            // this.projection[config.method](...config.args);
          } else {
            console.error(`Invalid projection method: ${config.method}`);
          }
        });
      }

      // console.log(this.projection.scale());
    },

    fitProjection() {
      console.log("Fitting projection");
      // console.log(this.size);

      this.projection.fitSize(
        [this.size.width, this.size.height - 50],
        this.geoData
      );
    },
  },

  beforeDestroy() {
    window.removeEventListener(
      "resize",
      debounce(() => {
        this.updateSize();
        this.fitProjection();
        this.render();
      }, 100)
    );
  },

  computed: {
    domain() {
      return [Math.floor(this.minVal), Math.ceil(this.maxVal)];
    },
  },

  watch: {
    config: {
      deep: true,
      handler() {
        this.configProjection();
        this.fitProjection();
      },
    },

    data: {
      deep: true,
      handler() {
        this.fitProjection();
        this.render();
        // this.drawLegend();
      },
    },
  },
};
