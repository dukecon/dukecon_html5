function TalkListViewModel() {
    // Data
    var self = this;
    self.groupedTalks = ko.observableArray([]);
    self.allTalks = [];

    self.filters = [
        {title: 'Level', filterKey: 'level', filtervalues : ko.observableArray([]), selected : ko.observableArray([])},
        {title: 'Sprache', filterKey: 'language', filtervalues : ko.observableArray([]), selected : ko.observableArray([])},
        {title: 'Track', filterKey: 'track', filtervalues : ko.observableArray([]), selected : ko.observableArray([])},
        {title: 'Raum', filterKey: 'location', filtervalues : ko.observableArray([]), selected : ko.observableArray([])}
    ];

    self.days = ko.observableArray([]);
    self.selectedDayIndex = ko.observable(dukeconSettings.getSelectedDay());
    self.selectedDay = "";

    self.onlyFavourites = ko.observable(false);

    // Initialize
    self.onlyFavourites.subscribe(function(val) {
        self.filterTalks();
    });

    $.each(self.filters, function(index, filter) {
        filter.selected.subscribe(function(s) {
            self.filterTalks();
            dukeconSettings.saveSelectedFilters(self.filters);
        });
    });

    dukeconTalkUtils.getData(function(allData) {
        var favourites = dukeconSettings.getFavourites();
        var mappedTalks = $.map(allData, function(item) { return new Talk(item, favourites.indexOf(item.id) !== -1) }).sort(self.sortTalk);
        self.allTalks = mappedTalks;
        self.initializeDays();
        self.initializeFilters();
        self.filterTalks();
    });

    // Functions
    self.sortTalk = function(t1, t2) {
        if (t1.startDisplayed < t2.startDisplayed) {
            return -1;
        }
        return t1.startDisplayed > t2.startDisplayed ? 1 : 0;
    };

    self.initializeDays = function() {
        self.days(self.getDistinctValues('day', dukeconDateUtils.sortDays));
        console.log(self.days());
        if (self.days().length <= self.selectedDayIndex()) {
            self.selectedDayIndex = 0;
        }
        self.selectedDay = self.days()[self.selectedDayIndex()];
    };

    self.initializeFilters = function() {
        //Get the saved filters first to prevent overwriting them by accident
        var savedFilters = dukeconSettings.getSavedFilters(self.filters);
        _.each(self.filters, function(filter) {
            filter.filtervalues(self.getDistinctValues(filter.filterKey));
            _.each(savedFilters[filter.filterKey], function(selected) {
                if (filter.filtervalues.indexOf(selected) > -1) {
                    filter.selected.push(selected);
                }
            });
        });
    };

    self.getDistinctValues = function(key, sortBy) {
        var t = _.groupBy(self.allTalks, function(talk) {
            return talk[key];
        });
        if (sortBy) {
            return _.keys(t).sort(sortBy);
        } else {
            return _.keys(t).sort();
        }
    };

    self.filterTalks = function() {
        var filtered = self.getFilteredTasks();
        if (self.onlyFavourites() == true) {
            filtered = self.getFavouriteTalks(filtered);
        }
        self.groupedTalks(self.groupTalks(filtered));
    };

    self.getFavouriteTalks = function(filteredTalks) {
        return  _.filter(filteredTalks, function (talk) {
            return talk.favourite();
        });
    };

    self.getFilteredTasks = function() {
        return _.filter(self.allTalks, function (talk) {
            return talk.day === self.selectedDay && _.every(self.filters, function (filter) {
                if (filter.selected().length === 0) {
                    return true;
                }
                return _.some(filter.selected(), function (selected) {
                    return talk[filter.filterKey] === selected;
                })
            });
        });
    };

    self.groupTalks = function(talks) {
        var grouped = _.groupBy(talks, function(talk) {
            return talk.startDisplayed.substring(0,2) + ':00';
        });
        return _.map(_.keys(grouped), function(time) {
            return {"start" : time, "talks" : self.sortTalksForTime(grouped[time])};
        });
    };

    self.sortTalksForTime = function(talks) {
        return talks.sort(function(talk1, talk2) {
            if (talk1.location > talk2.location) {
                return 1;
            }
            return talk1.location < talk2.location ? -1 : 0;
        });
    };

    self.updateDay = function(day, event) {
        self.selectedDay = day;
        self.selectedDayIndex(ko.contextFor(event.target).$index());
        self.filterTalks();
        dukeconSettings.saveSelectedDay(self.selectedDayIndex());
        dukeconSettings.saveSelectedFilters(self.filters);
    };
}

ko.applyBindings(new TalkListViewModel());