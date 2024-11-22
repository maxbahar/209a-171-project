class MapVis {

    constructor(parentElement, blockGroupData, tractData, countyData, mainVar) {
        
        this.parentElement = parentElement;
        this.geoData = {
            "blockGroup" : blockGroupData,
            "tract": tractData,
            "county" : countyData
        };
        this.mainVar = mainVar;

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

        // Initialize tooltip
        vis.tooltip = d3.select("body").append('div')
                        .attr('class', "tooltip")
                        .attr('id', 'mapTooltip');

        vis.wrangleData(vis.mainVar);

    }

    wrangleData(mainVar) {
        let vis = this;

        vis.updateVis(mainVar);
    }

    updateVis(mainVar) {
        let vis = this;

        // Update description
        document.getElementById("main-var-chosen").innerText = mainVar;

        // Get geography level
        vis.geoLevel = document.getElementById("geoLevel").value;

        // Get demographic variable
        vis.demoVar = document.getElementById("demographicVar").value;

///////////////////// COLORSCALE HARDCODED RIGHT NOW 
        // Initialize the color scale
        switch(mainVar) {
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

        // Update the color scale
        vis.mainVarArray = vis.geoData[vis.geoLevel].features.map(d => d.properties[mainVar]);
        vis.colorScale.domain([d3.min(vis.mainVarArray),d3.max(vis.mainVarArray)]);



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
                                    .attr("fill", d => vis.colorScale(d.properties[mainVar]));

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
                        <div style="font-size: 14pt"><span style="font-weight:600">${mainVar}: </span>${d.properties[mainVar].toLocaleString()}</div>
                        `); 

        }).on('mouseout', function(event, d){

            d3.select(this)
                .attr("fill", d => vis.colorScale(d.properties[mainVar]));

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