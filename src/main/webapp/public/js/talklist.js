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
    self.metaData = {};

    self.filters = [
        {title: ko.observable(''), filterKey: 'level', filtervalues : ko.observableArray([]), selected : ko.observableArray([])},
        {title: ko.observable(''), filterKey: 'language', filtervalues : ko.observableArray([]), selected : ko.observableArray([])},
        {title: ko.observable(''), filterKey: 'track', filtervalues : ko.observableArray([]), selected : ko.observableArray([])},
        {title: ko.observable(''), filterKey: 'location', filtervalues : ko.observableArray([]), selected : ko.observableArray([])}
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

    languageUtils.selectedLanguage.subscribe(function(language) {
        self.initializeFilters(self.metaData);
    });

    $.each(self.filters, function(index, filter) {
        filter.selected.subscribe(function(s) {
            self.filterTalks();
            dukeconSettings.saveSelectedFilters(self.filters);
        });
    });

    self.initialize = function(allData) {
        var favourites = dukeconSettings.getFavourites();
        var mappedTalks = $.map(allData.events, function(talk) {
            return new Talk(talk, allData.speakers, allData.metaData, favourites.indexOf(talk.id) !== -1)
        }).sort(self.sortTalk);
        self.metaData = allData.metaData;
        self.allTalks = mappedTalks;
        self.initializeDays();
        self.initializeFilters(allData.metaData);
        self.filterTalks();
    };

    // Functions
    self.sortTalk = function(t1, t2) {
        if (t1.startDisplayed < t2.startDisplayed) {
            return -1;
        }
        return t1.startDisplayed > t2.startDisplayed ? 1 : 0;
    };

    self.initializeDays = function() {
        self.days(self.getDistinctDateValues(dukeconDateUtils.sortDays));
        if (self.days().length <= self.selectedDayIndex()) {
            self.selectedDayIndex = 0;
        }
        self.selectedDay = self.days()[self.selectedDayIndex()];
    };

     self.initializeFilters = function(metaData) {
        //Get the saved filters first to prevent overwriting them by accident
        var savedFilters = dukeconSettings.getSavedFilters(self.filters);
        self.filters[0].title(languageUtils.strings.level[languageUtils.selectedLanguage()]);
        self.filters[0].filtervalues(self.getFilterValues('audience_', metaData.audiences));
        self.filters[1].title(languageUtils.strings.language[languageUtils.selectedLanguage()]);
        self.filters[1].filtervalues(self.getFilterValues('language_', metaData.languages));
        self.filters[2].title(languageUtils.strings.track[languageUtils.selectedLanguage()]);
        self.filters[2].filtervalues(self.getFilterValues('track_', metaData.tracks));
        self.filters[3].title(languageUtils.strings.location[languageUtils.selectedLanguage()]);
        self.filters[3].filtervalues(self.  getFilterValues('location_', metaData.locations));

        _.each(self.filters, function(filter) {
            _.each(savedFilters[filter.filterKey], function(selected) {
                if (_.find(filter.filtervalues(), function(val) { return val.id === selected.id; })) {
                    filter.selected().push(selected);
                    $('#' + selected.id).prop('checked', true); // doesn't seem to be checked automatically on first load!
                }
            });
        });
    };

    self.getFilterValues = function(prefix, values) {
        return _.map(values, function(value) {
             var ret = {};
             ret.id = prefix + value.id;
             ret.en = value.names ? value.names.en : value.name;
             ret.de = value.names ? value.names.de : value.name;
             ret.displayName = function() {
                return ret[languageUtils.selectedLanguage()];
             }
             return ret;
        });
    };

    self.resetFilters = function() {
        _.each(self.filters, function(filter) {
            filter.selected([]);
        });
        self.filtersActive(true);
    };

    self.getDistinctDateValues = function(sortBy) {
        var t = _.groupBy(self.allTalks, function(talk) {
            return talk.day();
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
        var filtered = self.getFilteredTalks();
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

    self.getFilteredTalks = function() {
        return _.filter(self.allTalks, function (talk) {
            if (!self.filtersActive()) {
                return talk.day() === self.selectedDay;
            } else {
                return talk.day() === self.selectedDay && _.every(self.filters, function (filter) {
                    if (filter.selected().length === 0) {
                        return true;
                    }
                    return _.some(filter.selected(), function (selected) {
                        return talk[filter.filterKey] === selected.en;
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
