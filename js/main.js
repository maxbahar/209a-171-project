// Initalize variables
let memberVote, chosenFeature;
let selectedFeatureCategories = {};
let blockGroupData, tractData, countyData, shapData;
let absentMapVis, popMapVis, incomeMapVis, kdePlot, importanceVis;


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
    let chosenFeatureIdx = Math.floor(Math.random() * tractData.features.length);
    chosenFeature = tractData.features[chosenFeatureIdx];
    document.getElementById("chosen-feature").innerText = chosenFeature.properties["BASENAME"];

    // Initialize visualizations

    // Maps
    // absentMapVis = new MapVis("absentMapElement", blockGroupData, tractData, countyData, "2020_absent_pct");
    // popMapVis = new MapVis("popMapParent", blockGroupData, tractData, countyData, "total_reg");
    // incomeMapVis = new MapVis("incomeMapParent", blockGroupData, tractData, countyData, "mean_hh_income");

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

let fullPage = new fullpage('#fullpage', {
    navigation: true,
    navigationPosition: "right",
    licenseKey: "gplv3-license",
    autoScrolling: true,
});

let selPrevCard1 = new SelVarPrev("var-sel1", 0)
let selPrevCard2 = new SelVarPrev("var-sel2", 1)
let selPrevCard3 = new SelVarPrev("var-sel3", 2)
