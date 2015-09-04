function TalkListViewModel() {
    // Data
    var self = this;
    self.groupedTalks = ko.observableArray([]);
    self.allTalks = [];

    self.talkIcons = [
        {"Architecture & Security" : "track_architecture.jpg"},
        {"Core Java/JVM-basierte Sprachen" : "track_jvm-languages.jpg"},
        {"Enterprise Java und Cloud" : "track_enterprise-java-cloud.jpg"},
        {"Frontend & Mobile" : "track_frontend-mobile.jpg"},
        {"IDEs & Tools" : "track_ide-toolsjpg"},
        {"Container und Microservices" : "track_microservices.jpg"},
        {"Internet der Dinge" : "track_internet-of-things.jpg"},
        {"Newcomer" : "track_newcomer.jpg"}
    ];

    self.filters = [
        {title: 'Level', filterKey: 'level', filtervalues : ko.observableArray([]), selected : ko.observableArray([])},
        {title: 'Language', filterKey: 'language', filtervalues : ko.observableArray([]), selected : ko.observableArray([])},
        {title: 'Track', filterKey: 'track', filtervalues : ko.observableArray([]), selected : ko.observableArray([])},
        {title: 'Room', filterKey: 'location', filtervalues : ko.observableArray([]), selected : ko.observableArray([])}
    ];

    self.days = ko.observableArray([]);
    self.selectedDayIndex = ko.observable(0);
    self.selectedDay = "";

    self.onlyFavourites = ko.observable(false);
    self.onlyFavourites.subscribe(function(val) {
        self.toggleFavourites();
    });

    // Initialize
    $.each(self.filters, function(index, filter) {
        filter.selected.subscribe(function(s) {
            self.filterTalks();
        });
    });

    dukeconTalkUtils.getData(function(allData) {
        var favourites = dukeconSettings.getFavourites();
        var mappedTalks = $.map(allData, function(item) { return new Talk(item, favourites.indexOf(item.id) !== -1) }).sort(self.sortTalk);
        self.allTalks = mappedTalks;
        self.days(self.getDistinctValues('day'));
        self.addFilters();
        self.selectedDay = self.days()[0];
        self.groupedTalks(self.groupTalks(self.allTalks));
        self.filterTalks();
    });

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
        if (self.onlyFavourites() == true) {
            filtered = _.filter(filtered, function(talk) {
                return talk.favourite();
            });
        }
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
    };

    self.toggleFavourites = function() {
        if (self.onlyFavourites()) {
            self.groupedTalks(
                _.chain(self.groupedTalks())
                .map(function(grouped){
                        return {
                            "start" : grouped.start,
                            "talks" : _.filter(grouped.talks, function(talk) {
                                return talk.favourite();
                            })};
                })
                .filter(function(grouped) {
                    return grouped.talks.length > 0;
                })
                .value());
        }
        else {
            self.filterTalks();
        }
    };
}

ko.applyBindings(new TalkListViewModel());