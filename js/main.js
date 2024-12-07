// Initalize variables
let memberVote, chosenFeature;
let selectedFeatureCategories = {};
let geoData, shapData;
let kdePlot, ImportanceBeeswarmPlot;
let userGuess = 0.5;

// Initialize map variables
let maps = {};
let mainMap;

// Initialize formatting functions
const pctFormat = value => value.toLocaleString(undefined, {style: 'percent', minimumFractionDigits:2});
const intFormat = value => value.toLocaleString(undefined, { maximumFractionDigits: 0 });
const dollarFormat = value => `$ ${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

let variableMap = {
    "total_reg": "Total Registered Voters", 
    "age_18_19" : "Age 18-19", "age_20_24" : "Age 20-24", "age_25_29" : "Age 25-29", "age_30_34" : "Age 30-34",
    "age_35_44" : "Age 35-44", "age_45_54" : "Age 45-54", "age_55_64" : "Age 55-64", "age_65_74" : "Age 65-74", 
    "age_75_84" : "Age 75-84", "age_85over" : "Age 85+",
    "gender_m" : "Male", "gender_f" : "Female", "gender_unknown" : "Unknown",
    "party_npp" : "Nonpartisan", "party_dem" : "Democrat", "party_rep" : "Republican", "party_lib" : "Libertarian", 
    "party_grn" : "Green", "party_con" : "Conservative", "party_ain" : "Amer. Ind.", "party_scl" : "Socialist", "party_oth" : "Unknown",
    "eth1_eur" : "European", "eth1_hisp" : "Hispanic",
    "eth1_aa" : "African American", "eth1_esa" : "East/South Asian", "eth1_oth" : "Other", "eth1_unk" : "Unknown",
    "lang_english" : "English", "lang_spanish" : "Spanish", "lang_portuguese" : "Portuguese", "lang_chinese" : "Chinese", "lang_italian" : "Italian",
    "lang_vietnamese" : "Vietnamese", "lang_other" : "Other", "lang_unknown" : "Unknown", "mean_hh_income" : "Mean Household Income",
    "total_reg_shap": "Total Registered Voters",
    "age_18_19_shap" : "Age 18-19", "age_20_24_shap" : "Age 20-24", "age_25_29_shap" : "Age 25-29", "age_30_34_shap" : "Age 30-34",
    "age_35_44_shap" : "Age 35-44", "age_45_54_shap" : "Age 45-54", "age_55_64_shap" : "Age 55-64", "age_65_74_shap" : "Age 65-74",
    "age_75_84_shap" : "Age 75-84", "age_85over_shap" : "Age 85+",
    "gender_m_shap" : "Male", "gender_f_shap" : "Female", "gender_unknown_shap" : "Unknown Gender",
    "party_npp_shap" : "Nonpartisan", "party_dem_shap" : "Democrat", "party_rep_shap" : "Republican", "party_lib_shap" : "Libertarian",
    "party_grn_shap" : "Green", "party_con_shap" : "Conservative", "party_ain_shap" : "Amer. Ind.", "party_scl_shap" : "Socialist", "party_oth_shap" : "Unknown Party",
    "eth1_eur_shap" : "European", "eth1_hisp_shap" : "Hispanic",
    "eth1_aa_shap" : "African American", "eth1_esa_shap" : "East/South Asian", "eth1_oth_shap" : "Other", "eth1_unk_shap" : "Unknown Ethnicity",
    "lang_english_shap" : "English", "lang_spanish_shap" : "Spanish", "lang_portuguese_shap" : "Portuguese", "lang_chinese_shap" : "Chinese", "lang_italian_shap" : "Italian",
    "lang_vietnamese_shap" : "Vietnamese", "lang_other_shap" : "Other Language", "lang_unknown_shap" : "Unknown Language", "mean_hh_income_shap" : "Mean Household Income", "base_value_shap" : "Base Value",
    "ALAND20" : "Land Area", "2020_turnout_pct" : "Voter Turnout Percentage", "2020_absent_pct" : "Voter Absence Percentage", "2020_registered" : "Voters Registered",
    "2020_turnout" : "Voter Turnout", "2020_turnout_pct_pred" : "Predicted Voter Turnout Percentage", "2020_absent" : "Voter Absence",
    "2020_absent_pct_pred" : "Predicted Voter Absence Percentage", "2020_turnout_pred" : "Predicted Voter Turnout", "2020_absent_pred" : "Predicted Voter Absence"
}

// Read in data from multiple files via promises
let promises = [
    d3.json('data/block_groups_pred.geojson'), 
    d3.json('data/tracts_pred.geojson'), 
    d3.json('data/counties_pred.geojson'), 
    d3.json('data/shap.json'),
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
    updateCounty(geoData["county"].features[chosenFeatureIdx]);

    ////////// VISUALIZATIONS //////////

    // County map
    countyMap = new CountyVis("countyMapParent",geoData["county"]);

    // Map of demographic variables
    mainMap = new MapVis("mainMapElement", geoData, 
                            ["2020_turnout_pct", "total_reg", "mean_hh_income"], 
                            [["#FFE39F", "#6B9FA1", "#1F4B99"],["#B1ECB5", "#6AAE6A", "#1D7324"],["#E1BAE1", "#9D6D9C", "#5C255C"]],
                            "geoLevel", "demographicVar", "mainMapTooltip");

    // Initialize user guess
    let stateVotes = 0, stateReg = 0;
    geoData["county"].features.forEach(d => {
        stateVotes += d.properties["2020_turnout"];
        stateReg += d.properties["2020_registered"];
    });
    userGuess = stateVotes / stateReg;
    document.getElementById("stateAvg").innerText = pctFormat(userGuess);
    document.getElementById("user-guess").innerText = pctFormat(userGuess);

    // Slider below map
    guessTurnout = new Slider("slider");

    // Density plot
    kdePlot = new KdePlot("kde-plot-parent", geoData["blockGroup"]);
    
    // Feature importance plot
    ImportanceBeeswarmPlot = new Beeswarm("importance-beeswarm-plot", shapData);

    // Map of model results
    modelMap = new MapVis("modelMapElement", geoData, 
                            ["2020_turnout_pct_pred", "2020_turnout_pct"], 
                            // ["2020_turnout_pct_pred", "2020_turnout_pct","2020_absent_pct_pred", "2020_absent_pct"], 
                            [["#FFE39F", "#6B9FA1", "#1F4B99"],["#FFE39F", "#6B9FA1", "#1F4B99"]],
                            // [d3.interpolatePurples, d3.interpolatePurples, d3.interpolateOranges, d3.interpolateOranges], 
                            "geoLevel2", "demographicVar2","modelMapTooltip");

}

function updateCounty(countyInput) {
    
    // Update the chosen feature
    chosenFeature = countyInput;
    
    // Update text in the page to match chosen feature    
    let chosenFeatureSpans = document.getElementsByClassName("chosen-feature");
    for (let i = 0; i < chosenFeatureSpans.length; i++) {
        chosenFeatureSpans[i].innerText = chosenFeature.properties["BASENAME"] + " County";
    }
    document.getElementById("model-guess").innerText = pctFormat(chosenFeature.properties["2020_turnout_pct_pred"]);
    document.getElementById("actual-value").innerText = pctFormat(chosenFeature.properties["2020_turnout_pct"]);

    for (const cat in selectedFeatureCategories) {
        selectedFeatureCategories[cat].wrangleData();
    }

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