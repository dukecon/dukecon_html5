function SpeakerViewModel() {
    var self = this;
    self.allSpeakers = ko.observableArray([]);

    dukeconTalkUtils.getData(function(allData) {
        self.initializeData(allData);
    });

    self.initializeData = function(allData) {
        self.allSpeakers(_.map(allData.speakers, function(s) {
            return new Speaker(s, allData.events, allData.speakers, allData.metaData);
        }).sort(sortSpeaker));
    };
};

var sortSpeaker = function(s1, s2) {
    if (s1.name < s2.name) {
        return -1;
    }
    return s1.name > s2.name ? 1 : 0;
}

languageUtils.init();
ko.applyBindings(new SpeakerViewModel());