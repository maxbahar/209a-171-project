// Load the GeoJSON data
d3.json("data/counties.geojson").then(function (data) {
    // Calculate the overall mean turnout
    const overallMeanTurnout = d3.mean(data.features, d => d.properties["2020_turnout_pct"]);

    // Extract relevant information from GeoJSON
    const formattedData = data.features.map(d => ({
        county: d.properties.BASENAME,
        turnout_diff: d.properties["2020_turnout_pct"] - overallMeanTurnout,
        turnout: d.properties["2020_turnout_pct"], // For tooltip
        votes: {
            npp: d.properties.party_npp,
            dem: d.properties.party_dem,
            rep: d.properties.party_rep,
            lib: d.properties.party_lib,
            grn: d.properties.party_grn,
            con: d.properties.party_con,
            ain: d.properties.party_ain,
            scl: d.properties.party_scl,
            oth: d.properties.party_oth
        }
    }));

    // Default selected parties
    let selectedParties = ["dem", "rep"];

    // Create tooltip
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("padding", "10px")
        .style("background-color", "white")
        .style("border", "1px solid #ccc")
        .style("border-radius", "5px")
        .style("pointer-events", "none")
        .style("opacity", 0);

    // Chart dimensions and scales
    const margin = { top: 20, right: 30, bottom: 40, left: 100 };
    const width = 800 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

    const svg = d3.select("#diverging-bar-plot")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear()
        .domain([
            d3.min(formattedData, d => d.turnout_diff) - 0.01,
            d3.max(formattedData, d => d.turnout_diff) + 0.01
        ])
        .range([0, width]);

    const y = d3.scaleBand()
        .domain(formattedData.map(d => d.county))
        .range([0, height])
        .padding(0.2);

    const colorScale = d3
        .scaleOrdinal()
        .domain(Object.keys(formattedData[0].votes))
        .range(["#007bff", "#dc3545", "#28a745", "#ffc107", "#6f42c1", "#fd7e14", "#17a2b8", "#e83e8c", "#343a40"]);

    // Dropdowns for party selection
    const parties = Object.keys(formattedData[0].votes);
    d3.select("#party-selection").html(`
        <label for="party1">Party 1:</label>
        <select id="party1">
            ${parties.map(party => `<option value="${party}" ${party === "dem" ? "selected" : ""}>${party.toUpperCase()}</option>`).join("")}
        </select>
        <label for="party2">Party 2:</label>
        <select id="party2">
            ${parties.map(party => `<option value="${party}" ${party === "rep" ? "selected" : ""}>${party.toUpperCase()}</option>`).join("")}
        </select>
    `);

    d3.select("#party1").on("change", function () {
        selectedParties[0] = this.value;
        updateChart();
    });

    d3.select("#party2").on("change", function () {
        selectedParties[1] = this.value;
        updateChart();
    });

    // Function to update the chart
    function updateChart() {
        formattedData.forEach(d => {
            d.dominantParty = d.votes[selectedParties[0]] > d.votes[selectedParties[1]] ? selectedParties[0] : selectedParties[1];
        });

        // Clear existing elements
        svg.selectAll("*").remove();

        // Draw bars
        svg.selectAll(".bar")
            .data(formattedData)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", d => x(Math.min(0, d.turnout_diff)))
            .attr("y", d => y(d.county))
            .attr("width", d => Math.abs(x(d.turnout_diff) - x(0)))
            .attr("height", y.bandwidth())
            .style("fill", d => colorScale(d.dominantParty))
            .on("mouseover", (event, d) => {
                tooltip
                    .html(`<strong>${d.county}</strong><br>Turnout: ${(d.turnout * 100).toFixed(2)}%`)
                    .style("opacity", 1)
                    .style("left", `${event.pageX + 10}px`)
                    .style("top", `${event.pageY - 20}px`);
            })
            .on("mousemove", event => {
                tooltip
                    .style("left", `${event.pageX + 10}px`)
                    .style("top", `${event.pageY - 20}px`);
            })
            .on("mouseout", () => {
                tooltip.style("opacity", 0);
            });

        // Draw axes
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x).tickFormat(d3.format(".0%")));

        svg.append("g")
            .attr("class", "y axis")
            .call(d3.axisLeft(y));

        // Draw reference line for mean turnout
        svg.append("line")
            .attr("class", "reference-line")
            .attr("x1", x(0))
            .attr("x2", x(0))
            .attr("y1", 0)
            .attr("y2", height);

        // Annotate mean turnout
        svg.append("text")
            .attr("x", x(0) + 5)
            .attr("y", -5)
            .attr("fill", "black")
            .style("font-size", "12px")
            .style("font-weight", "bold")
            .text(`Mean Turnout: ${(overallMeanTurnout * 100).toFixed(2)}%`);

        // Update legend
        d3.select("#legend").html(`
            <div style="display: flex; gap: 10px;">
                <div style="display: flex; align-items: center;">
                    <div style="width: 20px; height: 20px; background-color: ${colorScale(selectedParties[0])}; margin-right: 5px;"></div>
                    <span>${selectedParties[0].toUpperCase()}</span>
                </div>
                <div style="display: flex; align-items: center;">
                    <div style="width: 20px; height: 20px; background-color: ${colorScale(selectedParties[1])}; margin-right: 5px;"></div>
                    <span>${selectedParties[1].toUpperCase()}</span>
                </div>
            </div>
        `);
    }

    // Initial chart render
    updateChart();
}).catch(function (error) {
    console.error("Error loading or processing the data:", error);
});