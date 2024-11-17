/**
 * handle the vote cast for group member
 * @param groupMemberID
 */
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