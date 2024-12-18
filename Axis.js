const Axis = {
  template: `
    <g class="axis" ref="axis"></g>`,

  props: {
    scale: { type: Function, required: true },
    orient: { type: String, required: true },
    class: { type: String, default: "" },
    config: { type: Object, default: () => ({}) },
  },

  data() {
    return {
      axis: null,
    };
  },

  mounted() {
    console.log("Axis mounted");
    console.log(this.$parent.svg);

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

    // console.log(this.scale);
    // console.log(this.scale.domain());
    // console.log(this.scale.range());
    this.axis
      .scale(this.scale)
      .tickSize(this.config.tickSize || 10)
      .tickPadding(this.config.tickPadding || 5);

    d3.select(this.$refs.axis).classed(this.orient, true);
    this.class
      .split(" ")
      .forEach((c) => d3.select(this.$refs.axis).classed(c, true));

    console.log(this.config);
    this.update();
  },

  methods: {
    update() {
      console.log("Axis update");
      // console.log(this.config.width);

      const { x: paddingX, y: paddingY } = this.config.padding
        || { x: 0, y: 0 };

      const width = this.config.width || 500;
      const height = this.config.height || 300;

      const x = this.orient === "right"
        ? width - paddingX
        : this.orient === "left"
          ? paddingX
          : 0;
      const y = this.orient === "bottom"
        ? height - paddingY
        : this.orient === "top"
          ? paddingY
          : 0;

      this.axis.scale(this.scale).ticks(this.config.ticks || 5);
      // console.log(x, y);
      // console.log(this.axis);
      // console.log(this.scale);

      d3.select(this.$refs.axis)
        .call(this.axis)
        .attr("transform", `translate(${x}, ${y})`);
    },
  },

  watch: {
    scale: "update",
    config: {
      deep: true,
      handler() {
        console.log("Axis config changed");
        this.update();
      },
    },
  },
};
