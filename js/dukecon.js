var jsonUrl = "talks.json";
//var jsonUrl = "http://dev.dukecon.org:9090/talks";
var originHeader = "http://dev.dukecon.org";

function Talk(data) {
    this.id = data.id;
    this.day = dukeconDateUtils.getDisplayDate(data.start);
    this.startDisplayed = dukeconDateUtils.getDisplayTime(data.start);
    this.startSortable = data.start;
    this.track = data.track;
    this.location = data.location;
    this.level = data.level;
    this.title = data.title;
    this.speakers = data.speakers;
    this.language = data.language;
    this.shortAbstract = data.abstractText.substring(0, 100) + "...";
    this.fullAbstract = data.abstractText;
    this.detailVisible = false;
    this.toggleText = ko.observable("more...");

    self.toggleDetail = function(element) {
        if (this.detailVisible) {
            this.toggleText("more...");
            $('#' + this.id).removeClass("shown");
            $('#' + this.id).addClass("folded");
        }
        else {
            this.toggleText("less...");
            $('#' + this.id).addClass("shown");
            $('#' + this.id).removeClass("folded");
        }
        this.detailVisible = !this.detailVisible;
    };
};

function Speaker(name, company, talks) {
    this.name = name;
    this.company = company;
    this.talks = talks;
};

var dukeconDateUtils = {

    weekDays : ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"],

    getDisplayDate : function(datetimeString) {
        var date = new Date(datetimeString);
        var month = this.addTrailingZero(date.getMonth() + 1);
        var day = this.addTrailingZero(date.getDate());
        var weekDay = this.weekDays[date.getDay()];
        return weekDay + ", " + day + "." + month;
    },

    getDisplayTime : function(datetimeString) {
        var date = new Date(datetimeString);
        return this.addTrailingZero(date.getHours()) + ":" + this.addTrailingZero(date.getMinutes());
    },

    addTrailingZero : function(data) {
        if (data < 10) {
            return '0' + data;
        }
        return data;
    }
};
