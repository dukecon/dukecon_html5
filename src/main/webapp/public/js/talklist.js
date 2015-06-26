function TalkListViewModel() {
    // Data
    var self = this;
    self.groupedTalks = ko.observableArray([]);
    self.allTalks = [];

    self.filters = [
        {title: 'Level', filterKey: 'level', filtervalues : ko.observableArray([]), selected : ko.observableArray([])},
        {title: 'Language', filterKey: 'language', filtervalues : ko.observableArray([]), selected : ko.observableArray([])},
        {title: 'Track', filterKey: 'track', filtervalues : ko.observableArray([]), selected : ko.observableArray([])},
        {title: 'Room', filterKey: 'location', filtervalues : ko.observableArray([]), selected : ko.observableArray([])}
    ];

    self.days = ko.observableArray([]);
    self.selectedDayIndex = ko.observable(0);
    self.selectedDay = "";

    // Initialize
    $.each(self.filters, function(index, filter) {
        filter.selected.subscribe(function(s) {
            self.filterTalks();
        });
    });

    dukeconStorageUtils.getData(function(allData) {
        self.initializeData(allData);
    });

    self.initializeData = function(allData) {
        var mappedTalks = $.map(allData, function(item) { return new Talk(item) }).sort(self.sortTalk);
        self.groupedTalks(self.groupTalks(mappedTalks));
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
       var filtered = _.filter(self.allTalks, function(talk) {
            return talk.day === self.selectedDay && _.every(self.filters, function(filter) {
                if (filter.selected().length === 0) {
                    return true;
                }
                return _.some(filter.selected(), function(selected) {
                    return talk[filter.filterKey] === selected;
                })
            });
        });
        self.groupedTalks(self.groupTalks(filtered));
    };

    self.groupTalks = function(talks) {
        var grouped = _.groupBy(talks, function(talk) {
            return talk.startDisplayed;
        });
        return _.map(_.keys(grouped), function(time) {
            return {"start" : time, "talks" : grouped[time]};
        });
    };

    self.updateDay = function(day, event) {
        self.selectedDay = day;
        self.selectedDayIndex(ko.contextFor(event.target).$index());
        self.filterTalks();
    }
}

ko.applyBindings(new TalkListViewModel());