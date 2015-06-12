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

    getDisplayDate : function(datetimeString) {
        return this.splitDate(datetimeString, 'T')[0];
    },

    getDisplayTime : function(datetimeString) {
        return this.splitDate(datetimeString, 'T')[1];
    }
};


function Talk(data) {
    this.id = data.id;
    this.startDisplayed = utils.getDisplayDate(data.start) + ", " + utils.getDisplayTime(data.start);
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

    self.detailView = function() {
        console.log("TODO: self.detailView");
    }

    self.toggleDetail = function(element) {
        if (this.detailVisible) {
            this.toggleText("more...");
            $('#' + this.id).removeClass("visible");
            $('#' + this.id).addClass("hidden");
        }
        else {
            this.toggleText("less...");
            $('#' + this.id).addClass("visible");
            $('#' + this.id).removeClass("hidden");
        }
        this.detailVisible = !this.detailVisible;
    };
}

function TalkListViewModel() {
    // Data
    var self = this;
    self.talks = ko.observableArray([]);
    self.allTalks = [];

    // Sorting by column
    self.headers = [
        { title:'Time', sortKey:'startSortable', asc: true, cssClass: 'clickable' },
        { title:'Track', sortKey:'track', asc: true, cssClass: 'clickable' },
        { title:'Room', sortKey:'location', asc: true, cssClass: 'clickable' },
        { title:'Title', sortKey:'title', asc: true, cssClass: 'clickable' },
        { title:'Abstract', sortKey:'', asc: true, cssClass: '' }
    ];

    self.activeSort = self.headers[0]; //set the default sort

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

    // filter
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

    self.filters = [
        //{title: 'Day', filterKey: 'start', values: []},
        {title: 'Level', filterKey: 'level', filtervalues : ko.observableArray([]), selected : ko.observableArray([])},
        {title: 'Language', filterKey: 'language', filtervalues : ko.observableArray([]), selected : ko.observableArray([])},
        {title: 'Track', filterKey: 'track', filtervalues : ko.observableArray([]), selected : ko.observableArray([])},
        //{title: 'Speaker', filterKey: 'speakers', values: []},
        {title: 'Room', filterKey: 'location', filtervalues : ko.observableArray([]), selected : ko.observableArray([])}
    ];

    $.each(self.filters, function(index, filter) {
        filter.selected.subscribe(function(s) {
            self.filterTalks();
        });
    });

    self.filterTalks = function() {
        self.talks(_.filter(self.allTalks, function(talk) {
           return _.every(self.filters, function(filter) {
               if (filter.selected().length === 0) {
                   return true;
               }
               return _.some(filter.selected(), function(selected) {
                   return talk[filter.filterKey] === selected;
                })
           });
        }));
    };

    // Get data
    $.ajax({
      method: 'GET',
      dataType: "json",
      url: jsonUrl,
      success: function(allData) {
          var mappedTalks = $.map(allData, function(item) { return new Talk(item) });
          self.talks(mappedTalks);
          self.allTalks = mappedTalks;
          self.addFilters();
          console.log("Talks updated - " + utils.getFormattedDate(new Date()));
      },
      error: function(error) {
        console.log("Nothing updated. Device offline?");
      }
    });

}

ko.applyBindings(new TalkListViewModel());

