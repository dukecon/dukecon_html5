define(['js/modules/languageutils'], function(languageUtils) {

    var weekDays = {
        'de' : ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"],
        'en' : ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    };

    var weekDaysShort = {
        'de' : ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
        'en' : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    };

    var sortDays = function(dayString1, dayString2) {
        var day1 = dayString1 ? dayString1.split(',')[0] : '';
        var day2 = dayString2 ? dayString2.split(',')[0] : '';
        var posDay1 = weekDays[languageUtils.selectedLanguage()].indexOf(day1);
        var posDay2 = weekDays[languageUtils.selectedLanguage()].indexOf(day2);
        if (posDay1 > posDay2) {
            return 1;
        }
        return posDay1 < posDay2 ? -1 : 0;
    };

    var getDisplayDate = function(datetimeString) {
        return getFullDate(datetimeString, true);
    };

    var getDisplayDateShort = function(datetimeString) {
        return getFullDate(datetimeString, false);
    };

    var getFullDate = function(datetimeString, useLongDay) {
        if (!datetimeString) {
            return '';
        }
        var date = new Date(datetimeString);
        var weekday = useLongDay ?
            weekDays[languageUtils.selectedLanguage()][date.getDay()] :
            weekDaysShort[languageUtils.selectedLanguage()][date.getDay()];
        return weekday + ", " + getNumericDate(datetimeString);
    };

    var getNumericDate = function(datetimeString) {
        if (!datetimeString) {
            return '';
        }
        var date = new Date(datetimeString);
        var month = addLeadingZero(date.getMonth() + 1);
        var day = addLeadingZero(date.getDate());
        return day + "." + month + ".";
    };

    //2016-03-08T10:30
    var getDisplayTime = function(datetimeString) {
        if (!datetimeString) {
            return '';
        }
        var dayAndTime = datetimeString.split('T');
        if (dayAndTime.length != 2) {
            return '';
        }
        var hoursAndMinutes = dayAndTime[1].split(':');
        if (hoursAndMinutes.length < 2) {
            return '';
        }
        return addLeadingZero(hoursAndMinutes[0]) + ":" + addLeadingZero(hoursAndMinutes[1]);
    };

    var getDurationInMinutes = function(dateStartString, dateEndString) {
        if (!dateStartString || !dateEndString) {
            return '';
        }
        var dateStart = new Date(dateStartString);
        var dateEnd = new Date(dateEndString);
        var millis = dateEnd - dateStart;
        return millis / 1000 / 60;
    };

    var getTimeCategory = function(duration) {
        if (typeof duration === 'undefined' || (duration > 30 && duration <= 60)) {
            return "regular";
        }
        if (duration <= 30) {
            return "short";
        }
        return "long";
    };

    var addLeadingZero = function(data) {
        if (typeof data === 'number' && data < 10) {
            return '0' + data;
        }
        if (typeof data === 'string' && parseInt(data) < 10 && parseInt(data).length == 1) {
            return '0' + data;
        }
        return data + '';
    };

    return {
        getDisplayDate : getDisplayDate,
        getDisplayDateShort : getDisplayDateShort,
        getFullDate :  getFullDate,
        getNumericDate : getNumericDate,
        getDisplayTime : getDisplayTime,
        getDurationInMinutes : getDurationInMinutes,
        getTimeCategory : getTimeCategory
    };
});
