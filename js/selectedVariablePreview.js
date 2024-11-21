class SelVarPrev{
    constructor(parentElementID, arrayIndex) {
        this.parentElementID = parentElementID;
        this.arrayIndex = arrayIndex;
        this.initVis()





    }

    initVis(){
        let vis = this;
        vis.titleID =vis.parentElementID+"-title"
        vis.cardID = vis.parentElementID+"-card"
        vis.imageID = vis.parentElementID+"-img"

        vis.titleMap = {
            "none": "Nothing Selected",
            "vote-party":"Party Affiliation",
            "vote-gender":"Gender",
            "vote-age":"Age",
            "vote-income":"Mean Income",
            "vote-lang":"Language Spoken",
            "vote-eth":"Ethnicity",
        }
        vis.textMap = {
            "none": "",
            "vote-party":"Our model includes 10 party categories",
            "vote-gender":"Our model includes: male, female, and unknown",
            "vote-age":"Our model includes 10 age groups",
            "vote-income":"Our model considers mean incomes",
            "vote-lang":"Our model includes 8 language categories",
            "vote-eth":"Our model considers 6 ethnicity categories",
        }
        vis.imageMap = {
            "none": "/images/250.png",
            "vote-party":"/images/align.png",
            "vote-gender":"/images/gender.png",
            "vote-age":"/images/cake.png",
            "vote-income":"/images/money.png",
            "vote-lang":"/images/lang.png",
            "vote-eth":"/images/globe.png",
        }
        vis.wrangleData()
    }
    wrangleData(){
        let vis = this;
        let arr = Object.keys(selectedFeatureCategories)
        if(arr.length > vis.arrayIndex){
            vis.selID =arr[vis.arrayIndex]
        }else{
            vis.selID = 'none'
        }

        vis.updateVis();

    }
    updateVis(){
        let vis = this;

        document.getElementById(vis.titleID).innerText = vis.titleMap[vis.selID]
        document.getElementById(vis.cardID).innerText = vis.textMap[vis.selID]
        document.getElementById(vis.imageID).src = vis.imageMap[vis.selID]

    }
}

