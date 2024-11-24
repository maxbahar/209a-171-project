// Initalize variables
let memberVote, chosenFeature;
let selectedFeatureCategories = {};
let geoData, shapData;
let kdePlot, importanceVis;
let userGuess = 0.5;

// Initialize map variables
let maps = {};
let mainMap;

// Read in data from multiple files via promises
let promises = [
    d3.json('data/block_groups_pred.geojson'), 
    d3.json('data/tracts_pred.geojson'), 
    d3.json('data/counties_pred.geojson'), 
    d3.csv('data/shap_values.csv'),
];
Promise.all(promises)
    .then(data => createVis(data))
    .catch(err => console.log(err));  

function createVis(data) {

    // Extract data
    geoData = {
        "blockGroup": data[0],
        "tract": data[1],
        "county": data[2]
    }
    shapData = data[3];

    // Choose a feature for users to guess
    let chosenFeatureIdx = Math.floor(Math.random() * geoData["county"].features.length);
    chosenFeature = geoData["county"].features[chosenFeatureIdx];
    
    // Update text in the page to match chosen feature    
    let chosenFeatureSpans = document.getElementsByClassName("chosen-feature");
    for (let i = 0; i < chosenFeatureSpans.length; i++) {
        chosenFeatureSpans[i].innerText = chosenFeature.properties["BASENAME"] + " County";
    }
    document.getElementById("model-guess").innerText = chosenFeature.properties["2020_turnout_pct_pred"].toLocaleString();
    document.getElementById("actual-value").innerText = chosenFeature.properties["2020_turnout_pct"].toLocaleString();

    ////////// VISUALIZATIONS //////////

    // County map
    countyMap = new CountyVis("countyMapParent",geoData["county"]);

    // Map of demographic variables
    mainMap = new MapVis("mainMapElement", geoData, 
                            ["2020_absent_pct", "total_reg", "mean_hh_income"], 
                            [d3.interpolatePurples,d3.interpolateReds, d3.interpolateBlues],
                            "geoLevel", "demographicVar","mainMapTooltip");
    
    // Slider below map
    let stateVotes = 0, stateReg = 0;
    geoData["county"].features.forEach(d => {
        stateVotes += d.properties["2020_turnout"];
        stateReg += d.properties["2020_reg"];
    });
    guessTurnout = new Slider("slider")

    // Initialize user guess
    userGuess = stateVotes / stateReg;
    document.getElementById("stateAvg").innerText = userGuess.toLocaleString();
    document.getElementById("user-guess").innerText = userGuess.toLocaleString();

    // Density plot
    kdePlot = new KdePlot("kde-plot-parent", geoData["blockGroup"]);
    
    // Feature importance plot
    // importanceVis = new ImportanceVis("importanceParentElement", shapData);

    // Map of model results
    modelMap = new MapVis("modelMapElement", geoData, 
                            ["2020_absent_pct_pred", "2020_absent_pct"], 
                            [d3.interpolatePurples, d3.interpolatePurples], 
                            "geoLevel2", "demographicVar2","modelMapTooltip");

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

// Slide navigation
let fullPage = new fullpage('#fullpage', {
    navigation: true,
    navigationPosition: "right",
    licenseKey: "gplv3-license",
    autoScrolling: true,
});

// Dynamic variables selection
let selPrevCard1 = new SelVarPrev("var-sel1", 0)
let selPrevCard2 = new SelVarPrev("var-sel2", 1)
let selPrevCard3 = new SelVarPrev("var-sel3", 2)