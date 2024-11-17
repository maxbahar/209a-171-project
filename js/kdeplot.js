class KdePlot {

    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;


        this.initVis();
    }

    initVis() {

        let vis = this;
        vis.margin = {top: 20, right: 40, bottom: 20, left: 40};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        vis.xScale = d3.scaleLinear()
            .domain([0, 1])
            .range([0, vis.width]);                    

        vis.yScale = d3.scaleLinear()
            .domain([0, 1])
            .range([vis.height, 0]); 

        vis.svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0,${vis.height})`)
            .call(d3.axisBottom(vis.xScale));

        vis.svg.append("g")
            .attr("class", "y-axis")
            .call(d3.axisLeft(vis.yScale));

        

        vis.wrangleData()
    }

    wrangleData() {
        let vis = this;

        vis.updateVis()
    }

    updateVis() {
        let vis = this;

        vis.svg.selectAll(".male-points")
            .data(vis.data.features)
            .enter()
            .append("circle")
            .attr("class", "dot")
            .attr("fill","blue")
            .attr("cx", d => {
                return vis.xScale(d.properties["gender_m"] / (d.properties["gender_unknown"] + d.properties["gender_m"] + d.properties["gender_f"]))
            })
            .attr("cy", d => vis.yScale(d.properties["2020_turnout_pct"]))
            .attr("r", 5);
        vis.svg.selectAll(".female-points")
            .data(vis.data.features)
            .enter()
            .append("circle")
            .attr("class", "dot")
            .attr("fill","red")
            .attr("cx", d => {
                return vis.xScale(d.properties["gender_f"] / (d.properties["gender_unknown"] + d.properties["gender_m"] + d.properties["gender_f"]))
            })
            .attr("cy", d => vis.yScale(d.properties["2020_turnout_pct"]))
            .attr("r", 5);

    }

  

}