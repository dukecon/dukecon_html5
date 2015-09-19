function SpeakerViewModel() {
    var self = this;
    self.allSpeakers = ko.observableArray([]);

    dukeconTalkUtils.getData(function(allData) {
        self.initializeData(allData);
    });

    self.initializeData = function(allData) {
        self.allSpeakers(collectAndOrderSpeakers(allData));
    };

};

//TODO: can this all be done a bit easier?
var collectAndOrderSpeakers = function(allTalks) {
    var allSpeakers = collectAllSpeakers(allTalks);
    var groupedSpeakers = groupSpeakers(allSpeakers);
    return groupedSpeakers.sort(sortSpeaker);
}

var collectAllSpeakers = function(allTalks) {
    var allSpeakers = [];
    _.each(allTalks, function(talk) {
        _.each(talk.speakers, function(speaker) {
            if (speaker && speaker.name) {
                allSpeakers.push({ "speaker" : speaker,  "talk" : new Talk(talk, false)});
            }
        })
    });
    return allSpeakers;
};

var groupSpeakers = function(allSpeakers) {
    var grouped = _.groupBy(allSpeakers, function(s) { return s.speaker.name; });
    return _.map(_.keys(grouped), function(speakerName) {
        var talks = $.map(grouped[speakerName], function(s) { return s.talk});
        var speaker = grouped[speakerName][0].speaker;
        return new Speaker(speaker.name, speaker.company, talks);
    });
};

var sortSpeaker = function(s1, s2) {
    if (s1.name < s2.name) {
        return -1;
    }
    return s1.name > s2.name ? 1 : 0;
}

ko.applyBindings(new SpeakerViewModel());