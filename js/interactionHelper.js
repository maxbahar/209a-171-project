let votecatIdx = 1;

/**
 * handle the vote cast for group member
 * @param groupMemberID
 */
function voted(groupMemberID) {
    memberVote = groupMemberID
    document.querySelectorAll('.vote-box').forEach(function (div) {
        div.classList.remove('clicked-vote-box');
    });
    const clickedDiv = document.getElementById(groupMemberID);
    if (clickedDiv) {
        clickedDiv.classList.add('clicked-vote-box');
    }
}

/**
 * handle the category voting on second page
 * @param categoryID
 */
function votecat(categoryID) {
    if (categoryID in selectedFeatureCategories) {
        delete selectedFeatureCategories[categoryID];

        // Remove barplot
        votecatIdx--;
        document.getElementById(`barPlot${votecatIdx}`).classList.remove("barPlotContainer");
        let parentDiv = document.getElementById(`barPlot${votecatIdx}`)
        let svgElement = parentDiv.querySelector("svg");

        // Remove the SVG if it exists
        if (svgElement) {
            parentDiv.removeChild(svgElement);
        }
        

    } else if (Object.keys(selectedFeatureCategories).length <= 2) {

        document.getElementById(`barPlot${votecatIdx}`).classList.add("barPlotContainer");
        selectedFeatureCategories[categoryID] = new BarVis(`barPlot${votecatIdx}`, blockGroupData, tractData, countyData, categoryID);
        votecatIdx++;
    }
    document.querySelectorAll('.vote-box2').forEach(function (div) {
        div.classList.remove('clicked-vote-box');
    });
    Object.keys(selectedFeatureCategories).forEach((categoryID) => {
        const clickedDiv = document.getElementById(categoryID);
        if (clickedDiv) {
            clickedDiv.classList.add('clicked-vote-box');
        }
    })

    // update text
    let nStr = ""
    if (selectedFeatureCategories.size === 0) {
        nStr = "user made no selections on previous slide"
    } else {
        nStr = "user selected the following categories: "
        Object.keys(selectedFeatureCategories).forEach((categoryID) => {
            nStr += categoryID + ', '
        })
    }

    document.getElementById("user-cat-sel-info").innerText = nStr;
    
}