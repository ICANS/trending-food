exports.nicetime = (function() {
 
    /*
     * JavaScript Pretty Date
     * Copyright (c) 2008 John Resig (jquery.com)
     * Licensed under the MIT license.
     * https://gist.github.com/1290591
     */

    return function(time) {
        var date = new Date(time),
            diff = (((new Date()).getTime() - date.getTime()) / 1000),
            day_diff = Math.floor(diff / 86400);
                
        if ( isNaN(day_diff) || day_diff < 0 || day_diff >= 31 )
            return;
                
        return day_diff == 0 && (
                diff < 60 && "just now" ||
                diff < 120 && "1 minute ago" ||
                diff < 3600 && Math.floor( diff / 60 ) + " minutes ago" ||
                diff < 7200 && "1 hour ago" ||
                diff < 86400 && Math.floor( diff / 3600 ) + " hours ago") ||
            day_diff == 1 && "Yesterday" ||
            day_diff < 7 && day_diff + " days ago" ||
            day_diff < 31 && Math.ceil( day_diff / 7 ) + " weeks ago";
    };
 
})();

exports.getFormattedDate = function (date) {
    var d = date.getDate();
    var m = date.getMonth()+1;
    var y = date.getFullYear();
    return getWeekday(date) + ', ' + (d<=9?'0'+d:d) +'.'+ (m<=9?'0'+m:m) +'.'+ y;
}

exports.getWeekday = getWeekday = function (date) {

    var weekday = new Array(7);
    
    weekday[0] = "Sonntag";
    weekday[1] = "Montag";
    weekday[2] = "Dienstag";
    weekday[3] = "Mittwoch";
    weekday[4] = "Donnerstag";
    weekday[5] = "Freitag";
    weekday[6] = "Samstag";

    var n = weekday[date.getDay()];
    return n;
};

exports.handleError = handleError = function (error) {
    console.trace(error);
};

exports.parseJSON = function (json) {
    try {
        return JSON.parse(json);
    } catch(err) {
        handleError(err);
        return {};
    }
};