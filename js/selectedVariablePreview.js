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
            "vote-party":"The data includes 10 party categories",
            "vote-gender":"The data includes male, female, and unknown",
            "vote-age":"The data includes 10 age groups",
            "vote-income":"The data includes mean household income",
            "vote-lang":"The data includes 8 language categories",
            "vote-eth":"The data includes 6 ethnicity categories",
        }
        vis.imageMap = {
            "none": "/img/250.png",
            "vote-party":"/img/align.png",
            "vote-gender":"/img/gender.png",
            "vote-age":"/img/cake.png",
            "vote-income":"/img/money.png",
            "vote-lang":"/img/lang.png",
            "vote-eth":"/img/globe.png",
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

