class MapVis {

    constructor(parentElement, blockGroupData, tractData, countyData) {
        
        this.parentElement = parentElement;
        this.blockGroupData = blockGroupData;
        this.tractData = tractData;
        this.countyData = countyData;

        this.initVis()
        
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

        //////////////////////////////////////////////// PROTOTYPE //////////////////////////////////////////////////

        // Add a zoomable `g` element
        vis.g = vis.svg.append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        // Define the zoom behavior
        vis.zoom = d3.zoom()
            .scaleExtent([1, 8]) // Define zoom scale limits
            .translateExtent([[0, 0], [vis.width, vis.height]]) // Limit panning
            .on("zoom", function (event) {
                vis.g.attr("transform", event.transform); // Apply zoom transformations
            });

        // Apply the zoom behavior to the SVG
        vis.svg.call(vis.zoom);

        //////////////////////////////////////////////// PROTOTYPE //////////////////////////////////////////////////

        // Project the GeoJSON
        vis.projection = d3.geoMercator()
                          .fitSize([vis.width, vis.height], vis.blockGroupData);

        // Define geo generator
        vis.path = d3.geoPath()
                    .projection(vis.projection);

        // Draw the geographic features
        vis.blockGroups = vis.svg.selectAll(".blockGroup")
                                .data(vis.blockGroupData.features) // Make sure to use .features
                                .enter().append("path")
                                .attr('class', 'blockGroup')
                                .attr("d", vis.path)
                                .attr("fill", "#ccc")
                                .attr("stroke", "#333")
                                .attr("stroke-width", 0.1);
                                
        // Initialize the color scale
        vis.colorScale = d3.scaleSequential(d3.interpolatePurples);

        vis.wrangleData();

    }

    wrangleData() {
        let vis = this;

        vis.variable = 'total_reg' // Hardcoded currently

        // Nothing for now, as the data is cleaned already, simply copy the initial data to displayData
        vis.displayData = {
            "name": "blockGroupDisplayData",
            "type": "FeatureCollection",
            "features": []
        }
        vis.displayData.features = vis.blockGroupData.features.map(function(d) {
            return {
                "GEOID20": d.properties["GEOID20"],
                "2020_turnout": d.properties["g20201103_pct_voted_all"], // Hardcoded right now
                "2020_absent": 1 - d.properties["g20201103_pct_voted_all"], // Hardcoded right now
                [vis.variable]: d.properties[vis.variable]
            }
        });

        // Optionally log data
        // console.log(vis.displayData);

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        // Update the color scale
        vis.variableArray = vis.displayData.features.map(d => d[vis.variable]);
        vis.colorScale.domain([d3.min(vis.variableArray),d3.max(vis.variableArray)]);

        // Change the feature colors
        vis.blockGroups = vis.svg.selectAll('.blockGroup')
                                    .data(vis.displayData.features)
                                    .enter().append("path")
                                    .merge(vis.blockGroups)
                                    .attr("fill", d => vis.colorScale(d[vis.variable]));

    }
}