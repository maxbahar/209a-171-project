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

    absentMapVis = new MapVis("mapParentElement", blockGroupData, tractData, countyData, "2020_absent_pct");
    popMapVis = new MapVis("popMapParent", blockGroupData, tractData, countyData, "total_reg");
    incomeMapVis = new MapVis("incomeMapParent", blockGroupData, tractData, countyData, "mean_hh_income");
    kdeTestPlot = new KdePlot("kdeTest", blockGroupData);
    importanceVis = new ImportanceVis("importanceParentElement", shapData);


    //////////////////////////////////////////////// PROTOTYPE //////////////////////////////////////////////////

    // Dummy data for rendering purposes
    const sentimentData = Array.from({ length: 3000 }, (_, i) => ({
        date: new Date(
            2023,
            Math.floor(Math.random() * 12),
            Math.ceil(Math.random() * 28)
        ),
        network: `Demographic Group ${Math.ceil(Math.random() * 5)}`,
        score: Math.random(),
        party: Math.random() > 0.5 ? "Democrat" : "Republican",
    }));

    for (let i = 0; i < 1500; i++) {
        sentimentData.push({
            date: new Date(2023, Math.floor(Math.random() * 12), Math.ceil(Math.random() * 28)),
            network: "Demographic Group 1",
            score: Math.random(),
            party: Math.random() > 0.5 ? "Democrat" : "Republican",
        });
    }

    sentimentVis = new SentimentChart("sentimentParent", sentimentData);

    //////////////////////////////////////////////// PROTOTYPE //////////////////////////////////////////////////

}

let fullPage = new fullpage('#fullpage', {
    navigation: true,
    navigationPosition: "right",
    licenseKey: "gplv3-license",
    autoScrolling: true,
});

