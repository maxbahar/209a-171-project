// Read in data from multiple files via promises
let promises = [
    d3.json('data/block_groups_proportions.geojson'),
    d3.json('data/block_groups_counts.geojson'),
];
Promise.all(promises)
    .then(data => createVis(data))
    .catch(err => console.log(err));  

function createVis(data) {

    // Log data for confirmation
    // console.log(data);

    // Extract data
    let blockGroupProportionData = data[0];
    let blockGroupCountsData = data[1];

    // TO DO: Visualizations go here
    let myMapVis = new MapVis("mapParentElement", blockGroupProportionData);
    
}

let fullPage = new fullpage('#fullpage', {
    navigation: true,
    navigationPosition: "right",
    licenseKey: "gplv3-license",
    autoScrolling: true,
});