function chart3(data, isoData) {
  // Create an SVG container
  const chart = d3.select("#chart-3");
  const container = chart.select(".chart-container");
  const padding = { top: 20, right: 50, bottom: 80, left: 70 };

  // Map dimensions and projection
  let size = container.node().getBoundingClientRect();
  container.style("height", size.width / 2 + "px");
  size = container.node().getBoundingClientRect();
  // Set up SVG dimensions

  // Create SVG container
  const svg = chart
    .select(".chart-svg")
    .attr("width", "100%")
    .attr("height", "100%");

  // Parse region data from `ISO.csv`
  const regionByCountry = {};
  isoData.forEach((d) => {
    regionByCountry[d["alpha-3"]] = {
      "name": d.name,
      "region": d.region
    };
  });

  // Set up color scale for continents
  const regions = [...new Set(isoData.map((d) => d.region))];
  const colorScale = d3.scaleOrdinal(d3.schemeTableau10).domain(regions);

  // Set up scales for x, y, and bubble size
  const xScale = d3
    .scaleLinear()
    .range([padding.left, size.width - padding.right]);
  const yScale = d3.scaleLinear().range([size.height - padding.bottom, padding.top]);
  const sizeScale = d3.scaleSqrt().range([5, 30]); // Bubble size range (min/max radius)

  // Axes
  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3.axisLeft(yScale);

  // Add axes to SVG
  svg
    .append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0, ${size.height - padding.bottom})`);
  svg.append("g").attr("class", "y-axis").attr("transform", `translate(${padding.left}, 0)`);

  // Add axis labels
  svg
    .append("text")
    .attr("class", "x-label")
    .attr("x", size.width / 2)
    .attr("y", size.height - 30)
    .style("text-anchor", "middle")
    .text("Litres Per Capita");
  svg
    .append("text")
    .attr("class", "y-label")
    .attr("x", (-size.height + padding.bottom - padding.top) / 2)
    .attr("y",20)
    .style("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .text("Deaths");

  // Filter dropdowns
  d3.select("#cause-filter").on("change", updateChart);
  d3.select("#sex-filter").on("change", updateChart);
  d3.select("#unit-filter").on("change", updateChart);

  function updateChart() {
    // Get current filter values
    const causeFilter = d3.select("#cause-filter").property("value");
    const sexFilter = d3.select("#sex-filter").property("value");
    const unitFilter = d3.select("#unit-filter").property("value");

    // console.log(causeFilter, sexFilter, unitFilter);

    // Filter data based on dropdowns
    const filteredData = data.filter(
      (d) => (["RoadTraffic", "AllCause", "LiverCirrhosis"].includes(causeFilter)
          ? d.Cause === "Percent" + causeFilter
          : d.Cause === causeFilter + unitFilter)
        && d.Sex === sexFilter
    );

    if (["RoadTraffic", "AllCause", "LiverCirrhosis"].includes(causeFilter)) {
      currentUnit = "Percent";
      d3.select("#unit-filter").property("value", "Percent");
    }
    // console.log(filteredData);

    // Update scales
      xScale.domain(d3.extent(filteredData, (d) => +d.LitresPerCapita)).nice();
    yScale.domain(d3.extent(filteredData, (d) => +d.Deaths)).nice();
    sizeScale.domain(d3.extent(filteredData, (d) => +d.Population)).nice();

    // Update axes
    svg.select(".x-axis").call(xAxis);
    svg.select(".y-axis").call(yAxis);

    // Bind data to bubbles
    const bubbles = svg
      .selectAll(".bubble")
      .data(filteredData, (d) => d.AreaCode);

    console.log(regionByCountry);

    // Enter: Add new bubbles
    bubbles
      .enter()
      .append("circle")
      .attr("class", "bubble")
      .attr("cx", (d) => xScale(+d.LitresPerCapita))
      .attr("cy", (d) => yScale(+d.Deaths))
      .attr("r", (d) => sizeScale(+d.Population))
      .attr("fill", (d) => colorScale(regionByCountry[d.AreaCode].region))
      .attr("stroke", "#333")
      .attr("opacity", 0.8)
      .append("title") // Tooltip
      .text(
        (d) =>
          `${regionByCountry[d.AreaCode].name} (${d.AreaCode})\nLitres Per Capita: ${d.LitresPerCapita}\nDeaths: ${d.Deaths}\nPopulation: ${d.Population}`
      );

    // Update: Update existing bubbles
    bubbles
      .attr("cx", (d) => xScale(+d.LitresPerCapita))
      .attr("cy", (d) => yScale(+d.Deaths))
      .attr("r", (d) => sizeScale(+d.Population))
      .attr("fill", (d) => colorScale(regionByCountry[d.AreaCode].region))
      .select("title")
      .text(
        (d) =>
          `${regionByCountry[d.AreaCode].name} (${d.AreaCode})\nLitres Per Capita: ${d.LitresPerCapita}\nDeaths: ${d.Deaths}\nPopulation: ${d.Population}`
      );

    // Exit: Remove bubbles no longer in the data
    bubbles.exit().remove();
  }

  // Initialize chart with default filters
  updateChart();
}

// Load data and call the function
Promise.all([
  d3.csv("data/q3/population-consumption-deaths-2019-by-cause-and-sex.csv"),
  d3.csv("data/ISO-3166.csv"),
]).then(([data, isoData]) => {
  chart3(data, isoData);
});
