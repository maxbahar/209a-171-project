class TooltipLocalImportance{
    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;

        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.margin = {top: 20, right: 20, bottom: 70, left: 50};
        vis.width = 500
        vis.height = 30

        console.log(document.getElementById(vis.parentElement).getBoundingClientRect().width)
        vis.tmp_wrapper = d3.select("#" + vis.parentElement)
            .attr(
                "style",
                "padding-bottom: " + Math.ceil(vis.height / vis.width) + "%"
            )
            .append("svg")
            .attr("viewBox", "0 0 " + vis.width + " " + vis.height);

        vis.gradient = vis.tmp_wrapper.append("defs")
            .append("linearGradient")
            .attr("id", "gradient")
            .attr("x1", "0%")
            .attr("y1", "0%")
            .attr("x2", "100%")
            .attr("y2", "0%")
            .attr("spreadMethod", "pad");

        vis.gradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", "red")
            .attr("stop-opacity", 1);

        vis.gradient.append("stop")
            .attr("offset", "50%")
            .attr("stop-color", "red")
            .attr("stop-opacity", 1);

        vis.gradient.append("stop")
            .attr("offset", "50%")
            .attr("stop-color", "blue")
            .attr("stop-opacity", 1);

        vis.gradient.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", "blue")
            .attr("stop-opacity", 1);

        vis.tmp_wrapper.append('rect')
            .attr("width", "480")
            .attr("height", "100%")
            .attr("x", "29px")
            .attr("y", "0px")
            .attr("fill", "url(#gradient)")
            .attr("class","foo");

        //vis.tmp_wrapper.append("svg:path")  // Fixed.
        //    .attr("d", d3.symbol(d3.symbolTriangle).size(400))
        //    .style("fill", "#FFFFFF")
        //    .attr ("transform", "translate(37,15) rotate (90)");

        //vis.tmp_wrapper.append("svg:path")  // Fixed.
        //    .attr("d", d3.symbol(d3.symbolTriangle).size(400))
        //    .style("fill", "#FFFFFF")
        //    .attr ("transform", "translate(465,15) rotate (-90)");


        //vis.wrangleData();

    }

    wrangleData() {
        let vis = this;

        //The data for our line
        vis.lineData = [
            { "x": -5,   "y": 0},
            { "x": 20,  "y": 0},
            { "x": -5,  "y": 15},
            { "x": 20,  "y": 30},
            { "x": -5,  "y": 30},
            { "x": -30, "y": 15},
            { "x": -5, "y": 0}

        ];

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        //accessor function
        vis.lineFunction = d3.line()
            .x(function(d) { return d.x; })
            .y(function(d) { return d.y; })
            .curve(d3.curveLinear);

        //The line SVG Path we draw
        vis.lineGraph = vis.tmp_wrapper.append("path")
            .attr("d", vis.lineFunction(vis.lineData))
            .style("fill", "blue")
            .attr ("transform", "translate(485)");

        vis.lineGraph1 = vis.tmp_wrapper.append("path")
            .attr("d", vis.lineFunction(vis.lineData))
            .style("fill", "red")
            .attr ("transform", "translate(15,30) rotate(180)");
    }
}