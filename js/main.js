// Read in data from the GeoJSON file
d3.json('data/block_groups.geojson').then(data => {
    
    // Log data for confirmation
    console.log(data);

    // TO DO: Visualizations go here

});


let fullPage = new fullpage('#fullpage', {
    navigation: true,
    navigationPosition: "right",
    licenseKey: "gplv3-license",
    autoScrolling: true,
});