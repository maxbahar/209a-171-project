class CountyVis {

    constructor(parentElement, countyData) {
        
        this.parentElement = parentElement;
        this.countyData = countyData;

        this.initVis();
        
    }

    initVis() {

        let vis = this;

        vis.margin = {top: 20, right: 20, bottom: 20, left: 20};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // Initialize SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
                    .attr("width", vis.width + vis.margin.left + vis.margin.right)
                    .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
                    .append("g")
                    .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        vis.wrangleData();

    }

    wrangleData() {
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
                                        return "purple";
                                    } else {
                                        return "white";
                                    }
                                })
                                .attr("stroke", "#333")
                                .attr("stroke-width", 0.5);

    }

}