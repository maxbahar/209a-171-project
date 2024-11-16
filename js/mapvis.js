class MapVis {

    constructor(parentElement, blockGroupData) {
        
        this.parentElement = parentElement;
        this.blockGroupData = blockGroupData;

        this.initVis()
        
    }

    initVis() {

        let vis = this;

        vis.margin = {top: 20, right: 20, bottom: 20, left: 20};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // Initialize SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width)
            .attr("height", vis.height)
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        // Check if projection is needed

        vis.projection = d3.geoOrthographic() // d3.geoStereographic()
                          .translate([vis.width / 2, vis.height / 2])
                          // Include scale
                          .scale(vis.height/2 - 50);

        // Define geo generator
        vis.path = d3.geoPath()
                    .projection(vis.projection);

        // Draw the geographic features
        vis.counties = vis.svg.selectAll(".county")
                                .data(vis.blockGroupData)
                                .enter().append("path")
                                .attr('class', 'county')
                                .attr("d", vis.path);

        vis.wrangleData();

    }

    wrangleData() {
        let vis = this;

        // TO DO: Wrangle data here

        console.log(vis.blockGroupData);

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        // TO DO: Show the features
    }
}