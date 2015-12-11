function TalkViewModel() {
    // Data
    var self = this;
    self.talk = ko.observable(new Talk({}, [], {}, false));

    dukeconTalkUtils.getData(jsonUrl, function(allData) {
        self.initializeData(allData);
    });

    self.initializeData = function(allData) {
        var talkId = self.getParameterByName("talkId");
        var filtered = _.filter(allData.events, function(t) {return t.id === talkId});
        self.talk(new Talk(filtered[0], allData.speakers, allData.metaData, false));
        document.title = self.talk().title + " - " + document.title;
    };

    self.getParameterByName = function(name) {
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
        var results = regex.exec(location.hash);
        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    };
}

languageUtils.init();
ko.applyBindings(new TalkViewModel());
