class KdePlot {

    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;
        this.margin = {top: 40, right: 40, bottom: 40, left: 40};

        this.initVis();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        let vis = this;
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        vis.svg.attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)

        this.svg.select('rect')
            .attr('width', this.width)
            .attr('height', this.height);
    }


    initVis() {
        let vis = this;

        // trace init
        vis.traceOptions = {
            "gender": [{xKey:'x_male', color:"blue"}, {xKey:'x_female', color:"red"}],
            "party": [{xKey:'x_party_np', color:"green"}, {xKey:'x_party_dem', color:"blue"}, {xKey:'x_party_rep', color:"red"}],
            "ethnicity": [{xKey:'x_eth_eur', color:"red"}, {xKey:'x_eth_esa', color:"blue"}, {xKey:'x_eth_aa', color:"green"}, {xKey:'x_eth_hisp', color:"orange"}],
            "age": [{xKey:'x_age_young', color:"red"}, {xKey:'x_age_mid', color:"blue"}, {xKey:'x_age_old', color:"green"}],
            "language": [{xKey:'x_lang_chin', color:"red"}, {xKey:'x_lang_eng', color:"blue"}, {xKey:'x_lang_ital', color:"green"}, {xKey:'x_lang_span', color:"orange"}],

    }
        vis.activeTraces = vis.traceOptions["gender"]

        // svg basics init
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
            .attr('fill', '#fff');
        // scale init
        vis.xScale = d3.scaleLinear()
            .domain([0, 1])
            .rangeRound([vis.margin.left, vis.width - vis.margin.right]);

        vis.yScale = d3.scaleLinear()
            .domain([0, 1])
            .rangeRound([vis.height - vis.margin.bottom, vis.margin.top]);


        // mouse tracking lines init
        let horizontalLine = vis.svg.append('line')
            .attr('stroke', '#000')
            .attr('stroke-width', 1)
            .attr('stroke-dasharray', '4')
            .style('opacity', 0);
        let verticalLine = vis.svg.append('line')
            .attr('stroke', '#000')
            .attr('stroke-width', 1)
            .attr('stroke-dasharray', '4')
            .style('opacity', 0); // Initially hidden
        vis.svg.on('mousemove', function(event) {
            let mousePosition = d3.pointer(event); // [x, y]

            //var mouseX = vis.xScale.invert(mousePosition[0]);
            //var mouseY = vis.yScale.invert(mousePosition[1]);

            horizontalLine
                .attr('x1', 0)
                .attr('y1', mousePosition[1])
                .attr('x2', vis.width)
                .attr('y2', mousePosition[1])
                .style('opacity', 1);
            verticalLine
                .attr('x1', mousePosition[0])
                .attr('y1', 0)
                .attr('x2', mousePosition[0])
                .attr('y2', vis.height)
                .style('opacity', 1);
        });
        vis.svg.on('mouseout', function() {
            horizontalLine.style('opacity', 0);
            verticalLine.style('opacity', 0);
        });

        // build data for plots

        let nData = []
        let denom_gender;
        let denom_party;
        let denom_eth;
        let denom_age;
        let denom_lang;
        vis.data.features.forEach(function (feature) {
            denom_gender = feature.properties.gender_f + feature.properties.gender_m + feature.properties.gender_unknown;
            denom_party = feature.properties.party_ain + feature.properties.party_con + feature.properties.party_dem + feature.properties.party_grn + feature.properties.party_lib + feature.properties.party_npp + feature.properties.party_oth + feature.properties.party_rep + feature.properties.party_scl;
            denom_eth = feature.properties.eth1_aa + feature.properties.eth1_esa + feature.properties.eth1_eur + feature.properties.eth1_hisp + feature.properties.eth1_oth + feature.properties.eth1_unk
            denom_age = feature.properties.age_18_19 + feature.properties.age_20_24 + feature.properties.age_25_29 + feature.properties.age_30_34 + feature.properties.age_35_44 + feature.properties.age_45_54+ feature.properties.age_55_64 +  feature.properties.age_65_74 + feature.properties.age_75_84 + feature.properties.age_85over
            denom_lang = feature.properties.lang_chinese + feature.properties.lang_english + feature.properties.lang_italian + feature.properties.lang_other + feature.properties.lang_portuguese + feature.properties.lang_spanish+ feature.properties.lang_unknown +  feature.properties.lang_vietnamese

            nData.push({
                x_female: feature.properties.gender_f / denom_gender,
                x_male: feature.properties.gender_m / denom_gender,
                x_party_np: feature.properties.party_npp / denom_party,
                x_party_dem: feature.properties.party_dem / denom_party,
                x_party_rep: feature.properties.party_rep / denom_party,
                x_eth_aa: feature.properties.eth1_aa /denom_eth,
                x_eth_esa:feature.properties.eth1_esa/denom_eth,
                x_eth_eur: feature.properties.eth1_eur/denom_eth,
                x_eth_hisp: feature.properties.eth1_hisp/denom_eth,
                x_eth_oth: feature.properties.eth1_oth/denom_eth,
                x_age_young: (feature.properties.age_18_19 + feature.properties.age_20_24 + feature.properties.age_25_29)/denom_age,
                x_age_mid:( feature.properties.age_30_34 + feature.properties.age_35_44 + feature.properties.age_45_54 + feature.properties.age_55_64)/denom_age,
                x_age_old: (   feature.properties.age_65_74 + feature.properties.age_75_84 + feature.properties.age_85over)/denom_age,
                x_lang_chin: feature.properties.lang_chinese/denom_lang,
                x_lang_eng: feature.properties.lang_english  /denom_lang,
                x_lang_ital: feature.properties.lang_italian /denom_lang,
                x_lang_port: feature.properties.lang_portuguese/denom_lang,
                x_lang_span: feature.properties.lang_spanish/denom_lang,
                x_lang_viet: feature.properties.lang_vietnamese/denom_lang,
                y: feature.properties["2020_turnout_pct"]

            });

        });

        console.log(vis.data.features[0])
        console.log(nData[0])

        vis.builtData = nData




        vis.svg.append("g")
            .attr("transform", `translate(0,${vis.height - vis.margin.bottom})`)
            .call(d3.axisBottom(vis.xScale).tickSizeOuter(0))
            .call(g => g.select(".domain").remove())
            .call(g => g.select(".tick:last-of-type text").clone()
                .attr("y", -3)
                .attr("dy", null)
                .attr("font-weight", "bold")
                .text("voter turnout"));

        vis.svg.append("g")
            .attr("transform", `translate(${vis.margin.left},0)`)
            .call(d3.axisLeft(vis.yScale).tickSizeOuter(0))
            .call(g => g.select(".domain").remove())
            .call(g => g.select(".tick:last-of-type text").clone()
                .attr("x", 3)
                .attr("text-anchor", "start")
                .attr("font-weight", "bold")
                .text("ratio"));







        vis.wrangleData()
    }

    wrangleData() {
        let vis = this;

        vis.updateVis()
    }

    updateVis() {
        let vis = this;

        let contours = []

        vis.activeTraces.forEach((trace)=>{
            contours.push(d3.contourDensity()
                .x(d => vis.xScale(d[trace.xKey]))
                .y(d => vis.yScale(d.y))
                .size([vis.width, vis.height])
                .bandwidth(10)
                .thresholds(15)
                (vis.builtData ))
        })

        vis.svg.selectAll(".kde-cont")
            .transition()
            .duration(1000)
            .style("opacity", 0)
            .on("end", function() {
                d3.select(this).remove();
            });

        contours.forEach((contour, i) => {
            vis.svg.append("g")
                .attr("class", "kde-cont")
                .attr("fill", "none")
                .attr("stroke", vis.activeTraces[i].color)
                .attr("stroke-linejoin", "round")
                .selectAll()
                .data(contour)
                .join("path")
                .attr("d", d3.geoPath())
                .style("opacity", 0)  // Set initial opacity to 0 (invisible)
                .transition()  // Start a transition
                .duration(1000)  // Duration of the fade-in (1 second)
                .style("opacity", 1);  // Fade in to opacity 1 (fully visible)
        });

    }

    selectionChange(key){
        let vis = this;

        vis.activeTraces = vis.traceOptions[key]
        vis.updateVis()

    }


}