//Fenwick tree for each meta-data (feature) to add to time-line, to add and extract meta-data to time-slots
//
// Conseptional idea:
//===================
//
// Different part of a video can have different content. Idea is used today to group videos, by tagging
// each video with a label or tag that says something about the content
// Idea here is to push the tags or features into sub-parts of the video. By doing this search-engines
// may gain the oportunity to set start and stop time to appropriate place in video, based on content
// criterum. One may also gain the opportunity to clip out all part of the video containing this wanted feature,
// and paste them together. Doing this against many videos, can make a effective way of searching for vido contents

// Each number 0,1,2... nmbFeatures is associated with some feature. By updating f.update(timeSlot,feature) on
// give a timeslot of a video a feature.
//
// To extract features, use f.queryFeatures(start,stop) to get a list of features in this time range
class FenwFeatureTree {

    constructor(nmbFeatures,size){
        this.nmbFeatures = nmbFeatures
        this.size = size
        this.tree = []
        for(let i = 0; i < size; i++){
            this.tree[i] = []
            for(let j = 0; j < size; j++){
                this.tree[i][j] = 0
            }
        }
    }

    update(timeSlot, feature, val){
        if(timeSlot == 0) return //must start at 1
        while (timeSlot < this.size){
            this.tree[feature][timeSlot] += val
            timeSlot += timeSlot & (-timeSlot)
        }
    }
    addOne(timeSlot,feature){
        this.update(timeSlot, feature, 1)
    }

    removeOne(timeSlot,feature){
        this.update(timeSlot, feature, -1)
    }


    query(timeSlot){

        let returnArray = []
        for(let j = 0; j < this.nmbFeatures; j++){
            returnArray[j] = 0
        }

        while (timeSlot > 0) {
            for (const [feature, value] of Object.entries(returnArray)){
                returnArray[feature] += this.tree[feature][timeSlot]
            }
            timeSlot -= timeSlot & (-timeSlot)
        }

        return returnArray

    }

    listDiff(listA, listB){
        let retList=[]
        for (const [feature, value] of Object.entries(listA)){
            retList.push(listB[feature]-listA[feature])

        }
        return retList
    }
    rangeQuery(l,r){
        let ret = this.listDiff(this.query(l-1),this.query(r))
        return ret
    }


    extractFeatures(liste){
        let res = []
        for (const [feature, value] of Object.entries(liste)){
            if(liste[feature] != 0){
                res.push(feature)
            }

        }
        return res
    }

    queryFeatures(l,r){
        return this.extractFeatures(this.rangeQuery(l,r))
    }

