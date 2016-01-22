function TalkViewModel() {
    // Data
    var self = this;
    self.talk = ko.observable(new Talk({}, [], {}, false));

    self.initializeData = function(allData) {
        var talkId = self.getParameterByName("talkId");
        if(talkId) {
            var filtered = _.filter(allData.events, function (t) {
                return t.id === talkId
            });
            var talk = filtered[0];
            self.talk(new Talk(talk, allData.speakers, allData.metaData, dukeconSettings.isFavourite(talk.id)));
            document.title = self.talk().title + " - " + document.title;
        }
        (function(history){
            // keycloak will issue a redirect, only after that has finished we will know about the
            var replaceState = history.replaceState;
            history.replaceState = function(data,title,url) {
                var r = replaceState.apply(history, [ data,title,url ]);
                dukeconTalkUtils.getData(jsonUrl, function(allData) {
                    self.initializeData(allData);
                });
                return r;
            }
        })(window.history);
    };

    self.getParameterByName = function(name) {
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
        var results = regex.exec(location.hash);
        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    };

    self.toggleFavourite = function(viewModel) {
        var favourites = dukeconSettings.toggleFavourite(viewModel.talk().id);
        viewModel.talk().toggleFavourite();
        dukeconSynch.push();
    };
}

var talkModel;

function initializeTalks() {
    talkModel = new TalkViewModel();
    dukeconTalkUtils.getData(jsonUrl, talkModel.initializeData);
    ko.applyBindings(talkModel);
}

initializeTalks();