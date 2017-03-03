define(['underscore', 'knockout', 'js/modules/dukeconsettings', 'js/modules/offline', 'js/modules/dukecon', 'js/modules/dukecloak', 'js/modules/synch'],
    function(_, ko, dukeconSettings, dukeconTalkUtils, dukecon, dukecloak, synch) {

        function TalkViewModel() {
            // Data
            var self = this;
            self.talk = ko.observable(new dukecon.Talk({}, [], {}, false));
            self.speakersWithCompanies = ko.observable([]);

            self.initializeData = function (allData) {
                var talkId = self.getParameterByName("talkId");
                if (talkId) {
                    var filtered = _.filter(allData.events, function (t) {
                        return t.id === talkId
                    });
                    var talk = filtered[0];
                    self.talk(new dukecon.Talk(talk, allData.speakers, allData.metaData, dukeconSettings.isFavourite(talk.id)));
                    self.speakersWithCompanies(dukecon.getSpeakerInfo(self.talk().speakerIds, allData.events, allData.speakers, allData.metaData, dukeconSettings.getFavourites()));
                    document.title = self.talk().title + " - " + document.title;
                }
                (function (history) {
                    // keycloak will issue a redirect, only after that has finished we will know about the
                    var replaceState = history.replaceState;
                    history.replaceState = function (data, title, url) {
                        var r = replaceState.apply(history, [data, title, url]);
                        dukeconTalkUtils.getData(function (allData) {
                            self.initializeData(allData);
                        });
                        return r;
                    }
                })(window.history);
            };

            self.getParameterByName = function (name) {
                var regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
                var results = regex.exec(location.hash);
                return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
            };

            self.toggleFavourite = function (viewModel) {
                var favourites = dukeconSettings.toggleFavourite(viewModel.talk().id);
                viewModel.talk().toggleFavourite();
                synch.push(dukecloak.dukecloak);
            };
        }

        var talkModel;

        function initializeTalks() {
            talkModel = new TalkViewModel();
            dukeconTalkUtils.reloadInPrivateMode.subscribe(function(value) {
                if (value) {
                    dukeconTalkUtils.getData(talkModel.initializeData);
                }
            });
            dukeconTalkUtils.getData(talkModel.initializeData);
            ko.applyBindings(talkModel);
        }

        return {
            talkModel : talkModel,
            initializeTalks : initializeTalks
        };
    });