    rangeSearch(liste,l,r){
        let featureList = this.queryFeatures(l,r)
        let resList = [l,r]

        for (const [key, val] of Object.entries(liste)){

            if(!featureList.some(x => x == val))
                return [-1,-1]
        }

        let midtpoint = Math.floor((l+r)/2)

        if(l != r)
            resList = this.rangeSearch(liste,l,midtpoint)



        if (resList.toString() === [-1,-1].toString()){
            resList = this.rangeSearch(liste,midtpoint+1,r)
            if(resList.toString() === [-1,-1].toString())
                return [l,r]
            else
                return resList
        }
        else
            return resList


    }



}
var timeLineModule = (function(){

    let timeLines = [];
    let fenwFeatureTree;
    let timestamp

    async function getInitState() {
        await $.post("/getInitState",(res)=>{
            this.timestamp = new Date().valueOf();
            this.fenwFeatureTree = new FenwFeatureTree(res.nmbFeatures,res.size)
            this.timestamp = res.timestamp
            for (let key in res.features){
                this.fenwFeatureTree.update(res.features[key].timeslot,res.features[key].featureNmb,res.features[key].val);
            }
            for (let key in res.timelines){
                this.timeLines.push(res.timelines[key])
            }

        }).promise();
    }

    async function sendTimeLine(timeline) {
        await $.post("/addTimeLine",timeline,(res)=>{
            this.timestamp = new Date().valueOf();


        }).promise();
    }
    async function getChanges() {


        await $.post("/getChanges",timestamp, (res)=>{

            this.timestamp = timestamp;

            for (let key in res.features){
                this.fenwFeatureTree.update(res.features[key].timeslot,res.features[key].featureNmb,res.features[key].val);
            }

            for (let key in res.timelines){

                if(res.timelines[key].command=="ADD"){
                        this.timeLines.push(res.timelines[key].postTimeLine)
                }

                else if(res.timelines[key].command=="REMOVE"){
                      let index = this.timeLines.findIndex((x)=>{return x.user == res.timelines[key].preTimeLine.user && x.timestamp == res.timelines[key].preTimeLine.timestamp})
                      this.timeLines.splice(index,1)
                }

                else if(res.timelines[key].command=="CHANGE"){
                      let index = this.timeLines.findIndex((x)=>{return x.user == res.timelines[key].preTimeLine.user && x.timestamp == res.timelines[key].preTimeLine.timestamp})
                      this.timeLines.splice(index,1,timelines[key].postTimeLine)
                }

             }

        }).promise();

    }
    function filterPListByTime(start,end,percent){
        return timeLines.filter((x)=>{
            return x.start >= start && x.end <= end && ((x.start-x.end)/(start-end))*100 >= percent;
        })
    }

    function getPAllTimeLines(){
        return timeLines;
    }

    function extractPFeatures(l,r){
        return this.fenwFeatureTree.queryFeatures(l,r);
    }

    function countPLikes(start,end,percent){
        let timeLinesFilteredTime = filterPListByTime(start,end,percent);
        return timeLinesFilteredTime.reduce((nmbLikes,timeline)=>{
            if(timeline.like) return nmbLikes + 1;
            else              return nmbLikes;
        },0.0)
    }

    function   initPFeatureTree(nmbFeatures,size){
        this.fenwFeatureTree = new FenwFeatureTree(nmbFeatures,size)
    }

    function updateP(timeslot,feature){
        //+1 because we need to start at 1 in fenwick
        this.fenwFeatureTree.addOne(timeslot+1,feature)
    }
    function rangeSearchP(liste,l,r){
        //+1 because we start at 1 in fenwick
        return this.fenwFeatureTree.rangeSearch(liste,l+1,r+1)
    }
    function filterPListByTimeAndUser(start,end,user){
        return timeLines.filter((x)=>{
            return x.start >= start && x.end <= end && x.user == user;
        })
    }
    function getPTimeLine(commentId){
        return []
    }

    function addPTimeLine(timeline){

        timeLines.push(timeline);

    }

    return {
        filterListByTime: function (start,end,percent){
            return filterPListByTime(start,end,percent)
        }
        ,
        getAllTimeLines: function(){
            return getPAllTimeLines()
        }
        ,
        countLikes: function(start,end,percent){
            return countPLikes(start,end,percent)
        },

        filterListByTimeAndUser:  function(start,end,user){
            filterListByTimeAndUser(start,end,user)
        },
        getTimeLine: function(commentId){
            getPTimeLine(commentId)
        } ,

        addTimeLine: function(timeline){
            addPTimeLine(timeline)
        },
        extractFeatureAndUpdate: function(){
            let start=$( "#slider-range" ).slider( "values", 0 )
            let end=$( "#slider-range" ).slider( "values", 1 )
            let featureNumber=$("#featureNumber").val()
            for(let i=start+1; i <= end+1; i++){
                //+1 because we start at 1 in fenwick
                updateP(i,featureNumber)
            }

        },
        extractFeatures: function() {
            let start=$( "#slider-range" ).slider( "values", 0 )
            let end=$( "#slider-range" ).slider( "values", 1 )
            return extractPFeatures(start+1, end+1)
        },
        extractTidslinje: function(){


            let tidslinjeData = {

                user:   $("#commentUser").val().trim(),
                timestamp: new Date().valueOf(),
                start: $( "#slider-range" ).slider( "values", 0 ) ,
                end: $( "#slider-range" ).slider( "values", 1 ),
                text:  $("#commentComment").val().trim(),
                like: $("#likeYes").is(':checked'),
                dislike: $("#dislikeYes").is(':checked')

            }

            return tidslinjeData;

        },
        initFeatureTree: function(nmbFeatures,size){
            initPFeatureTree(nmbFeatures,size)
        },
        update: function(timeslot,feature){
            updateP(timeslot+1,feature)
        },
        rangeSearch: function (){
            let start=$( "#slider-range" ).slider( "values", 0 )
            let end=$( "#slider-range" ).slider( "values", 1 )
            let liste = $( "#featuresToFind" ).val().split(",")
            let res = rangeSearchP(liste,start+1,end+1)
            return [res[0]-1,res[1]-1]
        }

    }
})();
