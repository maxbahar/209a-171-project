class TooltipLocalImportance{
    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;

        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.margin = {top: 20, right: 50, bottom: 30, left: 120};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // Initialize SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;

        vis.variables = ["mean_hh_income_shap", "total_reg_shap",
            "lang_unknown_shap", "gender_f_shap", "party_dem_shap",
            "eth1_hisp_shap", "eth1_eur_shap", "eth1_aa_shap", "eth1_oth_shap",
            "age_20_24_shap", "age_25_29_shap", "age_30_34_shap", "age_45_54_shap",]

        // const base_value_shap = vis.data.properties["base_value_shap"]

        const predicted_turnout = vis.data.properties["2020_turnout_pct_pred"]

        // Get data for relevant variables
        vis.displayData = vis.variables.map((d) => [variableMap[d],vis.data.properties[d]]);

        vis.displayData.sort(function(a, b) {
            return Math.abs(b[1]) - Math.abs(a[1]); // Sort in descending order
        });

        // Calculate cumulative values
        vis.displayData.forEach((d, i) => {
            if (i > 0) {
                d.start = vis.displayData[i - 1].end;
                d.end = d.start - d[1];
            } else {
                d.start = predicted_turnout;
                d.end = predicted_turnout - d[1];
            }
        });

        // Create scales
        vis.x = d3.scaleLinear()
            .domain([d3.min(vis.displayData, d => d.end, d => d.start) -0.01, d3.max(vis.displayData, d => d.start, d => d.end) + 0.01])
            .range([0, vis.width]);

        vis.y = d3.scaleBand()
            .domain(vis.displayData.map(d => d[0]))
            .range([0, vis.height])
            .padding(0.1);

        vis.xAxis = d3.axisBottom()
            .scale(vis.x);

        vis.yAxis = d3.axisLeft()
            .scale(vis.y);

        // Initialize axis
        vis.xAxisGroup = vis.svg.append("g")
            .attr("class","x-axis")
            .attr("transform", `translate(0, ${vis.height})`);;

        vis.yAxisGroup = vis.svg.append("g")
            .attr("class","y-axis");

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        // Create bars
        vis.svg.selectAll("rect")
            .data(vis.displayData)
            .enter()
            .append("rect")
            .attr("x", d => vis.x(Math.min(d.start, d.end)))
            .attr("y", d => vis.y(d[0]))
            .attr("width", d => Math.abs(vis.x(d.end) - vis.x(d.start)))
            .attr("height", vis.y.bandwidth())
            .attr("fill", d => d[1] > 0 ? "red" : "blue");

        vis.svg.selectAll("text")
            .data(vis.displayData)
            .enter()
            .append("text")
            .attr("x", d => vis.x(Math.max(d.start, d.end)) + 5)
            .attr("y", d => vis.y(d[0]) + 16)
            .text(d => {
                if(d[1]>0){
                    return `+${(d[1]*100).toFixed(2)}%`
                }
                else{
                    return `${(d[1]*100).toFixed(2)}%`
                }
            })

        // Update axis
        vis.xAxisGroup.call(vis.xAxis).selectAll("text").attr("transform","rotate(-45)").style("text-anchor","end");
        vis.yAxisGroup.call(vis.yAxis);
    }
}