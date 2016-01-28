function FilterValue(key, value, isSelected) {
    var filterValue = this;
    this.ui_id = key + "_" + value.id;
    this.id = value.id;
    this.selected = ko.observable(isSelected);
    this.en = value.names.en;
    this.de = value.names.de;
    this.displayName = function () {
        return filterValue[languageUtils.selectedLanguage()];
    };
};

function TalkListViewModel() {
    // Data
    var self = this;

    self.groupedTalks = ko.observableArray([]);
    self.allTalks = [];
    self.metaData = {};

    self.filters = [
        {title: ko.observable(''), filterKey: 'level', filtervalues : ko.observableArray([])},
        {title: ko.observable(''), filterKey: 'language', filtervalues : ko.observableArray([])},
        {title: ko.observable(''), filterKey: 'track', filtervalues : ko.observableArray([])},
        {title: ko.observable(''), filterKey: 'location', filtervalues : ko.observableArray([])}
    ];

    self.days = ko.observableArray([]);
    self.selectedDayIndex = ko.observable(dukeconSettings.getSelectedDay());
    self.selectedDay = "";

    self.onlyFavourites = ko.observable(dukeconSettings.favoritesActive());
    self.filtersActive = ko.observable(dukeconSettings.filtersActive());

    //temporarily pause filter update actions
    self.updateFiltersPaused = false;

    self.onlyFavourites.subscribe(function(val) {
        dukeconSettings.saveSetting(dukeconSettings.favs_active, self.onlyFavourites());
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
        self.toggleFilterMenu(self.filtersActive());
        hideLoading(200);
    };

    self.updateFavourites = function() {
        var favourites = dukeconSettings.getFavourites();
        _.each(self.allTalks, function(talk) {
            talk.favourite(favourites.indexOf(talk.id) !== -1);
        });
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
        self.days(self.getDistinctDateValues());
        if (self.days().length <= self.selectedDayIndex()) {
            self.selectedDayIndex = 0;
        }
    };

     self.initializeFilters = function(metaData) {
        var savedFilters = dukeconSettings.getSavedFilters(self.filters);
        self.filters[0].title(languageUtils.strings.level[languageUtils.selectedLanguage()]);
        self.filters[0].filtervalues(self.getFilterValues('audiences', metaData, savedFilters[self.filters[0].filterKey]));
        self.filters[1].title(languageUtils.strings.language[languageUtils.selectedLanguage()]);
        self.filters[1].filtervalues(self.getFilterValues('languages', metaData, savedFilters[self.filters[1].filterKey]));
        self.filters[2].title(languageUtils.strings.track[languageUtils.selectedLanguage()]);
        self.filters[2].filtervalues(self.getFilterValues('tracks', metaData, savedFilters[self.filters[2].filterKey]));
        self.filters[3].title(languageUtils.strings.location[languageUtils.selectedLanguage()]);
        self.filters[3].filtervalues(self.getFilterValues('locations', metaData, savedFilters[self.filters[3].filterKey]));
    };

    self.getFilterValues = function(key, metaData, selectedValues) {
        var values = metaData[key];
        return _.map(values, function(value) {
            var filterValue = new FilterValue(key, value, selectedValues.indexOf(value.id) > -1);
            filterValue.selected.subscribe(function (s) {
                if (!self.updateFiltersPaused) {
                    self.filterTalks();
                }
            });
            return filterValue;
        });
    };

    self.resetFilters = function() {
        self.updateFiltersPaused = true;
        _.each(self.filters, function(filter) {
            _.each(filter.filtervalues(), function(filtervalue) {
                filtervalue.selected(false);
            });
        });
        self.updateFiltersPaused = false;
        self.filterTalks();
        self.filtersActive(true);
    };

    self.getDistinctDateValues = function() {
        var daysAndTalks = _.groupBy(self.allTalks, function(talk) {
            return talk.startDate.getDay();
        });
        var dates = [];
        _.each(_.keys(daysAndTalks).sort(), function(day) {
            var talk = daysAndTalks[day][0];
            dates.push({ "day" : day, "displayDay" : talk.day, "displayDayShort" : talk.dayshort});
        });
        return dates;
    };

    self.deactivateFilters = function() {
        self.filtersActive(false);
    };

    self.filterTalks = function() {
        dukeconSettings.saveSelectedFilters(self.filters);
        var filtered = self.getFilteredTalks();
        $('#nothingtoshow').addClass('hidden');
        $('#talks-grid').removeClass('hidden');
        if (self.onlyFavourites() == true) {
            filtered = self.getFavouriteTalks(filtered);
        }
        if (filtered.length === 0) {
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
        var savedFilters = dukeconSettings.getSavedFilters(self.filters);
        var filtersEmpty = _.every(self.filters, function (filter) {
          return savedFilters[filter.filterKey].length === 0;
        });
        var selectedWeekdayIndex = self.days()[self.selectedDayIndex()].day;
        return _.filter(self.allTalks, function (talk) {
            var isSelectedDay = talk.startDate.getDay() + '' === selectedWeekdayIndex;
            if (!self.filtersActive() || filtersEmpty) {
                return isSelectedDay;
            }
            else {
                return isSelectedDay && _.every(self.filters, function (filter) {
                    var selected = savedFilters[filter.filterKey];
                    if (selected.length === 0) {
                        return true;
                    }
                    return _.some(selected, function (selected) {
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
            if (talk1.locationOrder > talk2.locationOrder) {
                return 1;
            }
            return talk1.locationOrder < talk2.locationOrder ? -1 : 0;
        });
    };

    self.updateDay = function(day, event) {
        self.selectedDayIndex(ko.contextFor(event.target).$index());
        self.filterTalks();
        dukeconSettings.saveSelectedDay(self.selectedDayIndex());
        dukeconSettings.saveSelectedFilters(self.filters);
    };

    self.toggleFilterMenu = function(active) {
        var veil = $('#filter-veil');
        if (active === true) {
            veil.removeClass("shown");
        } else {
            veil.addClass("shown");
        }
    };
}

var dukeconTalklistModel;

function initializeTalkList() {
    dukeconTalklistModel = new TalkListViewModel();
    dukeconTalkUtils.getData(jsonUrl, dukeconTalklistModel.initialize);
    ko.applyBindings(dukeconTalklistModel);
}
