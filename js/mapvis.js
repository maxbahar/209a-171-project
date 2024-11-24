class MapVis {

    constructor(parentElement, geoData, cycleVars, colorScales, geoLevelID, demoID, tooltipID) {
        
        this.parentElement = parentElement;
        this.geoData = geoData;
        this.cycleVars = cycleVars;
        this.colorScales = colorScales;
        this.mainVar = cycleVars[0];
        this.geoLevelID = geoLevelID;
        this.demoID = demoID;
        this.tooltipID = tooltipID;

        this.initVis();
        
    }

    initVis() {

        let vis = this;

        // Define width, height, and margins
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
        vis.tooltipShowing = false;
        vis.tooltipHandler = vis.svg.append("rect")
                                        .attr("opacity", 0)
                                        .attr("width", vis.width)
                                        .attr("height", vis.height)
                                        .on("click", function(event) {
                                            if (vis.tooltipShowing) {
                                                vis.tooltipShowing = false;
                                                vis.tooltip.style("opacity", 1)
                                                .style("display","none")
                                                .style("left", 0)
                                                .style("top", 0);
                                                vis.tooltipHandler.lower();
                                            }
                                        }).on("mouseout", function(event) {  // Temporary to prevent lingering tooltip across pages
                                            if (vis.tooltipShowing) {
                                                vis.tooltipShowing = false;
                                                vis.tooltip.style("opacity", 1)
                                                .style("display","none")
                                                .style("left", 0)
                                                .style("top", 0);
                                                vis.tooltipHandler.lower();
                                            }
                                        });

        // Initialize variable cycling
        vis.varIndex = 0;

        // Define legend scale and axis
        vis.legendWidth = vis.width / 3;
        vis.legendHeight = vis.height / 15;
        vis.legendScale = d3.scaleLinear().range([0, vis.legendWidth]);
        vis.legendAxis = d3.axisBottom()
                            .scale(vis.legendScale);
        // Append legend
        vis.legend = vis.svg.append("g")
                            .attr('class', 'legend')
                            .attr('transform', `translate(${vis.width / 6}, ${vis.height * 3/4})`);
        vis.legendAxisGroup = vis.legend.append("g")
                                .attr("transform", `translate(0, ${vis.legendHeight/2 + 10})`)
                                .attr("class","legend-axis");
        // Append the rectangle gradient
        vis.legend.append("rect")
                    .attr("width", vis.legendWidth)
                    .attr("height", vis.legendHeight/2)
                    .style("fill", `url(#legend-gradient-${vis.parentElement})`)
                    .attr("stroke", "#333")
                    .attr("stroke-width", 0.1);
        vis.legendLabel = vis.legend.append("text")
                                        .attr("class","map-label")
                                        .attr("text-anchor","middle")
                                        .attr("x",vis.legendWidth/2)
                                        .attr("y",-10);

        vis.wrangleData();

    }

    wrangleData() {
        // No data wrangling is needed at the moment
        let vis = this;
        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        // Get geography level
        vis.geoLevel = document.getElementById(vis.geoLevelID).value;

        // Get demographic variable
        vis.demoVar = document.getElementById(vis.demoID).value;

        // Get the color scale
        vis.colorScale = d3.scaleSequential(vis.colorScales[vis.varIndex]);

        // Update the color scale
        vis.mainVarArray = vis.geoData[vis.geoLevel].features.map(d => d.properties[vis.mainVar]);
        vis.colorScale.domain([d3.min(vis.mainVarArray),d3.max(vis.mainVarArray)]);

        // Define gradient and update legend
        vis.svg.selectAll("defs").remove();
        let defs = vis.svg.append("defs");
        let linearGradient = defs.append("linearGradient")
                                .attr("id", `legend-gradient-${vis.parentElement}`);
        linearGradient.selectAll("stop")
                        .data(vis.colorScale.ticks().map((t, i, n) => ({
                            offset: `${100 * i / (n.length - 1)}%`,
                            color: vis.colorScale(t)
                        })))
                        .join("stop")
                        .attr("offset", d => d.offset)
                        .attr("stop-color", d => d.color);
        vis.legendScale.domain([d3.min(vis.mainVarArray),d3.max(vis.mainVarArray)]);
        vis.legendAxis.tickValues([d3.min(vis.mainVarArray),d3.max(vis.mainVarArray)]);
        vis.legendAxisGroup.transition()
                        .duration(800)
                        .call(vis.legendAxis);
        vis.legendLabel.text(vis.mainVar);

        //////////////////////////////////////////////// PROTOTYPE //////////////////////////////////////////////////
        // This could be very inefficient since it's just redrawing all the features on change.
        // Maybe only do this if the geoLevel changes?
        // I think changing only the colors/variable is enough if demoVar is changed.

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

        // Change the feature colors
        vis.geoFeatures = vis.svg.selectAll('.geoFeature')
                                    .data(vis.geoData[vis.geoLevel].features)
                                    .enter().append("path")
                                    .merge(vis.geoFeatures)
                                    .attr("fill", d => vis.colorScale(d.properties[vis.mainVar]));

        //////////////////////////////////////////////// PROTOTYPE //////////////////////////////////////////////////

        // Highlight on mouseover
        vis.geoFeatures.on("mouseover", function(event, d){

            d3.select(this)
                .attr('fill', 'white')
                .attr("stroke-width", 0.5);

        // Un-highlight on mouseout
        }).on('mouseout', function(event, d){

            d3.select(this)
                .attr("fill", d => vis.colorScale(d.properties[vis.mainVar]))
                .attr("stroke-width", 0.1);
        })
            
        // Show tooltip on click
        vis.geoFeatures.on("click", function(event, d){

            vis.tooltip.style("display","grid")
                    .style("left", event.pageX + 20 + "px")
                    .style("top", event.pageY + "px")
                    .html(`
                        <h4>${d.properties["BASENAME"]} ${vis.geoLevel}</h4>
                        <div style="font-size: 14pt"><span style="font-weight:600">${vis.mainVar}: </span>${d.properties[vis.mainVar].toLocaleString()}</div>
                        <div class="tooltipVisContainer" id="${vis.tooltipID}"></div>
                        `); 

            vis.tooltipVis = new TooltipVis(vis.tooltipID, d, vis.demoVar);
            vis.tooltipShowing = true;
            vis.tooltipHandler.raise();
    
        });

    }

    // Cycles to the previous variable
    prevMap() {
        let vis = this;
        if (vis.varIndex === 0) {
            vis.varIndex = vis.cycleVars.length - 1;
        } else {
            vis.varIndex--;
        }
        vis.mainVar = vis.cycleVars[vis.varIndex];
        vis.updateVis();
    }
    
    // Cycles to the next variable
    nextMap() {
        let vis = this;
        if (vis.varIndex === vis.cycleVars.length - 1) {
            vis.varIndex = 0;
        } else {
            vis.varIndex++;
        }
        vis.mainVar = vis.cycleVars[vis.varIndex];
        vis.updateVis();
    }

}