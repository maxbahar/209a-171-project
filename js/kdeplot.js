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
            .attr("style", "max-width: 100%; height: auto;")
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        vis.svg.append('rect')
            .attr('width', vis.width)
            .attr('height', vis.height)
            .attr('fill', '#FAF9F6');


        let nData = []
        vis.data.features.forEach(function (feature) {
            let denom = feature.properties.gender_f + feature.properties.gender_m + feature.properties.gender_unknown;
            nData.push({
                x_female: feature.properties.gender_f / denom,
                x_male: feature.properties.gender_m / denom,
                y: feature.properties["2020_turnout_pct"]

            });

        });


        const xScale = d3.scaleLinear()
            .domain([.2, .8]).nice()
            .rangeRound([vis.margin.left, vis.width - vis.margin.right]);

        const yScale = d3.scaleLinear()
            .domain([0.3, 1]).nice()
            .rangeRound([vis.height - vis.margin.bottom, vis.margin.top]);


        const contours_f = d3.contourDensity()
            .x(d => xScale(d.x_female))
            .y(d => yScale(d.y))
            .size([vis.width, vis.height])
            .bandwidth(10)
            .thresholds(15)
            (nData)

        const contours_m = d3.contourDensity()
            .x(d => xScale(d.x_male))
            .y(d => yScale(d.y))
            .size([vis.width, vis.height])
            .bandwidth(10)
            .thresholds(15)
            (nData)

        vis.svg.append("g")
            .attr("transform", `translate(0,${vis.height - vis.margin.bottom})`)
            .call(d3.axisBottom(xScale).tickSizeOuter(0))
            .call(g => g.select(".domain").remove())
            .call(g => g.select(".tick:last-of-type text").clone()
                .attr("y", -3)
                .attr("dy", null)
                .attr("font-weight", "bold")
                .text(""));

        vis.svg.append("g")
            .attr("transform", `translate(${vis.margin.left},0)`)
            .call(d3.axisLeft(yScale).tickSizeOuter(0))
            .call(g => g.select(".domain").remove())
            .call(g => g.select(".tick:last-of-type text").clone()
                .attr("x", 3)
                .attr("text-anchor", "start")
                .attr("font-weight", "bold")
                .text(""));


        vis.svg.append("g")
            .selectAll()
            .data(nData)
            .join("circle")
            .attr("cx", d => xScale(d.x_male))
            .attr("cy", d => yScale(d.y))
            .attr("r", 2)
            .attr("fill", "#4C90F0")
            .attr("opacity", 0.1);
        vis.svg.append("g")
            .selectAll()
            .data(nData)
            .join("circle")
            .attr("cx", d => xScale(d.x_female))
            .attr("cy", d => yScale(d.y))
            .attr("r", 2)
            .attr("fill", "#E76A6E")
            .attr("opacity", 0.1);



        vis.svg.append("g")
            .attr("fill", "none")
            .attr("stroke", "#AC2F33")
            .attr("stroke-linejoin", "round")
            .selectAll()
            .data(contours_f)
            .join("path")
            .attr("d", d3.geoPath());

        vis.svg.append("g")
            .attr("fill", "none")
            .attr("stroke", "#184A90")
            .attr("stroke-linejoin", "round")
            .selectAll()
            .data(contours_m)
            .join("path")
            .attr("d", d3.geoPath());

        vis.wrangleData()
    }

    wrangleData() {
        let vis = this;

        vis.updateVis()
    }

    updateVis() {
        let vis = this;


    }


}