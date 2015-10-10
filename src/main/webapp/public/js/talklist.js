function TalkListViewModel() {
    // Data
    var self = this;

    self.toggleFilterMenu = function(active) {
        var veil = $('#filter-veil');
        if (active === true) {
            veil.removeClass("shown");
        } else {
            veil.addClass("shown");
        }
    };

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
    self.filtersActive = ko.observable(dukeconSettings.filtersActive());

    // Initialize
    self.toggleFilterMenu(self.filtersActive());

    self.onlyFavourites.subscribe(function(val) {
        self.filterTalks();
    });

    self.filtersActive.subscribe(function(val) {
        self.toggleFilterMenu(self.filtersActive());
        dukeconSettings.saveSetting(dukeconSettings.filter_active_key, self.filtersActive());
        self.filterTalks();
    });

    $.each(self.filters, function(index, filter) {
        filter.selected.subscribe(function(s) {
            self.filterTalks();
            dukeconSettings.saveSelectedFilters(self.filters);
        });
    });

    self.initialize = function(allData) {
        var favourites = dukeconSettings.getFavourites();
        var mappedTalks = $.map(allData.talks, function(talk) {
            return new Talk(talk, allData.speakers, allData.metaData, favourites.indexOf(talk.id) !== -1)
        }).sort(self.sortTalk);
        self.allTalks = mappedTalks;
        self.initializeDays();
        self.initializeFilters(allData.metaData);
    };

    // Functions
    self.sortTalk = function(t1, t2) {
        if (t1.startDisplayed < t2.startDisplayed) {
            return -1;
        }
        return t1.startDisplayed > t2.startDisplayed ? 1 : 0;
    };

    self.initializeDays = function() {
        self.days(self.getDistinctValues('day', dukeconDateUtils.sortDays));
        if (self.days().length <= self.selectedDayIndex()) {
            self.selectedDayIndex = 0;
        }
        self.selectedDay = self.days()[self.selectedDayIndex()];
    };

     self.initializeFilters = function(metaData) {
        //Get the saved filters first to prevent overwriting them by accident
        var savedFilters = dukeconSettings.getSavedFilters(self.filters);
        self.filters[0].filtervalues(self.getFilterValues(metaData.audiences));
        self.filters[1].filtervalues(self.getFilterValues(metaData.languages));
        self.filters[2].filtervalues(self.getFilterValues(metaData.tracks));
        self.filters[3].filtervalues(self.getFilterValues(metaData.rooms));

        _.each(self.filters, function(filter) {
            _.each(savedFilters[filter.filterKey], function(selected) {
                if (filter.filtervalues.indexOf(selected) > -1) {
                    filter.selected.push(selected);
                }
            });
        });
    };

    //TODO: hardcoded german names
    self.getFilterValues = function(values) {
        return _.map(values, function(value) {
            if (value.names) {
             return value.names.de;
            }
            return value.name;
        });
    };

    self.resetFilters = function() {
        _.each(self.filters, function(filter) {
            filter.selected([]);
        });
        self.filtersActive(true);
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

    self.deactivateFilters = function() {
        self.filtersActive(false);
    };

    self.filterTalks = function() {
        var filtered = self.getFilteredTasks();
        $('#nothingtoshow').addClass('hidden');
        $('#talks-grid').removeClass('hidden');
        if (self.onlyFavourites() == true) {
            filtered = self.getFavouriteTalks(filtered);
        }
        if( filtered.length === 0) {
            $('#nothingtoshow').removeClass('hidden');
            $('#talks-grid').addClass('hidden');
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
            if (!self.filtersActive()) {
                return talk.day === self.selectedDay;
            } else {
                return talk.day === self.selectedDay && _.every(self.filters, function (filter) {
                    if (filter.selected().length === 0) {
                        return true;
                    }
                    return _.some(filter.selected(), function (selected) {
                        return talk[filter.filterKey] === selected;
                    })
                });
            }
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

function initializeTalkList() {
    var model = new TalkListViewModel();
    dukeconTalkUtils.getData(model.initialize);
    ko.applyBindings(model);
}
