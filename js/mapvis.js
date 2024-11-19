class MapVis {

    constructor(parentElement, blockGroupData, tractData, countyData, variable) {
        
        this.parentElement = parentElement;
        this.geoData = {
            "blockGroup" : blockGroupData,
            "tract": tractData,
            "county" : countyData
        };
        this.variable = variable;

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

///////////////////// COLORSCALE HARDCODED RIGHT NOW 
        // Initialize the color scale
        switch(vis.variable) {
            case '2020_absent_pct':
                vis.colorScale = d3.scaleSequential(d3.interpolatePurples);
                break;
            case "total_reg":
                vis.colorScale = d3.scaleSequential(d3.interpolateReds);
                break;
            case "mean_hh_income":
                vis.colorScale = d3.scaleSequential(d3.interpolateBlues);
                break;
            default:
                vis.colorScale = d3.scaleSequential(d3.interpolateGreys);
        }
        // vis.colorScale = d3.scaleSequential(vis.variable == "2020_absent_pct" ? d3.interpolatePurples);

        // Initialize tooltip
        vis.tooltip = d3.select("body").append('div')
                        .attr('class', "tooltip")
                        .attr('id', 'mapTooltip');

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

        // Update the color scale
        vis.variableArray = vis.geoData[vis.geoLevel].features.map(d => d.properties[vis.variable]);
        vis.colorScale.domain([d3.min(vis.variableArray),d3.max(vis.variableArray)]);



        //////////////////////////////////////////////// PROTOTYPE //////////////////////////////////////////////////

        // Project the GeoJSON
        vis.projection = d3.geoMercator()
                          .fitSize([vis.width, vis.height], vis.geoData[vis.geoLevel]);

        // Define geo generator
        vis.path = d3.geoPath()
                    .projection(vis.projection);

        vis.svg.selectAll(".geoFeature").remove();

        // Draw the geographic features
        vis.geoFeatures = vis.svg.selectAll(".geoFeature")
                                .data(vis.geoData[vis.geoLevel].features)
                                .enter().append("path")
                                .attr('class', 'geoFeature')
                                .attr("d", vis.path)
                                .attr("fill", "#ccc")
                                .attr("stroke", "#333")
                                .attr("stroke-width", 0.1);

        //////////////////////////////////////////////// PROTOTYPE //////////////////////////////////////////////////

        

        // Change the feature colors
        vis.geoFeatures = vis.svg.selectAll('.geoFeature')
                                    .data(vis.geoData[vis.geoLevel].features)
                                    .enter().append("path")
                                    .merge(vis.geoFeatures)
                                    .attr("fill", d => vis.colorScale(d.properties[vis.variable]));

        // Mouseover behavior
        vis.geoFeatures.on('mouseover', function(event, d){

            d3.select(this)
                .attr('fill', 'white');

            vis.tooltip.style("opacity", 1)
                    .style("left", event.pageX + 20 + "px")
                    .style("top", event.pageY + "px")
///////////////////// TOOLTIP HARDCODED RIGHT NOW 
                    .html(`
                        <h4>${d.properties["BASENAME"]}</h4>
                        <div style="font-size: 14pt"><span style="font-weight:600">${vis.variable}: </span>${d.properties[vis.variable].toLocaleString()}</div>
                        `); 

        }).on('mouseout', function(event, d){

            d3.select(this)
                .attr("fill", d => vis.colorScale(d.properties[vis.variable]));

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