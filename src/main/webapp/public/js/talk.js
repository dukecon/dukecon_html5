function TalkViewModel() {
    // Data
    var self = this;
    self.talk = ko.observable(new Talk({}));

    dukeconStorageUtils.getData(function(allData) {
        self.initializeData(allData);
    });

    self.initializeData = function(allData) {
        var talkId = self.getParameterByName("talkId");
        var filtered = _.filter(allData, function(t) {return t.id === talkId});
        self.talk(new Talk(filtered[0]));
    };

    self.getParameterByName = function(name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    };
}

ko.applyBindings(new TalkViewModel());


