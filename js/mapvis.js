class MapVis {

    constructor(parentElement, blockGroupData, tractData, countyData, variable) {
        
        this.parentElement = parentElement;
        this.geoData = {
            "blockGroup" : blockGroupData,
            "tract": tractData,
            "county" : countyData
        };
        this.variable = variable;

        console.log(this.geoData);

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

/////////////////////// HARDCODED
        vis.geoLevel = "county";
        vis.geoLevel = document.getElementById("geoLevel").value;
        console.log(vis.geoLevel);  

        // Project the GeoJSON
        vis.projection = d3.geoMercator()
                          .fitSize([vis.width, vis.height], vis.geoData[vis.geoLevel]);

        // Define geo generator
        vis.path = d3.geoPath()
                    .projection(vis.projection);

        // Draw the geographic features
        vis.geoFeatures = vis.svg.selectAll(".geoFeature")
                                .data(vis.geoData[vis.geoLevel].features) // Make sure to use .features
                                .enter().append("path")
                                .attr('class', 'geoFeature')
                                .attr("d", vis.path)
                                .attr("fill", "#ccc")
                                .attr("stroke", "#333")
                                .attr("stroke-width", 0.1);
                                
        // Initialize the color scale
        vis.colorScale = d3.scaleSequential(d3.interpolatePurples);

        // Initialize tooltip
        vis.tooltip = d3.select("body").append('div')
                        .attr('class', "tooltip")
                        .attr('id', 'mapTooltip');

        vis.wrangleData();

    }

    wrangleData() {
        let vis = this;
        
        // vis.variable = '2020_absent_pct' 

        vis.displayData = {
            "name": "displayData",
            "type": "FeatureCollection",
            "features": []
        }
        vis.displayData.features = vis.geoData[vis.geoLevel].features.map(function(d) {
            return {
                "GEOID20": d.properties["GEOID20"],
                "name" : d.properties["BASENAME"],
                [vis.variable]: d.properties[vis.variable]
            }
        });

        // Optionally log data
        console.log(vis.displayData);

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        // Update the color scale
        vis.variableArray = vis.displayData.features.map(d => d[vis.variable]);
        vis.colorScale.domain([d3.min(vis.variableArray),d3.max(vis.variableArray)]);

        // Change the feature colors
        vis.geoFeatures = vis.svg.selectAll('.geoFeature')
                                    .data(vis.displayData.features)
                                    .enter().append("path")
                                    .merge(vis.geoFeatures)
                                    .attr("fill", d => vis.colorScale(d[vis.variable]));

        // Mouseover behavior
        vis.geoFeatures.on('mouseover', function(event, d){

            d3.select(this)
                .attr('fill', 'white');

            vis.tooltip.style("opacity", 1)
                    .style("left", event.pageX + 20 + "px")
                    .style("top", event.pageY + "px")
///////////////////// TOOLTIP HARDCODED RIGHT NOW 
                    .html(`
                        <h4>${d["name"]} County</h4>
                        <div style="font-size: 14pt"><span style="font-weight:600">${vis.variable}: </span>${d[vis.variable].toLocaleString()}</div>
                        `); 

        }).on('mouseout', function(event, d){

            d3.select(this)
                .attr("fill", d => vis.colorScale(d[vis.variable]));

            vis.tooltip.style("opacity", 0)
                        .style("left", 0)
                        .style("top", 0)    
                        .html(``);
        })
            
        // Click behavior
        vis.geoFeatures.on("click", function(event, d){
    
            // Do something here?
    
        });

    }
}