const GeoChart = {
  template: `
    <div class="chart geo-chart">
      <svg ref="svg" class="chart-svg"></svg>
    </div>`,

  props: {
    data: { type: Array, required: true },
    // geo: {type: Object, required: true},
    filters: { type: Object, default: () => ({}) },
    config: { type: Object, default: () => ({}) },
  },

  inject: ["geoData"],

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
    this.svg = d3.select(this.$refs.svg);
    this.projection = d3.geoEqualEarth();
    this.path = d3.geoPath().projection(this.projection);

    this.colorRange = d3.range(0, 1, 1 / this.domainSize).map(d3.interpolateYlOrRd);
    this.colorScale = d3.scaleQuantize().range(this.colorRange);

    this.configProjection();
    this.fitProjection();
    window.addEventListener("resize", this.fitProjection);

    // console.log(this.svg);
    this.renderMap();
  },

  methods: {
    renderMap() {
      this.svg
        .attr("width", this.config.width || 500)
        .attr("height", this.config.height || 300);

      // Add your D3.js geo chart logic here, using `this.data`
      // console.log("Rendering Geo Chart", this.data);
    },

    configProjection() {
      // console.log(this.projection.scale());
      const projectionConfig = this.config.projection;

      if (projectionConfig) {
        projectionConfig.forEach((config) => {
          // console.log(config);
          if (typeof this.projection[config.method] === "function")
          {
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
      const size = this.svg.node().getBoundingClientRect();
      this.projection.fitSize([size.width, size.height], this.data);
    },
  },

  beforeDestroy() {
    window.removeEventListener("resize", this.fitProjection);
  },

  computed: {
    filteredData() {
      return this.data.filter((e) => {
        for (const [key, value] of Object.entries(this.filters)) {
          if (e[key] !== value) {
            return false;
          }
        }
        return true;
      });
    },
  },

  watch: {
    config: {
      deep: true,
      handler() {
        this.configProjection();
        this.fitProjection();
        this.renderMap();
      },
    },
  }
};
