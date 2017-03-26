define(['underscore', 'jquery', 'knockout', 'js/modules/dukeconsettings', 'js/modules/offline', 'js/modules/dukecon', 'js/modules/languageutils', 'js/modules/urlprovider'],
    function(_, $, ko, dukeconSettings, dukeconTalkUtils, dukecon, languageUtils, urlHelper) {

        function FilterValue(key, value, isSelected, defaultLanguage) {
            var filterValue = this;
            defaultLanguage = defaultLanguage || "de";
            this.ui_id = key + "_" + value.id;
            this.id = value.id;
            this.selected = ko.observable(isSelected);
            this.en = value.names.en || value.names[defaultLanguage];
            this.de = value.names.de || value.names[defaultLanguage];
            this.displayName = function () {
                return filterValue[languageUtils.selectedLanguage()];
            };
        }

        function TalkListViewModel() {
            // Data
            var self = this;

            self.dukecon = dukecon;
            self.getResource = languageUtils.getResource;

            self.groupedTalks = ko.observableArray([]);
            self.allTalks = [];
            self.metaData = {};

            self.filters = [
                {title: ko.observable(''), filterKey: 'level', filtervalues : ko.observableArray([]), selectedFilterCount: ko.observable(0)},
                {title: ko.observable(''), filterKey: 'language', filtervalues : ko.observableArray([]), selectedFilterCount: ko.observable(0)},
                {title: ko.observable(''), filterKey: 'track', filtervalues : ko.observableArray([]), selectedFilterCount: ko.observable(0)},
                {title: ko.observable(''), filterKey: 'location', filtervalues : ko.observableArray([]), selectedFilterCount: ko.observable(0)}
            ];
            
            self.totalFilterCount = ko.computed(function() {
                return self.filters[0].selectedFilterCount() +
					self.filters[1].selectedFilterCount() +
					self.filters[2].selectedFilterCount() +
					self.filters[3].selectedFilterCount();
			});

            self.updateFilterCount = function(filter) {
                var countSelected = _.filter(filter.filtervalues(), function(item) {
                    return item.selected();
                });
                filter.selectedFilterCount(countSelected.length);
            };

            self.updateAllFilterCounts = function() {
                self.updateFilterCount(self.filters[0]);
                self.updateFilterCount(self.filters[1]);
                self.updateFilterCount(self.filters[2]);
                self.updateFilterCount(self.filters[3]);
            };

            self.searchTerm = ko.observable("");
            self.searchTerm.subscribe(function(newValue) {
                var searchTerm = newValue.toLowerCase();
                if (searchTerm.length <= 2) {
                    self.filtersActive(true);
                    self.filterTalks();
                }
                else if(searchTerm.length > 2) {
                    self.filtersActive(false);
                    var filtered = _.filter(self.allTalks, function (talk) {
                        return talk.title.toLowerCase().includes(searchTerm) ||
                            talk.speakerString.toLowerCase().includes(searchTerm) ||
                            talk.fullAbstract.toLowerCase().includes(searchTerm);
                    });
                    self.groupedTalks(self.groupTalks(filtered));
                }
            });
            self.searchTerm.subscribe(function(val) {
                setTimeout(function() {
                    if (val.length > 2) {
                        urlHelper.setUrlParam("search", val);
                    } else {
                        urlHelper.setUrlParam("search", null);
                    }
                }, 500);
            });

            self.days = ko.observableArray([]);
            self.selectedDayIndex = ko.observable(dukeconSettings.getSelectedDay());
            self.selectedDay = "";

            self.onlyFavourites = ko.observable(dukeconSettings.favoritesActive());
            self.filtersActive = ko.observable(dukeconSettings.filtersActive());
            
            self.expandCollapseFilter = function(unused, event) {
                var collapsedCss = "collapsed";
                var targetElem = event.currentTarget.parentNode; // the one with class "collapsed"
                if (targetElem.className === collapsedCss) {
					targetElem.className = "";
                }
                else {
					targetElem.className = collapsedCss;
                }
            };

            //temporarily pause filter update actions
            self.updateFiltersPaused = false;

            self.onlyFavourites.subscribe(function() {
                dukeconSettings.saveSetting(dukeconSettings.keys.favs_active, self.onlyFavourites());
                self.filterTalks();
            });

            self.filtersActive.subscribe(function() {
                self.toggleFilterMenu(self.filtersActive());
                dukeconSettings.saveSetting(dukeconSettings.keys.filter_active_key, self.filtersActive());
                self.filterTalks();
            });

            languageUtils.selectedLanguage.subscribe(function() {
                self.initializeFilters(self.metaData);
            });

            self.commonInitializations = function(allData) {
                var favourites = dukeconSettings.getFavourites();
                var mappedTalks = $.map(allData.events, function(talk) {
                    return new dukecon.Talk(talk, allData.speakers, allData.metaData, favourites.indexOf(talk.id) !== -1)
                }).sort(self.sortTalk);
                self.metaData = allData.metaData;
                self.allTalks = mappedTalks;
                self.initializeDays();
                self.initializeFilters(allData.metaData);
                self.filterTalks();
                self.toggleFilterMenu(self.filtersActive());
            };
            
            self.initialize = function(allData) {
                self.commonInitializations(allData);
				dukecon.addCustomCss();
                hideLoading(globalLoadTimeout, "dukeConMain");
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

                if (metaData.locations) {
                    // tests break without this check; for some reason the metadata seems to get lost at some point. :-?
                    metaData.locations.sort(function (a, b) {
                        return parseInt(a.order) - parseInt(b.order);
                    });
                }

                self.filters[0].title(languageUtils.strings.level[languageUtils.selectedLanguage()]);
                self.filters[0].filtervalues(self.getFilterValues('audiences', metaData, savedFilters[self.filters[0].filterKey]));
                self.filters[1].title(languageUtils.strings.language[languageUtils.selectedLanguage()]);
                self.filters[1].filtervalues(self.getFilterValues('languages', metaData, savedFilters[self.filters[1].filterKey]));
                self.filters[2].title(languageUtils.strings.track[languageUtils.selectedLanguage()]);
                self.filters[2].filtervalues(self.getFilterValues('tracks', metaData, savedFilters[self.filters[2].filterKey]));
                self.filters[3].title(languageUtils.strings.location[languageUtils.selectedLanguage()]);
                self.filters[3].filtervalues(self.getFilterValues('locations', metaData, savedFilters[self.filters[3].filterKey]));
                self.updateAllFilterCounts();
            };

            self.getFilterValues = function(key, metaData, selectedValues) {
				var defaultLanguage = metaData.defaultLanguage ? metaData.defaultLanguage.code : "de";
                var values = metaData[key];
                return _.map(values, function(value) {
                    var filterValue = new FilterValue(key, value, selectedValues.indexOf(value.id) > -1, defaultLanguage);
                    filterValue.selected.subscribe(function () {
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
                self.searchTerm("");
                self.filtersActive(true);
                self.updateAllFilterCounts();
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
                    return talk.startDisplayed;
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
            dukeconTalkUtils.reloadInPrivateMode.subscribe(function(value) {
                if (value) {
                    dukeconTalkUtils.getData(dukeconTalklistModel.initialize);
                }
            });
            dukeconTalkUtils.getData(dukeconTalklistModel.initialize);
            ko.applyBindings(dukeconTalklistModel);
            
            if (urlHelper.getUrlParam("search")) {
                var handle = setInterval(function() {
                    dukeconTalklistModel.searchTerm(urlHelper.getUrlParam("search") || "");
                    window.clearInterval(handle);
                }, 1000);
            }
        }

        return {
            initializeTalkList : initializeTalkList,
            TalkListViewModel : TalkListViewModel,
            FilterValue : FilterValue
        };
    });
