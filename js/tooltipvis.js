class TooltipVis {

    constructor(parentElement, data, category) {
        
        this.parentElement = parentElement;
        this.featureData = data;
        this.category = category;

        this.initVis();
        
    }

    initVis() {

        let vis = this;
        
        vis.margin = {top: 20, right: 20, bottom: 100, left: 50};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // Initialize SVG drawing area 
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
                    .attr("width", vis.width + vis.margin.left + vis.margin.right)
                    .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
                    .append("g")
                    .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");
        

        // Initialize scale
        vis.y = d3.scaleLinear()
                    .range([vis.height, 0]);

        vis.x = d3.scaleBand()
                    .range([0,vis.width])
                    .paddingInner(0.15)
                    .paddingOuter(0.15);
        
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


        vis.wrangleData();

    }

    wrangleData() {
        let vis = this;

        console.log(vis.category);

        // Define the category
        switch(vis.category) {
            case "vote-party":
                vis.variables = ['party_npp', 'party_dem', 'party_rep','party_lib', 'party_grn', 'party_con', 'party_ain', 'party_scl','party_oth']
                break;
            case "vote-gender":
                vis.variables = ['gender_m', 'gender_f', 'gender_unknown'] 
                break;
            case "vote-age":
                vis.variables = ['age_18_19', 'age_20_24', 'age_25_29','age_30_34','age_35_44', 'age_45_54', 'age_55_64', 'age_65_74','age_75_84', 'age_85over']
                break;
            case "vote-lang":
                vis.variables = ['lang_english', 'lang_spanish', 'lang_portuguese', 'lang_chinese', 'lang_italian', 'lang_vietnamese', 'lang_other', 'lang_unknown']
                break;
            case "vote-eth":
                vis.variables = ['eth1_eur', 'eth1_hisp', 'eth1_aa', 'eth1_esa', 'eth1_oth', 'eth1_unk']
                break;
        }

        // Get data for relevant variables
        vis.displayData = vis.variables.map((d) => [d,vis.featureData.properties[d]]);

        console.log(vis.displayData);

        vis.updateVis();
    }

    updateVis() {
        let vis = this;


        // Update domains
        vis.x.domain(vis.displayData.map(d => d[0]));
        vis.y.domain([0, d3.max(vis.displayData.map(d => d[1]))]);

        // Draw bars
        vis.bars = vis.svg.selectAll(`.${vis.category}-bar`)
                        .data(vis.displayData, (d) => d[0]);
        vis.bars.enter().append("rect")
                .attr("class",`${vis.category}-bar`)
                // .merge(vis.bars)
                .attr("x",d => vis.x(d[0]))
                .attr("y",d => vis.y(d[1]))
                .attr("height",d => vis.height - vis.y(d[1]))
                .attr("width", vis.x.bandwidth());

        // Update axis
        vis.xAxisGroup.call(vis.xAxis).selectAll("text").attr("transform","rotate(-45)").style("text-anchor","end");
        vis.yAxisGroup.call(vis.yAxis);

    }
}