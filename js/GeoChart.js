class GeoChart extends Chart {
  constructor(
    containerSelector,
    id,
    title,
    dataset,
    dataKey = "value",
    width = 600,
    height = 400
  ) {
    super(containerSelector, id, title, dataset, width, height);
    // Add a class to the container representing chart type
    this.container.classed("geo-chart", true);
    // Remove the axes
    this.svg.selectAll("g.axis").remove();

    this.dataKey = dataKey;
    this.color = d3
      .scaleQuantize()
      .domain([0, this.maxValue])
      .range(d3.schemePurples[7]);

    this.projection = d3
      .geoMercator()
      .center([145, -36.5])
      // Fit the projection to the svg and the dataset
      // replaces .scale and .translate
      .fitSize([width, height], dataset);

    console.log(this);

    this.path = d3.geoPath().projection(this.projection);

    this.createPaths();
  }

  get minValue() {
    // Get the minimum value of the dataKey in the GeoJSON dataset
    return d3.min(this.dataset.features, (d) => d.properties[this.dataKey]);
  }

  get maxValue() {
    // Get the maximum value of the dataKey in the GeoJSON dataset
    return d3.max(this.dataset.features, (d) => d.properties[this.dataKey]);
  }

  createControllers() {
    super.createControllers();

    // Remove controllers for padding and transition
    this.chartControllers.select(".chart-controller.x-padding").remove();
    this.chartControllers.select(".chart-controller.y-padding").remove();
    this.chartControllers.select(".chart-controller.duration").remove();
    this.chartControllers.select(".chart-controller.delay").remove();
    this.chartControllers.select(".chart-controller.ease").remove();
  }

  createButtons() {
    // No buttons for the geo chart (static data)
  }

  setTransition(selection, name) {
    // No transition for the geo chart
    return selection;
  }

  createPaths() {
    // console.log(this.dataset.features);

    this.paths = this.svg
      .selectAll("path.geo-path")
      .data(this.dataset.features)
      .join("path")
      .classed("geo-path", true);
  }

  addPoints(points) {
    if (this.points === undefined) {
      this.points = [];
    }
    this.points.concat(points);

    // Create circles for each point in the dataset
    // given their longitude and latitude
    this.svg
      .selectAll("circle.point")
      .data(points)
      .join("circle")
      .classed("point", true)
      .attr("cx", (d) => this.projection([d.lon, d.lat])[0])
      .attr("cy", (d) => this.projection([d.lon, d.lat])[1])
      .attr("r", 3)
      .attr("fill", "red");
  }

  display() {
    console.log("Displaying GEO chart '" + this.id + "'");

    this.projection.fitSize([this.width, this.height], this.dataset);

    this.paths
      .attr("d", this.path)
      .attr("stroke", "white")
      .attr("stroke-width", 0.5)
      .attr("stroke-linejoin", "round")
      // Fill each path with a color based on its data
      .attr("fill", (d) => {
        // If the data is undefined, use a light gray color
        if (d.properties[this.dataKey] === undefined) {
          return "lightgray";
        }
        return this.color(d.properties[this.dataKey]);
      });
  }
}
