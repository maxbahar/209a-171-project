let memberVote = undefined
let selectedFeatureCategories = new Set()
let absentMapVis, popMapVis, incomeMapVis, kdeTestPlot, importanceVis;
// Read in data from multiple files via promises
let promises = [
    d3.json('data/block_groups.geojson'),
    d3.json('data/tracts.geojson'),
    d3.json('data/counties.geojson'),
    d3.csv('data/shap_values.csv'),
];
Promise.all(promises)
    .then(data => createVis(data))
    .catch(err => console.log(err));  

function createVis(data) {

    // Log data for confirmation
    // console.log(data);

    // Extract data
    let blockGroupData = data[0];
    let tractData = data[1];
    let countyData = data[2];
    let shapData = data[3];

    // TO DO: Visualizations go here
    absentMapVis = new MapVis("mapParentElement", blockGroupData, tractData, countyData, "2020_absent_pct");
    popMapVis = new MapVis("popMapParent", blockGroupData, tractData, countyData, "total_reg");
    incomeMapVis = new MapVis("incomeMapParent", blockGroupData, tractData, countyData, "mean_hh_income");

    kdeTestPlot = new KdePlot("kdeTest", blockGroupData)

    importanceVis = new ImportanceVis("importanceParentElement", shapData)
}

let fullPage = new fullpage('#fullpage', {
    navigation: true,
    navigationPosition: "right",
    licenseKey: "gplv3-license",
    autoScrolling: true,
});

