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
                hideLoading(globalLoadTimeout, 'dukeConSpeakers');
            };
        }
        
        var sortSpeaker = function(s1, s2) {
            function sortString(a, b) {
				if (a.toLowerCase() < b.toLowerCase()) {
					return -1;
				}
				return a.toLowerCase() > b.toLowerCase() ? 1 : 0;
            }
            
			function sortByFirstAndLastName(a, b) {
				var name1 = a.lastname + (a.firstname ? a.firstname : "");
				var name2 = b.lastname + (b.firstname ? b.firstname : "");
	            return sortString(name1, name2);
			}

			if (s1.lastname && s2.lastname) {
                return sortByFirstAndLastName(s1, s2);
            }
            return sortString(s1.name, s2.name);
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