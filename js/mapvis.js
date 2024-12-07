class MapVis {

    constructor(parentElement, geoData, cycleVars, colorRanges, geoLevelID, demoID, tooltipID) {
        
        this.parentElement = parentElement;
        this.geoData = geoData;
        this.cycleVars = cycleVars;
        this.colorRanges = colorRanges;
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
        vis.initSvg = d3.select("#" + vis.parentElement).append("svg")
                        .attr("width", vis.width + vis.margin.left + vis.margin.right)
                        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        vis.svg = vis.initSvg.append("g")
                        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        // Initialize tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip mapTooltip");


        // Prevent tooltip from hiding when hovered
        vis.tooltip.on("mouseover", () => {
            vis.tooltipKeep = true; // Keep the tooltip visible
        }).on("mouseout", () => {
            vis.tooltipKeep = false; // Allow hiding when leaving the tooltip
        });
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
                                            setTimeout(() => {
                                                if (!vis.tooltipKeep) {
                                                    vis.tooltip.style("opacity", 1)
                                                    .style("display","none")
                                                    .style("left", 0)
                                                    .style("top", 0);
                                                    vis.tooltipHandler.lower();
                                                }
                                            }, 100);
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
        vis.legend = vis.initSvg.append("g")
                            .attr('class', 'legend')
                            .attr('transform', `translate(${vis.width / 6}, ${vis.height * 3/4})`);
        const paddingX = vis.legendWidth/5;
        const paddingY = vis.legendHeight*2;
        const rectWidth = vis.legendWidth + paddingX;
        const rectHeight = vis.legendHeight + paddingY;
        // Append legend background
        vis.legend.append("rect")
                    .attr("class", "legend-background")
                    .attr("x", - paddingX / 2) // Adjust to provide padding around the text
                    .attr("y", - paddingY / 1.75) // Position above the text
                    .attr("width", rectWidth) // Slightly larger than the legend
                    .attr("height", rectHeight) // Larger to fit text and gradient
                    .attr("fill", "white") // Background color
                    .attr("stroke", "#ccc") // Optional border for the background
                    .attr("stroke-width", 0.5);

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

        vis.transformScale = 1;

        // Set up zoom behavior
        const zoom = d3.zoom()
        .scaleExtent([1, 20]) // Minimum and maximum zoom levels
        .translateExtent([[0, 0], [vis.width + vis.margin.left + vis.margin.right, 
                                   vis.height + vis.margin.top + vis.margin.bottom]]) // Set panning limits
        .filter((event) => event.type !== "wheel")
        .on("zoom", (event) => {
            vis.svg.attr("transform", event.transform);
            vis.transformScale = event.transform.k;
            vis.svg.selectAll(".geoFeature").attr("stroke-width", 0.5 / vis.transformScale);
        });
        // .on("end", (event) => {
        //     // Update stroke width when mouse is released
        //     vis.transformScale = event.transform.k;
        //     vis.svg.selectAll(".geoFeature").attr("stroke-width", 0.5 / vis.transformScale);
        // });

        vis.initSvg = d3.select("#" + vis.parentElement).select("svg");
        vis.initSvg.call(zoom);

        // Zoom button functionality
        const zoomLevel = d3.zoomIdentity;
        vis.initSvg.call(zoom.transform, zoomLevel); // Reset zoom

        d3.select(`#${vis.parentElement}-zoom-in`).on("click", () => {
            vis.initSvg.transition().call(zoom.scaleBy, 3); // Zoom in by 20%
        });

        d3.select(`#${vis.parentElement}-zoom-out`).on("click", () => {
            vis.initSvg.transition().call(zoom.scaleBy, 1/3); // Zoom out by 20%
        });

        d3.select(`#${vis.parentElement}-reset`).on("click", () => {
            vis.initSvg.transition().call(zoom.transform, zoomLevel); // Reset zoom
        });

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

        if (vis.tooltipID === "modelMapTooltip") {
            vis.mainVarArray = [];
            vis.cycleVars.forEach(variable => vis.mainVarArray = vis.mainVarArray.concat(vis.geoData[vis.geoLevel].features.map(d => d.properties[variable])));
        } else {
            // Get the main variable values
            vis.mainVarArray = vis.geoData[vis.geoLevel].features.map(d => d.properties[vis.mainVar]);
        }

        // Define breakpoints for the scale
        const minValue = d3.min(vis.mainVarArray);
        const maxValue = d3.max(vis.mainVarArray);
        const breakpoints = [minValue, (minValue + maxValue) / 2, maxValue]; // Adjust as needed

        // Create a linear scale with discrete breakpoints
        vis.colorScale = d3.scaleLinear()
            .domain(breakpoints) // Use the defined breakpoints
            .range(vis.colorRanges[vis.varIndex]);  // Map the breakpoints to colors

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
        
        let mainVarLabel = variableMap[vis.mainVar]
        if (mainVarLabel.includes("Predicted")) {
            const [before, predicted, after] = mainVarLabel.split(/(Predicted)/);
        
            vis.legendLabel.html('') // Clear existing label
                .append("tspan")
                .text(before)
                .attr("fill", "black") // Default color
                .attr("font-weight", "normal");
        
            vis.legendLabel.append("tspan")
                .text(predicted)
                .attr("fill", "#D33D17") // Red for "Predicted"
                .attr("font-weight", "bold");
        
            vis.legendLabel.append("tspan")
                .text(after)
                .attr("fill", "black") // Default color
                .attr("font-weight", "normal");
        } else {
            vis.legendLabel.html('') // Clear existing label
                .append("tspan")
                .text(mainVarLabel)
                .attr("fill", "black")
                .attr("font-weight", "normal");
        }


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

        // Draw the geographic features
        vis.geoFeatures = vis.svg.selectAll(".geoFeature")
                                .data(vis.geoData[vis.geoLevel].features, d => d.properties["GEOID20"]);

        vis.geoFeatures.exit().remove();

        vis.geoFeaturesEnter = vis.geoFeatures.enter().append("path")
                                                .attr('class', 'geoFeature')
                                                .attr("d", vis.path)
                                                .attr("fill", "#ccc")
                                                .attr("stroke", "#8F99A8")
                                                .attr("stroke-width", 0.5 / vis.transformScale);

        vis.geoFeatures = vis.geoFeaturesEnter.merge(vis.geoFeatures);
        vis.geoFeatures.transition().duration(800)
                        .attr("fill", d => vis.colorScale(d.properties[vis.mainVar]));

        // Highlight on mouseover
        vis.geoFeatures.on("mouseover", function(event, d){

            d3.select(this)
                // .attr('fill', 'white')
                .attr("stroke", "#D33D17")
                .style("stroke-width", 5 / vis.transformScale).raise();

        // Un-highlight on mouseout
        }).on('mouseout', function(event, d){

            d3.select(this)
                .attr("fill", d => vis.colorScale(d.properties[vis.mainVar]))
                .attr("stroke", "#8F99A8")
                .style("stroke-width", null);
                // .style("stroke-width", 0.5 / vis.transformScale);
        })
            
        // Show tooltip on click
        vis.geoFeatures.on("click", function(event, d){
            console.log("NEW CLICK");

            vis.tooltip.style("display","grid");
                        
            if(vis.tooltipID === "modelMapTooltip"){
                vis.tooltip.html(`
                    <h4>${d.properties["BASENAME"]} ${vis.geoLevel}</h4>
                    <div style="font-size: 14pt"><b>${variableMap[vis.cycleVars[0]]}: </b>${pctFormat(d.properties[vis.cycleVars[0]])}</div>
                    <div style="font-size: 14pt"><b>Actual ${variableMap[vis.cycleVars[1]]}: </b>${pctFormat(d.properties[vis.cycleVars[1]])}</div>
                    <div class="tooltipVisContainer" id="${vis.tooltipID}"></div>
                    `); 
                vis.tooltipVis = new TooltipLocalImportance(vis.tooltipID, d);
            }
            else{

                let mainVarValue;

                switch (vis.mainVar) {
                    case "2020_turnout_pct":
                        mainVarValue = pctFormat(d.properties[vis.mainVar])
                        break;
                    case "total_reg":
                        mainVarValue = intFormat(d.properties[vis.mainVar])
                        break;
                    case "mean_hh_income":
                        mainVarValue = dollarFormat(d.properties[vis.mainVar])
                        break;
                }
                ;

                vis.tooltip.html(`
                    <h4>${d.properties["BASENAME"]} ${vis.geoLevel}</h4>
                    <div style="font-size: 14pt"><b>${variableMap[vis.mainVar]}: </b>${mainVarValue}</div>
                    <div class="tooltipVisContainer" id="${vis.tooltipID}"></div>
                    `); 
                vis.tooltipVis = new TooltipVis(vis.tooltipID, d, vis.demoVar);
            }

            // Tooltip dimensions
            let tooltipWidth = vis.tooltip.node().offsetWidth;
            let tooltipHeight = vis.tooltip.node().offsetHeight;

            // Default tooltip position (bottom-right of cursor)
            let left = event.pageX + 20;
            let top = event.pageY;
            
            // Adjust position if the tooltip goes off the screen
            if (left + tooltipWidth > window.innerWidth) {
                left = event.pageX - tooltipWidth - 20; // Position to the left of the cursor
            }
            if (top + tooltipHeight > window.innerHeight) {
                top = event.pageY - tooltipHeight - 20; // Position above the cursor
            }
            
            vis.tooltip.style("left",`${left}px`)
                        .style("top",`${top}px`);

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