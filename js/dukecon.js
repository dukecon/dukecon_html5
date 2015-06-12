var jsonUrl = "talks.json";
//var jsonUrl = "http://dev.dukecon.org:9090/talks";
var originHeader = "http://dev.dukecon.org";


var utils = {
    getFormattedDate : function(timestamp) {
        return timestamp.getFullYear() + '-' + (timestamp.getMonth() + 1) + '-' + timestamp.getDate() + ", " +
            timestamp.getHours() + ':' +  timestamp.getMinutes() + '.' + timestamp.getSeconds();
    },

    splitDate: function(datetimeString, splitter) {
        var parsed = datetimeString.split(splitter);
        if (parsed.length == 2) {
            return parsed;
        }
        else {
            return [datetimeString, ''];
        }
    },

    //format is: 2015-03-25T09:00
    getDisplayDate : function(datetimeString) {
        var dateString = this.splitDate(datetimeString, 'T')[0];
        var parsed = dateString.split("-");
        var month = parsed[1];
        var day = parsed[2];
        return day + "." + month;
    },

    getDisplayTime : function(datetimeString) {
        return this.splitDate(datetimeString, 'T')[1];
    }
};

function Talk(data) {
    this.id = data.id;
    this.day = utils.getDisplayDate(data.start);
    this.startDisplayed = utils.getDisplayTime(data.start);
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
}

function TalkListViewModel() {
    // Data
    var self = this;
    self.talks = ko.observableArray([]);
    self.allTalks = [];

    self.headers = [
        { title:'Time', sortKey:'startSortable', asc: true, cssClass: 'clickable' },
        { title:'Track', sortKey:'track', asc: true, cssClass: 'clickable' },
        { title:'Room', sortKey:'location', asc: true, cssClass: 'clickable' },
        { title:'Title', sortKey:'title', asc: true, cssClass: 'clickable' },
        { title:'Abstract', sortKey:'', asc: true, cssClass: '' }
    ];

    self.activeSort = self.headers[0]; //default sort

    self.filters = [
        {title: 'Level', filterKey: 'level', filtervalues : ko.observableArray([]), selected : ko.observableArray([])},
        {title: 'Language', filterKey: 'language', filtervalues : ko.observableArray([]), selected : ko.observableArray([])},
        {title: 'Track', filterKey: 'track', filtervalues : ko.observableArray([]), selected : ko.observableArray([])},
        {title: 'Room', filterKey: 'location', filtervalues : ko.observableArray([]), selected : ko.observableArray([])}
    ];

    self.days = ko.observableArray([]);
    self.selectedDay = "";

    // Initialize
    $.each(self.filters, function(index, filter) {
        filter.selected.subscribe(function(s) {
            self.filterTalks();
        });
    });

    $.ajax({
      method: 'GET',
      dataType: "json",
      url: jsonUrl,
      success: function(allData) {
         self.initializeData(allData);
      },
      error: function(error) {
        console.log("Nothing updated. Device offline?");
      }
    });

    self.initializeData = function(allData) {
        var mappedTalks = $.map(allData, function(item) { return new Talk(item) }).sort(self.sortTalk);
        self.talks(mappedTalks);
        self.allTalks = mappedTalks;
        self.days(self.getDistinctValues('day'));
        self.selectedDay = self.days()[0];
        self.addFilters();
        self.filterTalks();
        console.log("Talks updated - " + utils.getFormattedDate(new Date()));
    };

    self.sortTalk = function(t1, t2) {
        if (t1.startDisplayed < t2.startDisplayed) {
            return -1;
        }
        return t1.startDisplayed > t2.startDisplayed ? 1 : 0;
    };

    // Functions
    self.addFilters = function() {
        $.each(self.filters, function(index, filter) {
            filter.filtervalues(self.getDistinctValues(filter.filterKey));
        });
    };

    self.getDistinctValues = function(key) {
        var t = _.groupBy(self.allTalks, function(talk) {
            return talk[key];
        });
        return _.keys(t).sort();
    };

    self.filterTalks = function() {
        self.talks(_.filter(self.allTalks, function(talk) {
            return talk.day === self.selectedDay && _.every(self.filters, function(filter) {
                if (filter.selected().length === 0) {
                    return true;
                }
                return _.some(filter.selected(), function(selected) {
                    return talk[filter.filterKey] === selected;
                })
            });
        }));
    };

    self.updateDay = function(day) {
        self.selectedDay = day;
        self.filterTalks();
    }

    self.sort = function(header, event){
        //if this header was just clicked a second time
        if(self.activeSort === header) {
            header.asc = !header.asc; //toggle the direction of the sort
        } else {
            self.activeSort = header; //first click, remember it
        }
        var prop = self.activeSort.sortKey;
        var ascSort = function(a,b){ return a[prop] < b[prop] ? -1 : a[prop] > b[prop] ? 1 : a[prop] == b[prop] ? 0 : 0; };
        var descSort = function(a,b){ return a[prop] > b[prop] ? -1 : a[prop] < b[prop] ? 1 : a[prop] == b[prop] ? 0 : 0; };
        var sortFunc = self.activeSort.asc ? ascSort : descSort;
        self.talks.sort(sortFunc);
    };

}

ko.applyBindings(new TalkListViewModel());

