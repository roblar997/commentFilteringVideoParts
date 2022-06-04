
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
