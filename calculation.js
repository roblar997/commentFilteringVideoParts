
var timeLineModule = (function(){

   let timeLines = [];

    function filterPListByTime(start,end){
            return timeLines.filter((x)=>{
                     return x.start >= start && x.end <= end;
            })
     }

    function getPAllTimeLines(){
        return timeLines;
    }

    function countPLikes(start,end){
        let timeLinesFilteredTime = filterPListByTime(start,end);
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
    filterListByTime: function (start,end){
            return filterPListByTime(start,end)
    }
    ,
    getAllTimeLines: function(){
         return getPAllTimeLines()
    }
     ,
    countLikes: function(start,end){
                return countPLikes(start,end)
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