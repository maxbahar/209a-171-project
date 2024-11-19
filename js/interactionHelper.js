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
    if (selectedFeatureCategories.has(categoryID)) {
        selectedFeatureCategories.delete(categoryID);
    } else if (selectedFeatureCategories.size <= 2) {
        selectedFeatureCategories.add(categoryID);
    }
    document.querySelectorAll('.vote-box2').forEach(function (div) {
        div.classList.remove('clicked-vote-box');
    });
    selectedFeatureCategories.forEach((categoryID) => {
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
        selectedFeatureCategories.forEach((categoryID) => {
            nStr += categoryID + ', '
        })
    }

    document.getElementById("user-cat-sel-info").innerText = nStr;
    
}
