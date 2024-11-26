function drawLegend(colorScale, svg) {
  // Legend settings
  const legendWidth = 300; // Width of the legend bar
  const legendHeight = 10; // Height of each color box
  const legendMargin = 10; // Margin around the legend
  const legendX = 20; // X position of the legend
  const legendY = 20; // Y position of the legend

  // Create a group for the legend
  const legendGroup = svg
    .append("g")
    .attr("class", "legend")
    .attr("transform", `translate(${legendX}, ${legendY})`);

  // Get the range and corresponding domain
  const colorRange = colorScale.range(); // Array of colors
  const colorDomain = colorRange.map(colorScale.invertExtent); // Value ranges for each color

  // Add color boxes
  legendGroup
    .selectAll("rect")
    .data(colorDomain)
    .enter()
    .append("rect")
    .attr("x", (d, i) => i * (legendWidth / colorRange.length))
    .attr("y", 0)
    .attr("width", legendWidth / colorRange.length)
    .attr("height", legendHeight)
    .attr("fill", (d, i) => colorRange[i]);

  // Add text labels
  legendGroup
    .selectAll("text")
    .data(colorDomain)
    .enter()
    .append("text")
    .attr(
      "x",
      (d, i) =>
        i * (legendWidth / colorRange.length) +
        legendWidth / colorRange.length / 2
    )
    .attr("y", legendHeight + legendMargin)
    .attr("text-anchor", "middle")
    .attr("font-size", "10px")
    .attr("fill", "#333")
    .text((d) => `${d[0].toFixed(1)} - ${d[1].toFixed(1)}`);
}
