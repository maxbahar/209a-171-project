// Initalize variables
let memberVote, chosenFeature;
let selectedFeatureCategories = {};
let blockGroupData, tractData, countyData, shapData;
let kdePlot, importanceVis;

// Initialize map variables
let maps = {};
let mainMap;
let mapMainVars = ["2020_absent_pct", "total_reg", "mean_hh_income"]
let mapIndex = 0;

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
    blockGroupData = data[0];
    tractData = data[1];
    countyData = data[2];
    shapData = data[3];

    // Randomly choose a Block Group (can be changed to accomodate different levels of geography)
    let chosenFeatureIdx = Math.floor(Math.random() * countyData.features.length);
    chosenFeature = countyData.features[chosenFeatureIdx];
    document.getElementById("chosen-feature").innerText = chosenFeature.properties["BASENAME"] + " County";

    // Initialize visualizations

    // Maps
    mainMap = new MapVis("mainMapElement", blockGroupData, tractData, countyData, "2020_absent_pct");
    // maps["absentMap"] = new MapVis("absentMapElement", blockGroupData, tractData, countyData, "2020_absent_pct");
    // maps["popMap"] = new MapVis("popMapParent", blockGroupData, tractData, countyData, "total_reg");
    // maps["incomeMap"] = new MapVis("incomeMapParent", blockGroupData, tractData, countyData, "mean_hh_income");

    console.log(maps);

    // Density plot
    kdePlot = new KdePlot("kde-parent", blockGroupData);
    
    // Feature importance plot
    // importanceVis = new ImportanceVis("importanceParentElement", shapData);


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

    // sentimentVis = new SentimentChart("sentimentParent", sentimentData);

    //////////////////////////////////////////////// PROTOTYPE //////////////////////////////////////////////////

}

function prevMap() {
    if (mapIndex === 0) {
        mapIndex = mapMainVars.length - 1;
    } else {
        mapIndex--;
    }
    console.log(mapIndex);
    mainMap.updateVis(mapMainVars[mapIndex]);
}

function nextMap() {
    if (mapIndex === mapMainVars.length - 1) {
        mapIndex = 0;
    } else {
        mapIndex++;
    }
    console.log(mapIndex);
    mainMap.updateVis(mapMainVars[mapIndex]);
}

let fullPage = new fullpage('#fullpage', {
    navigation: true,
    navigationPosition: "right",
    licenseKey: "gplv3-license",
    autoScrolling: true,
});

let selPrevCard1 = new SelVarPrev("var-sel1", 0)
let selPrevCard2 = new SelVarPrev("var-sel2", 1)
let selPrevCard3 = new SelVarPrev("var-sel3", 2)
