define(['underscore', 'jquery', 'knockout', 'js/modules/dukecondb', 'js/modules/urlprovider', 'js/modules/imageprovider', 'js/modules/dukeconsettings', 'js/modules/dukecondateutils', 'js/modules/languageutils', 'js/modules/offline', 'js/modules/dukecloak', 'js/modules/synch'],
    function (_, $, ko, dukeconDb, urlprovider, imageprovider, dukeconSettings, dukeconDateUtils, languageUtils, offline, dukecloak, synch) {

        var authEnabled = ko.observable(false);

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

            self.id = data.id || '';
            self.authEnabled = authEnabled;
            self.startDate = data.start ? new Date(data.start) : null;
            self.day = ko.observable(dukeconDateUtils.getDisplayDate(data.start));
            self.dayshort = ko.observable(dukeconDateUtils.getDisplayDateShort(data.start));
            self.startDisplayed = dukeconDateUtils.getDisplayTime(data.start);
            self.duration = dukeconDateUtils.getDurationInMinutes(data.start, data.end);
            self.startSortable = data.start || '';
            self.trackDisplay = ko.observable(dukeconUtils.getTrack(metaData, data.trackId));
            self.track = data.trackId || '';
            self.talkIcon = ko.observable('img/Unknown.png');
            self.isTrackVisible = ko.computed(function () {
                return self.trackDisplay() !== '';
            });
            self.locationDisplay = ko.observable(dukeconUtils.getLocation(metaData, data.locationId));
            self.locationCapacity = ko.observable(dukeconUtils.getLocationCapacity(metaData, data.locationId));
            self.location = data.locationId || '';
            self.locationOrder = dukeconUtils.getOrderById(metaData.locations, data.locationId);
            self.levelDisplay = ko.observable(dukeconUtils.getLevel(metaData, data.audienceId));
            self.level = data.audienceId || '';
            self.title = dukeconUtils.getSafeHtml(data.title || '');
            self.speakerString = dukeconUtils.getSpeakerNames(data.speakerIds, speakers).join(', ');
            self.speakerIds = data.speakerIds;
            self.languageDisplay = ko.observable(dukeconUtils.getLanguage(metaData, data.languageId));
            self.language = data.languageId || '';
            self.languageIcon = getLanguageIcon(data, metaData);
            self.simultan = data.simultan;
            self.fullAbstract = dukeconUtils.getSafeHtml(data.abstractText || '');
            self.timeCategory = dukeconDateUtils.getTimeCategory(self.duration);
            self.timeClass = self.timeCategory == 'regular' ? 'time' : 'time-extra alternate';
            self.favourite = ko.observable(isFavourite);
            self.numberOfFavorites = ko.observable(data.numberOfFavorites);
            self.fullyBooked = ko.observable(data.fullyBooked);
            self.favicon = ko.computed(function () {
                return self.favourite() ? "img/StarFilled.png" : "img/StarLine.png";
            });

            dukeconUtils.getTalkIcon(data.trackId, function(image) {
                self.talkIcon(image);
            });

            self.showAlertWindow = function () {
                console.log("show alert, auth=" + self.authEnabled());
                if (self.authEnabled()) {
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
                }
            };

            self.toggleFavourite = function () {
                self.showAlertWindow();
                self.favourite(!self.favourite());
                var delta = self.favourite() ? 1 : (self.numberOfFavorites() > 0 ? -1 : 0);
                self.numberOfFavorites(self.numberOfFavorites() + delta);
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

            getLocationCapacity: function (metaData, locationId) {
                var value = _.find(metaData.locations, function (d) {
                    return d.id === locationId;
                });
                return value ? value.capacity || "" : "";
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

            getTalkIcon: function (typeId, callback) {
                imageprovider.getByName("streamImages", function(allStreamIcons) {
                    if (allStreamIcons && typeof allStreamIcons === "object") {
                        callback(allStreamIcons[typeId] || 'img/Unknown.png');
                    }
                });
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

        function performCustomizations() {
			// insert the custom style into the html, if not already done
			if ($('#styleCssNode').length === 0) {
				urlprovider.getData(function (urlData) {
					$('head').append($('<link id="styleCssNode" rel="stylesheet" href="' + urlData.customCssUrl + '"/>'));
                    authEnabled(urlData.authEnabled);
				});
			}
        }
        
        function initializeApp() {
            languageUtils.init();
            offline.init();
            performCustomizations();
        }

        return {
            initializeApp: initializeApp,
            Talk: Talk,
            Speaker: Speaker,
            addCustomCss: performCustomizations,
            getSpeakerInfo: dukeconUtils.getSpeakerInfo,
            toggleFavourite: dukeconUtils.toggleFavourite,
            cookiesConfirmed: cookiesConfirmed
        };
    }
);