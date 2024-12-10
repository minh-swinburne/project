const GeoChart = {
  template: `
    <div class="chart geo-chart">
      <svg v-once ref="svg" class="chart-svg"></svg>
    </div>`,

  props: {
    data: { type: Array, required: true },
    keyCol: { type: String, required: true },
    valCol: { type: String, required: true },
    maxVal: { type: Number, default: 0 },
    filters: { type: Object, default: () => ({}) },
    config: { type: Object, default: () => ({}) },
  },

  inject: ["geoKey", "geoData"],

  data() {
    return {
      svg: null,
      projection: null,
      path: null,

      domainSize: 10,
      colorRange: null,
      colorScale: null,
    };
  },

  mounted() {
    console.log("GeoChart mounted");
    console.log(this.maxVal);
    this.svg = d3
      .select(this.$refs.svg)
      .attr("width", this.config.width || 500)
      .attr("height", this.config.height || 300);

    this.projection = d3.geoEqualEarth();
    this.path = d3.geoPath().projection(this.projection);

    this.colorRange = d3
      .range(0, 1, 1 / this.domainSize)
      .map(d3.interpolateYlOrRd);
    this.colorScale = d3
      .scaleQuantize()
      .domain(this.domain)
      .range(this.colorRange);

    this.configProjection();
    this.fitProjection();
    this.drawMap();

    window.addEventListener("resize", this.fitProjection);
  },

  methods: {
    drawMap() {
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

          if ((value !== undefined && value[this.keyCol]) === "USA") {
            console.log(value);
            console.log(this.colorScale(value[this.valCol]));
          }
          return value !== undefined
            ? this.colorScale(value[this.valCol])
            : "#ccc";
        })
        .attr("stroke", "#333")
        .attr("stroke-width", 0.5)
        .on("mouseover", this.mouseOver)
        .on("mousemove", this.mouseMove)
        .on("mouseout", this.mouseOut);

      // Add your D3.js geo chart logic here, using `this.data`
      // console.log("Rendering Geo Chart", this.data);
    },

    drawLegend() {
      // Legend dimensions
      const legendHeight = 10; // Height of the gradient
      const legendWidth = this.size.width * 0.8; // Legend spans 80% of the SVG width
      const legendX = (this.size.width - legendWidth) / 2; // Centered horizontally
      const legendY = 30; // Position at the bottom
      const tickSize = 6; // Tick height

      this.svg.select("g.legend").remove();
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
      // console.log("Fitting projection");
      this.projection.fitSize(
        [this.size.width, this.size.height],
        this.geoData
      );
    },
  },

  beforeDestroy() {
    window.removeEventListener("resize", this.fitProjection);
  },

  computed: {
    domain() {
      return d3.nice(
        0, //d3.min(this.data, (d) => d[this.keyCol]),
        this.maxVal || d3.max(this.data, (d) => d[this.valCol]),
        this.domainSize
      );
    },

    size() {
      return this.svg.node().getBoundingClientRect();
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
        this.drawMap();
        // this.drawLegend();
      },
    },
  },
};
