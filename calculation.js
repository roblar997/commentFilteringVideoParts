
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

     update(timeSlot, feature){
        while (timeSlot < this.size){
           this.tree[feature][timeSlot] += 1
           timeSlot += timeSlot & (-timeSlot)
        }
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


}
var timeLineModule = (function(){

   let timeLines = [];

    function filterPListByTime(start,end,percent){
            return timeLines.filter((x)=>{
                     return x.start >= start && x.end <= end && ((x.start-x.end)/(start-end))*100 >= percent;
            })
     }

    function getPAllTimeLines(){
        return timeLines;
    }

    function countPLikes(start,end,percent){
        let timeLinesFilteredTime = filterPListByTime(start,end,percent);
                         return timeLinesFilteredTime.reduce((nmbLikes,timeline)=>{
                                    if(timeline.like) return nmbLikes + 1;
                                    else              return nmbLikes;
                                   },0.0)
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
    extractTidslinje: function(){


                let tidslinjeData = {

                   user:   $("#commentUser").val().trim(),
                   start: $( "#slider-range" ).slider( "values", 0 ) ,
                   end: $( "#slider-range" ).slider( "values", 1 ),
                   text:  $("#commentComment").val().trim(),
                   like: $("#likeYes").is(':checked'),
                   dislike: $("#dislikeYes").is(':checked')

              }

                return tidslinjeData;

    },

   }
})();
