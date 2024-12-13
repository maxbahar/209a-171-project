
// Define index for voter demographic category
let votecatIdx = 1;

let titleMap = {
    "none": "Nothing Selected",
    "vote-party":"Party Affiliation",
    "vote-gender":"Gender",
    "vote-age":"Age",
    "vote-income":"Mean Income",
    "vote-lang":"Language Spoken",
    "vote-eth":"Ethnicity",
}

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
        let parentDiv = document.getElementById(`barPlot${votecatIdx}`)
        let svgElement = parentDiv.querySelector("svg");

        // Remove the SVG if it exists
        if (svgElement) {
            parentDiv.removeChild(svgElement);
        }
        
        // Reset title
        document.getElementById(`barTitle${votecatIdx}`).innerText = titleMap["none"];

    } else if (Object.keys(selectedFeatureCategories).length <= 2) {

        selectedFeatureCategories[categoryID] = new BarVis(`barPlot${votecatIdx}`, geoData, categoryID);
        votecatIdx++;
    }

    document.querySelectorAll('.vote-box2').forEach(function (div) {
        div.classList.remove('clicked-vote-box');
    });

    Object.keys(selectedFeatureCategories).forEach((categoryID,idx) => {

        const parentDiv = document.getElementById(`barPlot${idx+1}`);
        const svgElement = parentDiv.querySelector("svg");
        if (svgElement) {
            parentDiv.removeChild(svgElement);
        }

        delete selectedFeatureCategories[categoryID];
        selectedFeatureCategories[categoryID] = new BarVis(`barPlot${idx+1}`, geoData, categoryID);
        
        document.getElementById(`barTitle${idx+1}`).innerText = titleMap[categoryID];
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

    if(Object.keys(selectedFeatureCategories).length > 1){
        document.getElementById("val-sel-count").innerText = "You have selected "+Object.keys(selectedFeatureCategories).length+" categories";
    }
    else if (Object.keys(selectedFeatureCategories).length === 1) {
        document.getElementById("val-sel-count").innerText = "You have selected 1 category";
    } else {
        document.getElementById("val-sel-count").innerText = "You have made no selections, please return to previous slide to vote.";
    }

    selPrevCard1.wrangleData();
    selPrevCard2.wrangleData();
    selPrevCard3.wrangleData();
    
}

function onKdeSelChange(){
    let selectedVal = document.getElementById("kde-select").value;
    kdePlot.selectionChange(selectedVal);
}