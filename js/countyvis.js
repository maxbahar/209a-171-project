class CountyVis {

    constructor(parentElement, countyData) {
        
        this.parentElement = parentElement;
        this.countyData = countyData;

        this.initVis();
        
    }

    initVis() {

        let vis = this;

        // Define width, height, and margins
        vis.margin = {top: 10, right: 10, bottom: 10, left: 10};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // Initialize SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
                    .attr("width", vis.width + vis.margin.left + vis.margin.right)
                    .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
                    .append("g")
                    .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        // Initialize tooltip
        vis.tooltip = d3.select("body").append('div')
                        .attr('class', "tooltip mapTooltip")
                        .attr("id","countyTooltip");

        vis.instruction = vis.svg.append("text").attr("y", vis.height / 4 * 3);
        vis.instruction.append("tspan").attr("x", vis.width/20).text("Click on a county");
        vis.instruction.append("tspan").attr("x", vis.width/20).attr("dy", "1.5em").text("to predict its voter turnout");

        vis.wrangleData();

    }

    wrangleData() {
        // No data wrangling is needed for this static viz
        let vis = this;
        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        // Get geography level
        vis.geoLevel = document.getElementById("geoLevel").value;

        // Project the GeoJSON
        vis.projection = d3.geoMercator()
                          .fitSize([vis.width, vis.height], vis.countyData);

        // Define geo generator
        vis.path = d3.geoPath()
                    .projection(vis.projection);

        vis.svg.selectAll(".geoFeature").remove();

        // Draw the geographic features
        vis.geoFeatures = vis.svg.selectAll(".geoFeature")
                                .data(vis.countyData.features)
                                .enter().append("path")
                                .attr('class', 'geoFeature')
                                .attr("d", vis.path)
                                .attr("fill", function(d) {
                                    if (d.properties["GEOID20"] == chosenFeature.properties["GEOID20"]) {
                                        return "#D33D17";
                                    } else {
                                        return "white";
                                    }
                                })
                                .attr("stroke", "#8F99A8")
                                .attr("stroke-width", 0.5);

        vis.geoFeatures.on("mouseover", function(event, d) {
            d3.select(this)
                .attr("stroke", "#D33D17")
                .attr("stroke-width", 5).raise();

            vis.tooltip.style("display", "grid")
                        .style("left", `${event.pageX + 20}px`)
                        .style("top", `${event.pageY}px`)
                        .html(`
                            <p style="margin: 0px">${d.properties["BASENAME"]} County</p>
                            `);
        
        }).on('mouseout', function(event, d) {
            d3.select(this)
                .attr("stroke", "#8F99A8")
                .attr("stroke-width", 0.5);
            vis.tooltip.style("display", "none");
        }).on("mousemove", function(event, d) {
            vis.tooltip.style("display", "grid")
                        .style("left", `${event.pageX + 20}px`)
                        .style("top", `${event.pageY}px`);
        }).on("click", function(event, d) {
            updateCounty(d);
            vis.updateColor();
        });

    }

    updateColor() {
        let vis = this;
        vis.geoFeatures.attr("fill", function(d) {
            if (d.properties["GEOID20"] == chosenFeature.properties["GEOID20"]) {
                return "#D33D17";
            } else {
                return "white";
            }
        })
    }

}