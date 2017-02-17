define(['underscore', 'knockout', 'js/modules/dukeconsettings', 'js/modules/offline', 'js/modules/dukecon', 'js/modules/dukecloak', 'js/modules/synch'],
    function(_, ko, dukeconSettings, dukeconTalkUtils, dukecon, dukecloak, synch) {

        function SpeakerViewModel() {
            // Data
            var self = this;
            self.speaker = ko.observable(new dukecon.Speaker({}, [], {}, {}, []));

            self.initializeData = function (allData) {
                var speakerId = self.getParameterByName("speakerId");
                if (speakerId) {
                    var filteredSpeakers = _.filter(allData.speakers, function (s) {
                        return s.id === speakerId;
                    });
                    if (filteredSpeakers.length > 0) {
                        self.speaker(new dukecon.Speaker(filteredSpeakers[0], allData.events, allData.speakers, allData.metaData, dukeconSettings.getFavourites()));
                        document.title = self.speaker().name + " - " + document.title;
                    }
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
        }

        var speakerModel;

        function initializeSpeakers() {
            speakerModel = new SpeakerViewModel();
            dukeconTalkUtils.reloadInPrivateMode.subscribe(function(value) {
                if (value) {
                    dukeconTalkUtils.getData(speakerModel.initializeData);
                }
            });
            dukeconTalkUtils.getData(speakerModel.initializeData);
            ko.applyBindings(speakerModel);
        }

        return {
            speakerModel : speakerModel,
            initializeSpeakers : initializeSpeakers
        };
    });

