class ImportanceVis {

    constructor(parentElement, shapData) {
        this.parentElement = parentElement;
        this.shapData = shapData;

        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.width = 1000;
        vis.height = 800;
        vis.margin = [50, 60, 50, 100];
        vis.svg = d3
            .select("#" + vis.parentElement)
            .append("svg")
            .attr("height", vis.height)
            .attr("width", vis.width);

        vis.wrangleData();

    }

    wrangleData() {
        let vis = this;

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        // the rest of our d3 code will go here
        console.log(vis.shapData)
        // a Set is a convenient way to remove duplicates
        let sectors = Array.from(new Set(vis.shapData.map((d) => d.variable)));

        let xScale = d3
            .scaleLinear()
            .domain(d3.extent(vis.shapData.map((d) => +d["value"])))
            .range([vis.margin[3], vis.width - vis.margin[1]]);

        console.log("shap value range")
        console.log(d3.extent(vis.shapData.map((d) => +d["value"])))
        console.log("color range")
        console.log(d3.extent(vis.shapData.map((d) => +d["color"])))

        let yScale = d3
            .scaleBand()
            .domain(sectors)
            .range([vis.height - vis.margin[2], vis.margin[0]]);

        const xAxis = d3.axisBottom(xScale);

        let colorScale = d3.scaleLinear()
            .range(["blue", "red"]); // Choose your color range

        vis.svg.selectAll(".circ")
            .data(vis.shapData)
            .enter()
            .append("circle")
            .attr("class", "circ")
            .attr("r", 3)
            .attr("fill", (d) => colorScale(d.color))
            .attr("cx", (d) => xScale(d.value))
            .attr("cy", (d) => yScale(d.variable));

        vis.svg.append("g")
            .attr("transform", `translate(0, ${vis.height - 50})`) // Position the axis at the bottom
            .call(xAxis);

        // Add the x-axis label
        vis.svg.append("text")
            .attr("class", "x-axis-label")
            .attr("x", vis.width / 2)
            .attr("y", vis.height - 10)
            .attr("text-anchor", "middle")
            .text("SHAP value (impact on model output)");

        vis.svg.append("line")
            .attr("x1", xScale(0))
            .attr("y1", 0) // Top of the plot
            .attr("x2", xScale(0))
            .attr("y2", vis.height-50) // Bottom of the plot
            .attr("stroke", "grey"); // Style the line as needed

        const colorScale2 = d3.scaleLinear()
            .domain([0, 100]) // Adjust to your data range
            .range(["red", "blue"]); // Choose your color range

        const legend = vis.svg.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(${vis.width-50}, 0)`); // Position the legend

        const legendHeight = vis.height-50; // Adjust to your preference

        const legendGradient = legend.append("defs")
            .append("linearGradient")
            .attr("id", "legend-gradient")
            .attr("x1", "0%")
            .attr("y1", "0%")
            .attr("x2", "0%")
            .attr("y2", "100%");

        legendGradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", colorScale2.range()[0]);

        legendGradient.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", colorScale2.range()[1]);

        legend.append("rect")
            .attr("width", 10)
            .attr("height", legendHeight)
            .style("fill", "url(#legend-gradient)");

        // Add the y-axis label
        vis.svg.append("text")
            .attr("class", "y-axis-label")
            .attr("transform", "rotate(-90)")
            .attr("x", -vis.height/2)
            .attr("y", vis.width - 17)
            .attr("text-anchor", "middle")
            .text("Feature value");

        vis.svg.append("text")
            .attr("x", vis.width -17)
            .attr("y", 20)
            .attr("text-anchor", "middle")
            .text("High");

        vis.svg.append("text")
            .attr("x", vis.width -17)
            .attr("y", vis.height-60)
            .attr("text-anchor", "middle")
            .text("Low");
    }
}
