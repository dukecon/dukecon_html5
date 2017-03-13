define(['underscore', 'jquery', 'knockout', 'js/modules/dukecondb', 'js/modules/urlprovider', 'js/modules/dukeconsettings', 'js/modules/dukecondateutils', 'js/modules/languageutils', 'js/modules/offline', 'js/modules/dukecloak', 'js/modules/synch'],
    function (_, $, ko, dukeconDb, urlprovider, dukeconSettings, dukeconDateUtils, languageUtils, offline, dukecloak, synch) {

        function extractTwitterInfo(twitterString) {
            var result = {
                link : '',
                handle : ''
            };
			if (twitterString && twitterString.length > 1) {
				if (twitterString.indexOf("http") === 0) {
					var urlRegex = new RegExp(".*/(.+)");
					result.link = twitterString;
					result.handle = '@' + twitterString.replace(urlRegex, "\$1");
				} else {
					result.handle = twitterString;
					result.link = "http://www.twitter.com/" + (twitterString.indexOf('@') === 0 ? twitterString.substr(1) : twitterString);
				}
			}
			return result;
        }

        function getLanguageIcon(talk, metaData) {
            var prefix = talk.simultan ? "img/" : "img/lang_";
            return prefix + dukeconUtils.getLanguageCode(metaData, talk.languageId) + ".png";
        }
    
        function Talk(data, speakers, metaData, isFavourite) {
            var self = this;

            this.id = data.id || '';
            this.startDate = data.start ? new Date(data.start) : null;
            this.day = ko.observable(dukeconDateUtils.getDisplayDate(data.start));
            this.dayshort = ko.observable(dukeconDateUtils.getDisplayDateShort(data.start));
            this.startDisplayed = dukeconDateUtils.getDisplayTime(data.start);
            this.duration = dukeconDateUtils.getDurationInMinutes(data.start, data.end);
            this.startSortable = data.start || '';
            this.trackDisplay = ko.observable(dukeconUtils.getTrack(metaData, data.trackId));
            this.track = data.trackId || '';
            this.talkIcon = dukeconUtils.getTalkIcon(data.trackId || '');
            this.isTrackVisible = ko.computed(function () {
                return self.trackDisplay() !== '';
            });
            this.locationDisplay = ko.observable(dukeconUtils.getLocation(metaData, data.locationId));
            this.location = data.locationId || '';
            this.locationOrder = dukeconUtils.getOrderById(metaData.locations, data.locationId);
            this.levelDisplay = ko.observable(dukeconUtils.getLevel(metaData, data.audienceId));
            this.level = data.audienceId || '';
            this.title = dukeconUtils.getSafeHtml(data.title || '');
            this.speakerString = dukeconUtils.getSpeakerNames(data.speakerIds, speakers).join(', ');
            this.speakerIds = data.speakerIds;
            this.languageDisplay = ko.observable(dukeconUtils.getLanguage(metaData, data.languageId));
            this.language = data.languageId || '';
            this.languageIcon = getLanguageIcon(data, metaData);
            this.simultan = data.simultan;
            this.fullAbstract = dukeconUtils.getSafeHtml(data.abstractText || '');
            this.timeCategory = dukeconDateUtils.getTimeCategory(this.duration);
            this.timeClass = this.timeCategory == 'regular' ? 'time' : 'time-extra alternate';
            this.favourite = ko.observable(isFavourite);
            this.favicon = ko.computed(function () {
                return this.favourite() ? "img/StarFilled.png" : "img/StarLine.png";
            }, this);
            this.showAlertWindow = function () {
                // requires scrollfix.js for cookie handling:
                var alreadySeen = readCookie('dukecon.favouriteAlertSeen');
                if (!dukecloak.dukecloak.auth.loggedIn() && !alreadySeen) {
                    var alertWin = document.getElementById('alert-window');
                    if (alertWin) {
                        var position = getScrollXY();
                        alertWin.className = 'shown';
                        alertWin.style.top = (position[1] + 150) + 'px';
                        alertWin.style.left = (position[0] + 40) + 'px';
                    }
                }
            };
            this.toggleFavourite = function () {
                this.showAlertWindow();
                this.favourite(!this.favourite());
            };

            languageUtils.selectedLanguage.subscribe(function () {
                self.day(dukeconDateUtils.getDisplayDate(data.start));
                self.dayshort(dukeconDateUtils.getDisplayDateShort(data.start));
                self.trackDisplay(dukeconUtils.getTrack(metaData, data.trackId));
                self.levelDisplay(dukeconUtils.getLevel(metaData, data.audienceId));
                self.languageDisplay(dukeconUtils.getLanguage(metaData, data.languageId));
                self.locationDisplay(dukeconUtils.getLocation(metaData, data.locationId));
            });

        }

        function Speaker(data, talks, speakers, metaData, favorites) {
            this.id = data.id || 0;
            this.name = data.name || '';
            this.firstname = data.firstname || '';
            this.lastname = data.lastname || '';
            this.company = data.company || '';
            
            var twitterInfo = extractTwitterInfo(data.twitter);
            this.twitterHandle = twitterInfo.handle;
            this.twitterLink = twitterInfo.link;
            
            this.email = data.email || '';
            this.image = data.photoId ? urlprovider.imageBaseUrl + data.photoId : "img/UnknownUser.png";
            this.blog = data.blog || '';
            this.web = data.website || '';

            this.facebook = data.facebook || '';
            this.googleplus = data.gplus || '';
            this.xing = data.xing || '';
            this.linkedin = data.linkedin || '';

            this.bio = data.bio ? data.bio : "";
            this.bioShort = this.bio.length > 220 ? this.bio.substring (0, 210) + "..." : this.bio;

            this.talks = dukeconUtils.getTalks(data.eventIds, talks, speakers, metaData, favorites);
        }

        var cookiesConfirmed = ko.observable();

//not sure where else to put
        var dukeconUtils = {
            talkIcons: {
                "7": "img/track_architecture.jpg",
                "2": "img/track_jvm-languages.jpg",
                "3": "img/track_enterprise-java-cloud.jpg",
                "4": "img/track_frontend-mobile.jpg",
                "5": "img/track_ide-tools.jpg",
                "1": "img/track_microservices.jpg",
                "6": "img/track_internet-of-things.jpg",
                "8": "img/track_newcomer.jpg",
                "9": "img/track_community.jpg"
            },

            getTrack: function (metaData, trackId) {
                return dukeconUtils.getById(metaData.tracks, trackId, metaData);
            },

            getLanguage: function (metaData, languageId) {
                return dukeconUtils.getById(metaData.languages, languageId, metaData);
            },

            getLanguageCode: function (metaData, languageId) {
				var value = _.find(metaData.languages, function (d) {
					return d.id === languageId;
				});
				return value ? value.code : "de";
            },

            getLevel: function (metaData, levelId) {
                return dukeconUtils.getById(metaData.audiences, levelId, metaData);
            },

            getLocation: function (metaData, locationId) {
                return dukeconUtils.getById(metaData.locations, locationId, metaData);
            },

            getById: function (data, id, metaData) {
                var defaultLanguage = metaData.defaultLanguage ? metaData.defaultLanguage.code : "de";
                var value = _.find(data, function (d) {
                    return d.id === id;
                });
                return value ? (value.names[languageUtils.selectedLanguage()] ? value.names[languageUtils.selectedLanguage()] : value.names[defaultLanguage]) : '';
            },

            getOrderById: function (data, id) {
                var value = _.find(data, function (d) {
                    return d.id === id;
                });
                return value ? value.order : 0;
            },

            getSpeakerInfo: function (speakerIds, talks, speakers, metaData, favorites) {
                if (!speakerIds || speakerIds.length === 0) {
                    return [];
                }
                return _.map(speakerIds, function (speakerId) {
                    var speaker = _.find(speakers, function (s) {
                                return s.id === speakerId;
                            }
                        ) || {};

                    return new Speaker(speaker, talks, speakers, metaData, favorites) ;
                });
            },

            getSpeakerNames: function (speakerIds, speakers) {
                if (!speakerIds || speakerIds.length === 0) {
                    return [];
                }
                return _.map(speakerIds, function (speakerId) {
                    var speaker = _.find(speakers, function (s) {
                                return s.id === speakerId;
                            }
                        ) || {};
                    return speaker.name || "";
                });
            },

            getTalkIcon: function (typeId) {
                return dukeconUtils.talkIcons[typeId] || 'img/Unknown.png';
            },

            getTalks: function (talkIds, talks, speakers, metaData, favourites) {
                return _.map(talkIds, function (id) {
                    var talk = _.find(talks, function (t) {
                        return t.id === id;
                    });
                    return talk ? new Talk(talk, speakers, metaData, favourites.indexOf(talk.id) !== -1) : null;
                });
            },

            toggleFavourite: function (talkObject) {
                var favourites = dukeconSettings.toggleFavourite(talkObject.talk.id);
                talkObject.talk.toggleFavourite();
                synch.push(dukecloak.dukecloak);
            },

            getSafeHtml: function (unsafe) {
                return unsafe
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;")
                    .replace(/"/g, "&quot;")
                    .replace(/'/g, "&#039;")
                    .replace(/\n/g, "<br />");
            }
        };

        function addCustomCss() {
			// insert the custom style into the html, if not already done
			if ($('#styleCssNode').length === 0) {
				urlprovider.getCustomCssUrl(function (url) {
					$('head').append($('<link id="styleCssNode" rel="stylesheet" href="' + url + '"/>'));
				});
			}
        }
        
        function initializeApp() {
            languageUtils.init();
            offline.init();
            offline.getData(function(allData) {
                if (allData) {
                    document.title = allData.name;
                }
            });
            addCustomCss();
        }

        return {
            initializeApp: initializeApp,
            Talk: Talk,
            Speaker: Speaker,
            addCustomCss: addCustomCss,
            getSpeakerInfo: dukeconUtils.getSpeakerInfo,
            toggleFavourite: dukeconUtils.toggleFavourite,
            cookiesConfirmed: cookiesConfirmed
        };
    }
);