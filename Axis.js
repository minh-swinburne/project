const Axis = {
  template: `
    <g class="axis" ref="axis"></g>
  `,

  props: {
    scale: { type: Function, required: true },
    orient: { type: String, required: true },
    class: { type: String, default: "" },
    domainLine: { type: Boolean, default: true },
    gridLines: { type: Boolean, default: false },
    config: { type: Object, default: () => ({}) },
  },

  data() {
    return {
      axis: null,
      g: null,
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
      .ticks(this.config.ticks ?? 5)
      .tickSize(this.config.tickSize ?? 10)
      .tickPadding(this.config.tickPadding ?? 5)
      .tickSizeOuter(this.config.tickSizeOuter ?? 10);

    this.g = d3.select(this.$refs.axis);

    this.g.classed(this.orient, true);
    this.class
      .split(" ")
      .forEach((c) => this.g.classed(c, true));

    console.log(this.config);
    this.render();
  },

  methods: {
    render() {
      console.log("Axis rendering...");
      // console.log(this.$parent.size);
      // console.log(this.config);

      const { x: paddingX, y: paddingY } = this.config.padding
        || { x: 60, y: 50 };

      const width = this.$parent.size.width || 500;
      const height = this.$parent.size.height || 300;

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

      this.axis.scale(this.scale);
      // console.log(x, y);
      // console.log(this.axis);
      // console.log(this.scale);

      this.g
        .call(this.axis)
        .attr("transform", `translate(${x}, ${y})`);

      this.g.selectAll("text.axis-label").remove();
      this.g.append("text")
        .classed("axis-label", true)
        .attr("fill", "currentColor")
        .attr(
          "x",
          this.orient === "left" || this.orient === "right" ? 0 : width / 2
        )
        .attr(
          "y",
          this.orient === "top"
            ? -15 - this.axis.tickSize() - this.axis.tickPadding()
            : paddingY - 10
        )
        .attr("text-anchor", "middle")
        .attr("font-size", "13px")
        .text(this.config.label || "");

      if (this.config.domainLine === false) {
        this.g.select(".domain").remove();
      }

      if (this.config.gridLines) {
        this.g.selectAll(".grid-line").remove();
        this.g
          .selectAll(".tick line")
          .clone()
          .classed("grid-line", true)
          .attr("stroke-opacity", 0.1)
          .call((g) => {
            switch (this.orient) {
              case "left":
                g.attr("x2", width - paddingX * 2);
                break;
              case "right":
                g.attr("x2", paddingX * 2 - width);
                break;
              case "top":
                g.attr("y2", height - paddingY * 2);
                break;
              case "bottom":
                g.attr("y2", paddingY * 2 - height);
                break;
            }
          });
      }
    },
  },

  watch: {
    scale: "render",
    config: {
      deep: true,
      handler() {
        console.log("Axis config changed");
        this.render();
      },
    },
  },
};
