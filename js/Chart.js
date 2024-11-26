class Chart {
  constructor(
    containerSelector,
    id,
    title,
    dataset,
    width = 600,
    height = 400
  ) {
    this.containerSelector = containerSelector;
    this.id = id;
    this.title = title;
    this.dataset = dataset;
    this.width = width;
    this.height = height;
    this.xPadding = 50;
    this.yPadding = 20;
    this.duration = 1000;
    this.delay = 500;

    // Wrap the chart in a div container
    this.container = d3
      .select(this.containerSelector)
      .append("div")
      .classed("chart-container", true)
      .attr("id", this.id);
    // Add a title to the chart
    this.titleElement = this.container
      .append("h2")
      .text(this.title)
      .classed("chart-title", true)
      .attr("id", this.id + "-title");

    this.createControllers();
    this.createButtons();
    this.createSvg();
    this.createScales();
    this.createAxes();
  }

  tabulateDataset() {
    // Default tabulation of dataset to console, should be overrided if needed
    console.table(this.dataset, ["x", "y"]);
  }

  getX(d, i = null) {
    throw new Error("getX accessor must be overrided for each type of chart");
  }

  getY(d, i = null) {
    throw new Error("getY accessor must be overrided for each type of chart");
  }

  get minValue() {
    // Default min value accessor, should be overrided if needed
    return d3.min(this.dataset, this.getY);
  }

  get maxValue() {
    // Default max value accessor, should be overrided if needed
    return d3.max(this.dataset, this.getY);
  }

  createController(label, name, attributes, onChange) {
    const controller = this.chartControllers
      .append("label")
      .classed("chart-controller " + name, true)
      .text(label);

    const controllerInput = controller
      .append("input")
      .attr("id", this.id + "-" + name)
      .on("change.default", function () {
        onChange(d3.select(this).node().value);
      });
    attributes.forEach((attr) => {
      controllerInput.attr(attr.name, attr.value);
    });

    // Return the controller for later access
    return controller;
  }

  createControllers() {
    // console.log("Creating controllers for chart '" + this.id + "'");
    this.chartControllers = this.container
      .append("div")
      .classed("chart-controllers", true)
      .attr("id", this.id + "-controllers");

    // Width controller
    this.createController(
      "Width: ",
      "width",
      [
        { name: "type", value: "range" },
        { name: "min", value: 300 },
        { name: "max", value: 1500 },
        { name: "value", value: this.width },
      ],
      (value) => {
        this.width = value;
        this.setTransition(this.svg, "size").attr("width", this.width);
        console.log("New width of chart '" + this.id + "': " + this.svg.attr("width"));
        this.display();
      }
    );

    // Height controller
    this.createController(
      "Height: ",
      "height",
      [
        { name: "type", value: "range" },
        { name: "min", value: 200 },
        { name: "max", value: 800 },
        { name: "value", value: this.height },
      ],
      (value) => {
        this.height = value;
        this.setTransition(this.svg, "size").attr("height", this.height);
        this.display();
        console.log("New height of chart '" + this.id + "': " + this.height);
      }
    );

    // Padding controllers
    // X padding controller
    this.createController(
      "X Padding: ",
      "x-padding",
      [
        { name: "type", value: "range" },
        { name: "min", value: 0 },
        { name: "max", value: 150 },
        { name: "value", value: this.xPadding },
      ],
      (value) => {
        this.xPadding = value;
        this.display();
        console.log(
          "New x padding of chart '" + this.id + "': " + this.xPadding
        );
      }
    );

    // Y padding controller
    this.createController(
      "Y Padding: ",
      "y-padding",
      [
        { name: "type", value: "range" },
        { name: "min", value: 0 },
        { name: "max", value: 75 },
        { name: "value", value: this.yPadding },
      ],
      (value) => {
        this.yPadding = value;
        this.display();
        console.log(
          "New y padding of chart '" + this.id + "': " + this.yPadding
        );
      }
    );

    // **Transition controllers
    // Duration controller
    this.createController(
      "Duration: ",
      "duration",
      [
        { name: "type", value: "range" },
        { name: "min", value: 0 },
        { name: "max", value: 5000 },
        { name: "value", value: this.duration },
        { name: "step", value: 250 },
      ],
      (value) => {
        this.duration = value;
        console.log(
          "New duration of chart '" + this.id + "': " + this.duration
        );
      }
    );

    // Delay controller
    this.createController(
      "Delay: ",
      "delay",
      [
        { name: "type", value: "range" },
        { name: "min", value: 0 },
        { name: "max", value: 2000 },
        { name: "value", value: this.delay },
        { name: "step", value: 100 },
      ],
      (value) => {
        this.delay = value;
        console.log("New delay of chart '" + this.id + "': " + this.delay);
      }
    );

    // Ease effect controllers
    // including select and radio inputs
    this.easeController = this.chartControllers
      .append("fieldset")
      .classed("chart-controller ease", true);
    this.easeSelect = this.easeController
      .append("label")
      // .classed("chart-controller ease transition", true)
      .html("Ease:<br />")
      .append("select")
      .attr("id", this.id + "-ease-category");

    this.easeCategories = [
      "Linear",
      "Poly",
      "Quad",
      "Cubic",
      "Sin",
      "Exp",
      "Circle",
      "Elastic",
      "Back",
      "Bounce",
    ];
    this.easeTypes = ["In", "Out", "InOut"];

    this.easeCategories.forEach((category) => {
      this.easeSelect
        .append("option")
        .attr("value", "ease" + category)
        .text(category)
        .property("selected", category === "Elastic");
    });
    // console.log(this.easeSelect.node().value);

    this.easeTypes.forEach((type) => {
      this.easeController.append("label").html(`
          <input
            type="radio"
            name="${this.id}-ease-type"
            value="${type}"
            ${type === "Out" ? "checked" : ""}
          />
          ${type}`);
    });
  }

  get easeEffect() {
    const category = this.easeSelect.node().value;
    return d3[
      category +
        (category === "easeLinear"
          ? ""
          : this.easeController.select("input[type=radio]:checked").node()
              .value)
    ];
  }

  createButtons() {
    this.buttons = this.container
      .append("div")
      .classed("chart-buttons", true)
      .attr("id", this.id + "-buttons");

    this.buttons
      .append("button")
      .text("Add Data")
      .on("click", () => {
        this.addData(this.generateData());
      });

    this.buttons
      .append("button")
      .text("Update Data")
      .on("click", () => {
        this.updateData();
      });

    this.buttons
      .append("button")
      .text("Remove Data")
      .on("click", () => {
        this.removeData();
      });
  }

  createSvg() {
    this.svg = this.container
      .append("svg")
      .attr("id", this.id + "-svg")
      .attr("width", this.width)
      .attr("height", this.height)
      .classed("chart-svg", true);
  }

  createScales() {
    // Default scales for LINE chart, should be overrided for other types of chart
    this.xScale = d3.scaleTime();
    this.yScale = d3.scaleLinear();
  }

  createAxes() {
    // Default axes (x-bottom and y-left), should be overrided if needed
    this.xAxis = d3.axisBottom(this.xScale);
    this.yAxis = d3.axisLeft(this.yScale);

    this.svg
      .append("g")
      .classed("axis x", true)
      .attr("transform", "translate(0," + (this.height - this.yPadding) + ")");
    this.svg
      .append("g")
      .classed("axis y", true)
      .attr("transform", "translate(" + this.xPadding + ",0)");
  }

  updateScales() {
    // Default scales update, should be overrided if needed
    this.xScale
      .domain([
        d3.min(this.dataset, this.getX),
        d3.max(this.dataset, this.getX),
      ])
      .rangeRound([this.xPadding, this.width - this.xPadding]);

    this.yScale
      .domain([0, this.maxValue])
      .rangeRound([this.height - this.yPadding, this.yPadding]);
  }

  updateAxes() {
    // Default axes update, should be overrided if needed
    this.xAxis.ticks(this.width / 80);
    this.yAxis.ticks(
      d3.min([(this.height - this.yPadding * 2) / 50, this.maxValue]),
      ",.0d"
    );

    this.setTransition(this.svg.select("g.axis.x"))
      .attr("transform", "translate(0," + (this.height - this.yPadding) + ")")
      .call(this.xAxis);
    this.setTransition(this.svg.select("g.axis.y"))
      .attr("transform", "translate(" + this.xPadding + ",0)")
      .call(this.yAxis);
  }

  setTransition(selection, name) {
    return selection
      .transition(name)
      .duration(
        this.easeEffect === d3.easeLinear ? this.duration / 2 : this.duration
      )
      .delay((d, i) => (i * this.delay) / this.dataset.length)
      .ease(this.easeEffect);
  }

  addData(data) {
    console.log("Adding data to chart '" + this.id + "': " + data);
    this.dataset.push(data);
    this.display();
    this.tabulateDataset();
  }

  generateData() {
    let newData = Math.floor(
      Math.random() * (this.maxValue - this.minValue) + this.minValue
    );

    // console.log(newData);
    return newData;
  }

  updateData() {
    console.log("Updating data of chart '" + this.id + "'");
    this.dataset = this.dataset.map((d) => this.generateData());
    this.display();
  }

  removeData() {
    console.log("Removing data from chart '" + this.id + "'");
    console.log(this.dataset.pop());
    this.display();
  }

  display() {
    this.updateScales();
    this.updateAxes();
  }
}
