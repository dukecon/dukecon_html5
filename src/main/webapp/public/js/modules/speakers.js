define(['underscore', 'knockout', 'js/modules/dukeconsettings', 'js/modules/offline', 'js/modules/dukecon'],
    function(_, ko, dukeconSettings, dukeconTalkUtils, dukecon) {
        function SpeakerViewModel() {
            var self = this;
            self.allSpeakers = ko.observableArray([]);

            self.initializeData = function(allData) {
                var favourites = dukeconSettings.getFavourites();
                self.allSpeakers(_.map(allData.speakers, function(s) {
                    return new dukecon.Speaker(s, allData.events, allData.speakers, allData.metaData, favourites);
                }).sort(sortSpeaker));
                hideLoading(200, 'dukeConSpeakers');
            };
        }

        var sortSpeaker = function(s1, s2) {
            if (s1.name < s2.name) {
                return -1;
            }
            return s1.name > s2.name ? 1 : 0;
        };

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
        initializeSpeakers : initializeSpeakers
    }
});