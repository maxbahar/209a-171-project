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

        // Initialize variable cycling
        vis.varIndex = 0;

        // Initialize legend handling
        vis.handleLegend();

        // Initialize tooltip showing/hiding
        vis.handleTooltip();
        
        // Initialize zoom handling
        vis.handleZoom();

        // Update visualizations
        vis.updateVis();

    }

    // Tooltip handling
    handleTooltip() {

        let vis = this;

        // Initialize tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip mapTooltip");

        // Track whether the tooltip should stay visible or is visible
        vis.tooltipKeep = false;
        vis.tooltipShowing = false;

        // Add mouseover and mouseout handlers to the tooltip
        vis.tooltip.on("mouseover", () => {
            vis.tooltipKeep = true; // Keep the tooltip visible
        }).on("mouseout", () => {
            vis.tooltipKeep = false; // Allow hiding when leaving the tooltip
        });

        // Global mousemove listener
        const svgElement = document.querySelector(`#${vis.parentElement}`);
        const sectionElement = svgElement.closest(".section");
        const cardElement = svgElement.closest(".content-card");
        sectionElement.addEventListener("mousemove", function(event) {
            const [mouseX, mouseY] = d3.pointer(event);

            const boundingBox = cardElement.getBoundingClientRect();

            // Check if the cursor is within the SVG's bounding box
            const isWithinBounds = (
                mouseX >= boundingBox.left &&
                mouseX <= boundingBox.right &&
                mouseY >= boundingBox.top &&
                mouseY <= boundingBox.bottom
            );

            // Hide the tooltip if the cursor is not over the SVG or tooltip
            if (!isWithinBounds) {
                vis.hideTooltip();
            }
        });

        // Hide on scroll to next/previous page
        sectionElement.addEventListener("wheel", function(event) {
            vis.hideTooltip();
        });

        // Hide when clicking a non-feature
        sectionElement.addEventListener("click", function(event){
            let isFeatureClick = event.target.classList.contains('geoFeature')
            if (vis.tooltipShowing && !isFeatureClick) {
                vis.hideTooltip();
            }
        });
    }

    // Hides the tooltip if called
    hideTooltip() {
        let vis = this;
        vis.tooltip.style("opacity", 1)
                    .style("display", "none")
                    .style("left", 0)
                    .style("top", 0);
        vis.tooltipShowing = false;
    }

    handleZoom() {
        let vis = this;

        const iconPadding = 10;
        const iconSize = vis.rectHeight / 4 - iconPadding;
        const offsetY = iconSize / 2;
        // Append zoom-in button
        vis.legend.append("image")
                    .attr("href", "img/zoom-in.png")
                    .attr("id", `${vis.parentElement}-zoom-in`)
                    .attr("class", "zoom-button")
                    .attr("font-size", "1.5em")
                    .attr("x", - (vis.rectWidth / 5) - iconPadding/2) // Position to the left of the legend
                    .attr("y", -(vis.rectHeight * (1/4)) + offsetY)
                    .attr("height", iconSize)
                    .attr("width", iconSize)
                    .attr("alignment-baseline","middle")
                    .attr("cursor", "pointer");
        // Append zoom-out button
        vis.legend.append("image")
                    .attr("href", "img/zoom-out.png")
                    .attr("id", `${vis.parentElement}-zoom-out`)
                    .attr("class", "zoom-button")
                    .attr("font-size", "1.5em")
                    .attr("x", - (vis.rectWidth / 5) - iconPadding/2) // Position to the left of the legend
                    .attr("y", offsetY)
                    .attr("height", iconSize)
                    .attr("width", iconSize)
                    .attr("alignment-baseline","middle")
                    .attr("cursor", "pointer");
        // Append reset button
        vis.legend.append("image")
                    .attr("href", "img/reset.png")
                    .attr("id", `${vis.parentElement}-reset`)
                    .attr("class", "zoom-button")
                    .attr("font-size", "1.5em")
                    .attr("x", - (vis.rectWidth / 5) - iconPadding/2) // Position to the left of the legend
                    .attr("y", (vis.rectHeight * (1/4)) + offsetY)
                    .attr("height", iconSize)
                    .attr("width", iconSize)
                    .attr("alignment-baseline","middle")
                    .attr("cursor", "pointer");

        // Append button labels
        const zoomInText = vis.legend.append("text")
                    .text("Zoom In")
                    .attr("font-size","1em")
                    .attr("x", - (vis.rectWidth / 5) - iconPadding) // Position to the left of the legend
                    .attr("y", - (vis.rectHeight * (1/4)) + (iconSize / 1.75) + offsetY)
                    .attr("alignment-baseline","middle")
                    .attr("text-anchor","end");
        const zoomOutText = vis.legend.append("text")
                    .text("Zoom Out")
                    .attr("font-size","1em")
                    .attr("x", - (vis.rectWidth / 5) - iconPadding) // Position to the left of the legend
                    .attr("y", (iconSize / 1.75) + offsetY)
                    .attr("alignment-baseline","middle")
                    .attr("text-anchor","end");
        const resetText = vis.legend.append("text")
                    .text("Reset")
                    .attr("font-size","1em")
                    .attr("x", - (vis.rectWidth / 5) - iconPadding) // Position to the left of the legend
                    .attr("y", (vis.rectHeight * (1/4)) + (iconSize / 1.75) + offsetY)
                    .attr("alignment-baseline","middle")
                    .attr("text-anchor","end");
        const widthArray = Array.from([zoomInText, zoomOutText, resetText]).map(d => d.node().getBBox().width);
        const maxTextWidth = d3.max(widthArray);
        vis.legend.append("rect")
                    .attr("class", "legend-background")
                    .attr("x", - iconSize*5 - maxTextWidth) // Adjust to provide padding around the text
                    .attr("y", - vis.paddingY / 1.5) // Position above the text
                    .attr("width", iconSize * 3 + maxTextWidth)
                    .attr("height", vis.rectHeight)
                    .attr("fill", "white") // Background color
                    .attr("rx",5)
                    .attr("opacity", 0.9)
                    .lower();


        // Set up zoom behavior
        vis.transformScale = 1;
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
    }

    handleLegend() {
        let vis = this;

        // Define legend scale and axis
        vis.legendWidth = vis.width / 3;
        vis.legendHeight = vis.height / 10;
        vis.legendScale = d3.scaleLinear().range([0, vis.legendWidth]);
        vis.legendAxis = d3.axisBottom()
                            .scale(vis.legendScale);
        
        // Define shared spacing variables
        vis.paddingX = vis.legendWidth/5;
        vis.paddingY = vis.legendHeight;
        vis.rectWidth = vis.legendWidth + vis.paddingX;
        vis.rectHeight = vis.legendHeight + vis.paddingY;

        // Append legend
        vis.legend = vis.initSvg.append("g")
                            .attr('class', 'legend')
                            .attr('transform', `translate(${vis.width / 4}, ${vis.height * 7/8})`);
        // Append legend background
        vis.legend.append("rect")
                    .attr("class", "legend-background")
                    .attr("x", - vis.paddingX / 2) // Adjust to provide padding around the text
                    .attr("y", - vis.paddingY / 1.5) // Position above the text
                    .attr("width", vis.rectWidth) // Slightly larger than the legend
                    .attr("height", vis.rectHeight) // Larger to fit text and gradient
                    .attr("fill", "white") // Background color
                    .attr("rx",5)
                    .attr("opacity", 0.9);

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
        vis.legendAxis.tickFormat(d => {
            switch (vis.mainVar) {
                case "total_reg":
                    return intFormat(d);
                case "mean_hh_income":
                    return dollarFormat(d);
                default:
                    return pctFormat(d);
            }
        });
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
                .attr("stroke", "#D33D17")
                .style("stroke-width", 5 / vis.transformScale).raise();

        // Un-highlight on mouseout
        }).on('mouseout', function(event, d){

            d3.select(this)
                .attr("fill", d => vis.colorScale(d.properties[vis.mainVar]))
                .attr("stroke", "#8F99A8")
                .style("stroke-width", null);
        })
            
        // Show tooltip on click
        vis.geoFeatures.on("click", function(event, d){
            vis.tooltipShowing = true;

            vis.tooltip.style("display","grid");
            let title = "";
            switch (vis.geoLevel) {
                case "county":
                    title = `${d.properties["BASENAME"]} County`
                    break;
                case "tract":
                    title = `Tract ${d.properties["GEOID20"]}`
                    break;
                case "blockGroup":
                    title = `Block Group ${d.properties["GEOID20"]}`
                    break;
            }
                        
            if(vis.tooltipID === "modelMapTooltip"){
                vis.tooltip.html(`
                    <h4>${title}</h4>
                    <div class="tooltipText"><b>Predicted</b> <b style="color:black">${variableMap[vis.cycleVars[1]]}: </b>${pctFormat(d.properties[vis.cycleVars[0]])}</div>
                    <div class="tooltipText"><b>Actual</b> <b style="color:black">${variableMap[vis.cycleVars[1]]}: </b>${pctFormat(d.properties[vis.cycleVars[1]])}</div>
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

                vis.tooltip.html(`
                    <h4>${title}</h4>
                    <div class="tooltipText"><b style="color:black">${variableMap[vis.mainVar]}: </b>${mainVarValue}</div>
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
            if (top < 0) {
                top = 10; // Minimum top margin
            }
            if (left < 0) {
                left = 10; // Minimum left margin
            }
            vis.tooltip.style("left",`${left}px`)
                        .style("top",`${top}px`);

    
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