class SentimentChart {
    constructor(data) {
        const demographicMapping = {
            "Demographic Group 1": "Male",
            "Demographic Group 2": "Female",
            "Demographic Group 3": "European-Descent",
            "Demographic Group 4": "Asian",
            "Demographic Group 5": "Hispanic"
        };

        // Count records per network
        const networkCounts = {};
        data.forEach((d) => {
            networkCounts[d.network] = (networkCounts[d.network] || 0) + 1;
        });

        console.log("Network Counts:", networkCounts);

        this.MINIMUM_THRESHOLD = 500;
        const filteredData = data.filter(
            (d) => networkCounts[d.network] > this.MINIMUM_THRESHOLD
        );

        console.log("Filtered Data (after threshold):", filteredData);

        if (filteredData.length === 0) {
            console.error("No data available after filtering.");
            return;
        }

        // Extract valid date range
        this.minDate = d3.min(filteredData, (d) => d.date).getTime();
        this.maxDate = d3.max(filteredData, (d) => d.date).getTime();

        this.setupSlider(filteredData, demographicMapping);
        this.updateByNetwork(filteredData, demographicMapping);
    }

    setupSlider(data, demographicMapping) {
        const slider = document.getElementById("slider");

        noUiSlider.create(slider, {
            start: [this.minDate, this.maxDate],
            connect: true,
            behaviour: "drag",
            range: {
                min: this.minDate,
                max: this.maxDate,
            },
            tooltips: [
                {
                    to: (value) => {
                        const date = new Date(parseInt(value));
                        return d3.timeFormat("%b %d, %Y")(date);
                    },
                },
                {
                    to: (value) => {
                        const date = new Date(parseInt(value));
                        return d3.timeFormat("%b %d, %Y")(date);
                    },
                },
            ],
        });

        slider.noUiSlider.on("slide", (values) => {
            const selectedMinDate = new Date(+values[0]);
            const selectedMaxDate = new Date(+values[1]);

            const filteredData = data.filter(
                (d) =>
                    d.date >= selectedMinDate &&
                    d.date <= selectedMaxDate
            );

            this.updateByNetwork(filteredData, demographicMapping);
        });
    }

    updateByNetwork(data, demographicMapping) {
        const networks = Array.from(new Set(data.map((d) => demographicMapping[d.network] || d.network)))
            .sort(d3.ascending);

        const avgScores = d3
            .rollups(
                data,
                (v) => d3.mean(v, (d) => d.score),
                (d) => d.network,
                (d) => d.party
            )
            .map(([network, partyData]) =>
                partyData.map(([party, avgScore]) => ({
                    network: demographicMapping[network] || network, // Apply the mapping
                    party,
                    avgScore
                }))
            )
            .flat();

        const scoreMap = new Map(
            avgScores.map((d) => [`${d.network}_${d.party}`, d.avgScore])
        );

        const getScore = (network, party) =>
            scoreMap.get(`${network}_${party}`) || 0;

        const democratSentiment = networks.map((network) =>
            getScore(network, "Democrat")
        );
        const republicanSentiment = networks.map((network) =>
            getScore(network, "Republican")
        );

        this.createOrUpdateChart(networks, democratSentiment, republicanSentiment);
    }

    createOrUpdateChart(names, leftData, rightData) {
        const svg = d3
            .select("#by-network")
            .selectAll("svg")
            .data([null]);

        const chart = svg
            .enter()
            .append("svg")
            .merge(svg)
            .attr("width", 960)
            .attr("height", names.length * 40 + 40);

        const xFrom = d3
            .scaleLinear()
            .domain([0, d3.max(leftData)])
            .range([0, 400]);

        const xTo = d3
            .scaleLinear()
            .domain([0, d3.max(rightData)])
            .range([0, 400]);

        const y = d3
            .scaleBand()
            .domain(names)
            .range([30, names.length * 40]) 
            .padding(0.2);

        // Left bars
        chart
            .selectAll(".left")
            .data(leftData)
            .join("rect")
            .attr("class", "left")
            .attr("x", (d) => 430 - xFrom(d) - 20) 
            .attr("y", (d, i) => y(names[i]) + 10)
            .attr("width", (d) => xFrom(d))
            .attr("height", y.bandwidth())
            .attr("fill", "#007BFF"); // Democrat blue

        // Left bar percentages
        chart
            .selectAll(".left-text")
            .data(leftData)
            .join("text")
            .attr("class", "left-text")
            .attr("x", (d) => 480 - xFrom(d) - 60) 
            .attr("y", (d, i) => y(names[i]) + y.bandwidth() / 2 + 10)
            .attr("dy", ".35em")
            .attr("fill", "white")
            .style("font-size", "12px")
            .text((d) => `${Math.round(d * 100)}%`);

        // Right bars
        chart
            .selectAll(".right")
            .data(rightData)
            .join("rect")
            .attr("class", "right")
            .attr("x", 550) 
            .attr("y", (d, i) => y(names[i]) + 10)
            .attr("width", (d) => xTo(d))
            .attr("height", y.bandwidth())
            .attr("fill", "#DC3545"); // Republican red

        // Right bar percentages
        chart
            .selectAll(".right-text")
            .data(rightData)
            .join("text")
            .attr("class", "right-text")
            .attr("x", (d) => 500 + xTo(d) + 15)
            .attr("y", (d, i) => y(names[i]) + y.bandwidth() / 2 + 10)
            .attr("dy", ".35em")
            .attr("fill", "white")
            .style("font-size", "12px")
            .style("text-anchor", "start")
            .text((d) => `${Math.round(d * 100)}%`);

        // Network labels
        chart
            .selectAll(".label")
            .data(names)
            .join("text")
            .attr("class", "label")
            .attr("x", 480)
            .attr("y", (d) => y(d) + y.bandwidth() / 2 + 5)
            .attr("dy", ".35em")
            .attr("text-anchor", "middle")
            .style("font-size", "14px")
            .text((d) => d);
    }
}

// Dummy data for rendering purposes
const data = Array.from({ length: 3000 }, (_, i) => ({
    date: new Date(
        2023,
        Math.floor(Math.random() * 12),
        Math.ceil(Math.random() * 28)
    ),
    network: `Demographic Group ${Math.ceil(Math.random() * 5)}`,
    score: Math.random(),
    party: Math.random() > 0.5 ? "Democrat" : "Republican",
}));

for (let i = 0; i < 1500; i++) {
    data.push({
        date: new Date(2023, Math.floor(Math.random() * 12), Math.ceil(Math.random() * 28)),
        network: "Demographic Group 1",
        score: Math.random(),
        party: Math.random() > 0.5 ? "Democrat" : "Republican",
    });
}

new SentimentChart(data);