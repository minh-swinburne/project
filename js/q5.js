function chart5(geoData) {
  // Function to load data and update map
  function loadData(id) {
    const file = chart.select(`button[data-id="${id}"]`).attr("data-file");
    d3.csv("data/q5/" + file).then((data) => {
      currentData = data; // Save loaded data globally

      chart.select(".filters").style("display", "block");

      if (id === "2") {
        chart.select(".filters").style("display", "none");
        currentKey = "Status";
        currentUnit = "";
      } else {
        let newFilter;

        if (id === "1") {
          newFilter = "Driver Type";
          currentKey = "Limit";
          currentUnit = "g/dl";
        } else if (id === "2") {
          newFilter = "Beverage Type";
        }

        currentFilter = newFilter.split(" ").join("");
        filterValues = [...new Set(data.map((d) => d[currentFilter]))];
        currentFilterValue = filterValues[0];

        filterLabel.text(newFilter + ":");
        filter
          .selectAll("option")
          .data(filterValues)
          .join("option")
          .text((d) => d)
          .attr("value", (d) => d);
        filter.property("value", currentFilterValue);
      }

      if (id !== currentId) {
        currentId = id;
      }

      updateMap();
    });
  }

  // Function to update the map based on current filters
  function updateMap() {
    const filteredData = currentData.filter(
      (d) => d[currentFilter] === currentFilterValue || currentId === "2"
    );
    // console.log(currentFilter);
    // console.log(currentFilterValue);
    // console.log(filteredData);

    const dataByCountry = {};
    filteredData.forEach((d) => {
      dataByCountry[d.AreaCode] = +d[currentKey];
    });

    let domain = d3.extent(Object.values(dataByCountry));
    colorScale.domain(domain);
    drawLegend(colorScale, svg);

    // Bind data and update the map
    svg
      .selectAll("path")
      .data(geoData.features)
      .join("path")
      .attr("d", path)
      .attr("fill", (d) => {
        const value = dataByCountry[d.id];
        return value !== undefined ? colorScale(value) : "#ccc";
      })
      .attr("stroke", "#333")
      .attr("stroke-width", 0.5)
      .on("mouseover", mouseOver)
      .on("mousemove", mouseMove)
      .on("mouseout", mouseOut);
  }

  function drawLegend(colorScale, svg) {
    // Legend dimensions
    const legendHeight = 10; // Height of the gradient
    const legendWidth = size.width * 0.8; // Legend spans 80% of the SVG width
    const legendX = (size.width - legendWidth) / 2; // Centered horizontally
    const legendY = 30; // Position at the bottom
    const tickSize = 6; // Tick height

    // Remove any existing legend
    svg.select("g.legend").remove();
    container.style("height", size.width / 2 + 50 + "px");
    // svg.attr("height", size.width / 2 + 50);

    // Create legend group
    const legendGroup = svg
      .append("g")
      .attr("class", "legend")
      .attr(
        "transform",
        `translate(${legendX}, ${size.width / 2 + 50 - legendY})`
      );

    // Get the range and corresponding domain
    const colorRange = colorScale.range(); // Array of colors
    const colorDomain = colorRange.map(colorScale.invertExtent); // Value ranges for each color
    const cellWidth = legendWidth / (colorRange.length + 2);

    // Add color boxes
    legendGroup
      .selectAll("rect")
      .data(colorDomain)
      .enter()
      .append("rect")
      .attr("x", (d, i) => (i + 2) * cellWidth)
      .attr("y", 0)
      .attr("width", cellWidth)
      .attr("height", legendHeight)
      .attr("stroke", "#666")
      .attr("fill", (d, i) => colorRange[i]);

    // Add "No Data" cell
    legendGroup
      .append("rect")
      .data([[null, null]])
      .attr("x", 0) // Position the "No Data" cell to the left
      .attr("width", cellWidth)
      .attr("height", legendHeight)
      .attr("fill", "#ccc")
      .attr("stroke", "#666");

    legendGroup
      .append("text")
      .attr("x", cellWidth / 2)
      .attr("y", legendHeight + 15)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .text("No Data");

    // Create scale for ticks
    const legendScale = d3
      .scaleLinear()
      .domain(colorScale.domain())
      .range([cellWidth * 2, legendWidth]);

    // console.log(d3.ticks(...colorScale.domain(), domainSize));

    // Add ticks
    const axis = d3
      .axisBottom(legendScale)
      .ticks(domainSize)
      .tickSize(tickSize);

    legendGroup
      .append("g")
      .attr("transform", `translate(0, ${legendHeight})`)
      .call(axis)
      .select(".domain")
      .remove(); // Remove the axis line
  }

  // Show tooltip
  function mouseOver(event, d) {
    const value = currentData.find(
      (e) =>
        e.AreaCode === d.id &&
        (e[currentFilter] === currentFilterValue || currentId === "2")
    );

    let data = "No Data";
    if (value) {
      data = !isNaN(+value[currentKey])
        ? (+value[currentKey]).toFixed(3)
        : value[currentKey] + " " + currentUnit;
    }
    container
      .select(".tooltip")
      .style("display", "block")
      .html(`${d.properties.name} - ${currentFilterValue}: ${data} ${currentUnit}`);

    svg.selectAll("path").attr("stroke-width", 0.5);
    d3.select(this).attr("stroke-width", 2);

    // console.log(+value.LitresPerCapita);
    svg
      .selectAll(".legend rect")
      .filter((d, i) => {
        // console.log(d);
        if (value === undefined) {
          return d[0] === null;
        }
        return (
          d[0] <= +value[currentKey] &&
          +value[currentKey] <= d[1] &&
          d[0] !== null
        );
      })
      .attr("stroke", "black")
      .attr("stroke-width", "2px");
  }

  // Move tooltip with mouse
  function mouseMove(event) {
    const [x, y] = d3.pointer(event);
    const svgBounds = svg.node().getBoundingClientRect();

    // Adjust tooltip position based on SVG's offset
    container
      .select(".tooltip")
      .style("top", `${y - 10 + svgBounds.top}px`) // Add 10px offset for better placement
      .style("left", `${x + 20 + svgBounds.left}px`);
  }

  // Hide tooltip
  function mouseOut() {
    container.select(".tooltip").style("display", "none");
    d3.select(this).attr("stroke-width", 0.5);
    svg
      .selectAll(".legend rect")
      .attr("stroke", "#666")
      .attr("stroke-width", 0.5);
  }

  // Create an SVG container
  const chart = d3.select("#chart-5");
  const container = chart.select(".chart-container");
  const svg = chart
    .select(".chart-svg")
    .attr("width", "100%")
    .attr("height", "100%");

  // Map dimensions and projection
  let size = container.node().getBoundingClientRect();
  container.style("height", size.width / 2 + "px");

  const dataButtons = chart.selectAll(".data-toggle button");
  const filter = chart.select(".filter-select");
  const filterLabel = chart.select(".filter-label");

  // Button click handler to switch files
  dataButtons.on("click", function () {
    dataButtons.classed("active", false);
    this.classList.add("active");
    loadData(this.getAttribute("data-id"));
  });

  // Dropdown change handler for RecordStatus
  filter.on("change", function () {
    currentFilterValue = this.value;
    updateMap();
  });

  window.addEventListener("resize", () => {
    size = container.node().getBoundingClientRect();
    projection.fitSize([size.width, size.width / 2], geoData);
    updateMap();
  });

  // Geo projection and path generator
  const projection = d3
    .geoEqualEarth()
    .fitSize([size.width, size.width / 2], geoData);
  const path = d3.geoPath().projection(projection);

  // Define color scale
  const domainSize = 10;
  const colorRange = d3.range(0, 1, 1 / domainSize).map(d3.interpolateYlGnBu);
  const colorScale = d3.scaleQuantize().range(colorRange);

  // Global variables to track state
  let currentData = null;
  let currentId = "1";
  let currentFilterValue = "Total";
  let currentKey = "Limit";
  let currentUnit = "g/dl";

  loadData(currentId); // Load the first tabulateDataset
}
