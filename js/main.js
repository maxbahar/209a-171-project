// Read in data from multiple files via promises
let promises = [
    d3.json('data/block_groups.geojson'),
    d3.json('data/tracts.geojson'),
    d3.json('data/counties.geojson'),
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

    // TO DO: Visualizations go here
    let myMapVis = new MapVis("mapParentElement", blockGroupData, tractData, countyData);
    
}

let fullPage = new fullpage('#fullpage', {
    navigation: true,
    navigationPosition: "right",
    licenseKey: "gplv3-license",
    autoScrolling: true,
});

function voted(groupMemberID) {
    memberVote = groupMemberID
    document.querySelectorAll('.vote-box').forEach(function(div) {
        div.classList.remove('clicked-vote-box');
    });
    const clickedDiv = document.getElementById(groupMemberID);
    if (clickedDiv) {
        clickedDiv.classList.add('clicked-vote-box');
    }
}