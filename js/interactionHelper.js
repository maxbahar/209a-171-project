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
let textMap = {
    "none": "",
    "vote-party":"Our model includes 10 party categories",
    "vote-gender":"Our model includes: male, female, and unknown",
    "vote-age":"Our model includes 10 age groups",
    "vote-income":"Our model considers mean incomes",
    "vote-lang":"Our model includes 8 language categories",
    "vote-eth":"Our model considers 6 ethnicity categories",
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
        // document.getElementById(`barPlot${votecatIdx}`).classList.remove("barPlotContainer");
        let parentDiv = document.getElementById(`barPlot${votecatIdx}`)
        let svgElement = parentDiv.querySelector("svg");

        // Remove the SVG if it exists
        if (svgElement) {
            parentDiv.removeChild(svgElement);
        }
        
        // Reset title
        document.getElementById(`barTitle${votecatIdx}`).innerText = titleMap["none"];

    } else if (Object.keys(selectedFeatureCategories).length <= 2) {

        // document.getElementById(`barPlot${votecatIdx}`).classList.add("barPlotContainer");
        selectedFeatureCategories[categoryID] = new BarVis(`barPlot${votecatIdx}`, geoData, categoryID);
        document.getElementById(`barTitle${votecatIdx}`).innerText = titleMap[categoryID];
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


    // document.getElementById("user-cat-sel-info").innerText = nStr;

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