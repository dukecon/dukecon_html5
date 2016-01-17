function SpeakerViewModel() {
    var self = this;
    self.allSpeakers = ko.observableArray([]);

    dukeconTalkUtils.getData(jsonUrl, function(allData) {
        self.initializeData(allData);
        hideLoading(200);
    });

    self.initializeData = function(allData) {
        var favourites = dukeconSettings.getFavourites();
        self.allSpeakers(_.map(allData.speakers, function(s) {
            return new Speaker(s, allData.events, allData.speakers, allData.metaData, favourites);
        }).sort(sortSpeaker));
    };
};

var sortSpeaker = function(s1, s2) {
    if (s1.name < s2.name) {
        return -1;
    }
    return s1.name > s2.name ? 1 : 0;
}

ko.applyBindings(new SpeakerViewModel());