// Load the GeoJSON data
d3.json("data/counties.geojson").then(function (data) {
    const overallMeanTurnout = d3.mean(data.features, d => d.properties["2020_turnout_pct"]);

    // Format data
    const formattedData = data.features.map(d => ({
        county: d.properties.BASENAME,
        turnout_diff: d.properties["2020_turnout_pct"] - overallMeanTurnout,
        turnout: d.properties["2020_turnout_pct"],
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

    // Define long party names
    const partyFullNames = {
        dem: "Democrat",
        rep: "Republican",
        npp: "No Party Preference",
        lib: "Libertarian",
        grn: "Green",
        con: "Conservative",
        ain: "American Independent",
        scl: "Socialist",
        oth: "Other"
    };

    // Choose default values
    let selectedParties = ["dem", "rep"];

    // Initialize tooltip
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("padding", "10px")
        .style("background-color", "white")
        .style("border", "1px solid #ccc")
        .style("border-radius", "5px")
        .style("pointer-events", "none")
        .style("opacity", 0);

    // Create SVG
    const margin = { top: 50, right: 30, bottom: 40, left: 100 };
    const width = document.getElementById("diverging-bar-plot-container").getBoundingClientRect().width - margin.left - margin.right;
    const height = document.getElementById("diverging-bar-plot-container").getBoundingClientRect().height - margin.top - margin.bottom;

    const svg = d3.select("#diverging-bar-plot")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Define scales
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

    const colorScales = {
        dem: d3.scaleLinear().domain([0, 1]).range(["#d6e9f9", "#0056b3"]), // Light blue to dark blue
        rep: d3.scaleLinear().domain([0, 1]).range(["#f9d6d6", "#b30000"]), // Light red to dark red
        npp: d3.scaleLinear().domain([0, 1]).range(["#e0e0e0", "#606060"]), // Light grey to dark grey
        lib: d3.scaleLinear().domain([0, 1]).range(["#e8d6f9", "#6a00b3"]), // Light purple to dark purple
        grn: d3.scaleLinear().domain([0, 1]).range(["#d6f9d6", "#00b300"]), // Light green to dark green
        con: d3.scaleLinear().domain([0, 1]).range(["#f9e6d6", "#b37400"]), // Light orange to dark orange
        ain: d3.scaleLinear().domain([0, 1]).range(["#f9d6e9", "#b30056"]), // Light pink to dark pink
        scl: d3.scaleLinear().domain([0, 1]).range(["#d6f3f9", "#008080"]), // Light teal to dark teal
        oth: d3.scaleLinear().domain([0, 1]).range(["#f9f0d6", "#b38c00"])  // Light yellow to dark yellow
    };

    // Add party dropdown options
    const parties = Object.keys(formattedData[0].votes);
    d3.select("#party-selection").html(`
        <label for="party1" style="margin-left: 20px" class="map-dropdown-label">Party 1:</label>
        <select id="party1">
            ${parties.map(party => `<option value="${party}" ${party === "dem" ? "selected" : ""}>${partyFullNames[party]}</option>`).join("")}
        </select>
        <label for="party2" style="margin-left: 20px" class="map-dropdown-label">Party 2:</label>
        <select id="party2">
            ${parties.map(party => `<option value="${party}" ${party === "rep" ? "selected" : ""}>${partyFullNames[party]}</option>`).join("")}
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

    // Update chart on dropdown change
    function updateChart() {
        formattedData.forEach(d => {
            const totalVotes = Object.values(d.votes).reduce((a, b) => a + b, 0);
            d.dominantParty = d.votes[selectedParties[0]] > d.votes[selectedParties[1]] ? selectedParties[0] : selectedParties[1];
            d.dominantPartyProportion = d.votes[d.dominantParty] / totalVotes || 0;
        });

        svg.selectAll("*").remove();

        // Update the bars
        svg.selectAll(".bar")
            .data(formattedData)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", d => x(Math.min(0, d.turnout_diff)))
            .attr("y", d => y(d.county))
            .attr("width", d => Math.abs(x(d.turnout_diff) - x(0)))
            .attr("height", y.bandwidth())
            .style("fill", d => colorScales[d.dominantParty](d.dominantPartyProportion))
            .on("mouseover", (event, d) => {
                tooltip
                    .html(`<strong>${d.county}</strong><br>Turnout: ${(d.turnout * 100).toFixed(2)}%<br>${d.dominantParty.toUpperCase()} Proportion: ${(d.dominantPartyProportion * 100).toFixed(2)}%`)
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

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x).tickFormat(d3.format(".0%")));

        svg.append("g")
            .attr("class", "y axis")
            .call(d3.axisLeft(y));

        svg.append("line")
            .attr("class", "reference-line")
            .attr("x1", x(0))
            .attr("x2", x(0))
            .attr("y1", 0)
            .attr("y2", height);

        svg.append("text")
            .attr("x", x(0) + 5)
            .attr("y", -5)
            .attr("fill", "black")
            .style("font-size", "12px")
            .style("font-weight", "bold")
            .text(`Mean Turnout: ${(overallMeanTurnout * 100).toFixed(2)}%`);

        // Update legend
        d3.select("#legend").html(`
        <div style="display: flex; gap: 10px; align-items: center;">
            <div style="display: flex; align-items: center;">
                <div style="width: 20px; height: 20px; background-color: ${colorScales[selectedParties[0]](0.7)}; margin-right: 5px;"></div>
                <span>${partyFullNames[selectedParties[0]]}</span>
            </div>
            <div style="display: flex; align-items: center;">
                <div style="width: 20px; height: 20px; background-color: ${colorScales[selectedParties[1]](0.7)}; margin-right: 5px;"></div>
                <span>${partyFullNames[selectedParties[1]]}</span>
            </div>
        </div>
    `);
    }

    updateChart();
}).catch(function (error) {
    console.error("Error loading or processing the data:", error);
});
