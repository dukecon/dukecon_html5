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

}

ko.applyBindings(new TalkListViewModel());