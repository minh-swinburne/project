const Axis = {
  template: `
    <g class="axis" ref="axis"></g>`,

  props: {
    scale: { type: Function, required: true },
    orient: { type: String, required: true },
    config: { type: Object, default: () => ({}) },
  },

  data() {
    return {
      axis: null,
    };
  },

  mounted() {
    console.log("Axis mounted");

    switch (this.orient) {
      case "left":
        this.axis = d3.axisLeft();
        break;
      case "right":
        this.axis = d3.axisRight();
        break;
      case "top":
        this.axis = d3.axisTop();
        break;
      case "bottom":
        this.axis = d3.axisBottom();
        break;
    }

    this.axis
      .scale(this.scale)
      .tickSize(this.config.tickSize || 10)
      .tickPadding(this.config.tickPadding || 5);

    d3.select(this.$refs.axis).classed(this.orient, true);

    console.log(this.config.width);
    this.update();
  },

  methods: {
    update() {
      console.log("Axis update");
      console.log(this.config.width);

      const [paddingX, paddingY] = this.config.padding || [0, 0];

      this.axis.scale(this.scale).ticks(this.config.ticks || 5);

      d3.select(this.$refs.axis)
        .call(this.axis)
        .attr(
          "transform",
          `translate(${
            this.orient == "right" ? this.config.width - paddingX : paddingX
          }, ${
            this.orient == "bottom" ? this.config.height - paddingY : paddingY
          })`
        );
    },
  },

  watch: {
    scale: "update",
    config: {
      deep: true,
      handler() {
        this.update();
      },
    },
  },
};
