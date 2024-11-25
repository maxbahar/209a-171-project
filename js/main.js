// Initalize variables
let memberVote, chosenFeature;
let selectedFeatureCategories = {};
let geoData, shapData;
let kdePlot, ImportanceBeeswarmPlot;
let userGuess = 0.5;

// Initialize map variables
let maps = {};
let mainMap;

let variableMap = {
    "total_reg": "Total Registered Voters", 
    "age_18_19" : "Age 18-19", "age_20_24" : "Age 20-24", "age_25_29" : "Age 25-29", "age_30_34" : "Age 30-34",
    "age_35_44" : "Age 35-44", "age_45_54" : "Age 45-54", "age_55_64" : "Age 55-64", "age_65_74" : "Age 65-74", 
    "age_75_84" : "Age 75-84", "age_85over" : "Age 85+",
    "gender_m" : "Male", "gender_f" : "Female", "gender_unknown" : "Unknown", 
    "party_npp" : "Nonpartisan", "party_dem" : "Democrat", "party_rep" : "Republican", "party_lib" : "Libertarian", 
    "party_grn" : "Green", "party_con" : "Conservative", "party_ain" : "American Independent", "party_scl" : "Socialist", "party_oth" : "Unknown", 
    "eth1_eur" : "European", "eth1_hisp" : "Hispanic",
    "eth1_aa" : "African American", "eth1_esa" : "East/South Asian", "eth1_oth" : "Other", "eth1_unk" : "Unknown",
    "lang_english" : "English", "lang_spanish" : "Spanish", "lang_portuguese" : "Portuguese", "lang_chinese" : "Chinese", "lang_italian" : "Italian",
    "lang_vietnamese" : "Vietnamese", "lang_other" : "Other", "lang_unknown" : "Unknown", "mean_hh_income" : "Mean Household Income",
    "ALAND20" : "Land Area", "2020_turnout_pct" : "Voter Turnout Percentage", "2020_absent_pct" : "Voter Absence Percentage", "2020_reg" : "Voters Registered",
    "2020_turnout" : "Voter Turnout", "2020_turnout_pct_pred" : "Predicted Voter Turnout Percentage", "2020_absent" : "Voter Absence",
    "2020_absent_pct_pred" : "Predicted Voter Absence Percentage", "2020_turnout_pred" : "Predicted Voter Turnout", "2020_absent_pred" : "Predicted Voter Absence"
}

// Read in data from multiple files via promises
let promises = [
    d3.json('data/block_groups_pred.geojson'), 
    d3.json('data/tracts_pred.geojson'), 
    d3.json('data/counties_pred.geojson'), 
    d3.csv('data/shap.json'),
    d3.json('data/counties.geojson'),
];
Promise.all(promises)
    .then(data => {
        createVis(data);

        // Initialize the diverging bar plot
        const countiesData = data[data.length - 1];
        renderDivergingBarPlot(countiesData);
    })
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
                            ["2020_turnout_pct", "2020_absent_pct", "total_reg", "mean_hh_income"], 
                            [d3.interpolatePurples, d3.interpolateOranges, d3.interpolateReds, d3.interpolateBlues],
                            "geoLevel", "demographicVar","mainMapTooltip");

    // Initialize user guess
    let stateVotes = 0, stateReg = 0;
    geoData["county"].features.forEach(d => {
        stateVotes += d.properties["2020_turnout"];
        stateReg += d.properties["2020_reg"];
    });
    userGuess = stateVotes / stateReg;
    document.getElementById("stateAvg").innerText = userGuess.toLocaleString();
    document.getElementById("user-guess").innerText = userGuess.toLocaleString();

    // Slider below map
    guessTurnout = new Slider("slider");

    // Density plot
    kdePlot = new KdePlot("kde-plot-parent", geoData["blockGroup"]);
    
    // Feature importance plot
    ImportanceBeeswarmPlot = new Beeswarm("importance-beeswarm-plot");

    // Map of model results
    modelMap = new MapVis("modelMapElement", geoData, 
                            ["2020_turnout_pct_pred", "2020_turnout_pct","2020_absent_pct_pred", "2020_absent_pct"], 
                            [d3.interpolatePurples, d3.interpolatePurples, d3.interpolateOranges, d3.interpolateOranges], 
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

    sentimentVis = new SentimentChart("by-network", sentimentData);

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