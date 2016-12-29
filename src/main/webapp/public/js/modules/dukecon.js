define(['underscore', 'jquery', 'knockout', 'js/modules/dukecondb', 'js/modules/urlprovider', 'js/modules/dukeconsettings', 'js/modules/dukecondateutils', 'js/modules/languageutils', 'js/modules/offline', 'js/modules/dukecloak', 'js/modules/synch'],
    function (_, $, ko, dukeconDb, urlprovider, dukeconSettings, dukeconDateUtils, languageUtils, offline, dukecloak, synch) {

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
            this.title = data.title || '';
            this.speakerString = dukeconUtils.getSpeakerNames(data.speakerIds, speakers).join(', ');
            this.speakersWithCompanies = dukeconUtils.getSpeakerInfo(data.speakerIds, speakers);
            this.languageDisplay = ko.observable(dukeconUtils.getLanguage(metaData, data.languageId));
            this.language = data.languageId || '';
            this.fullAbstract = dukeconUtils.getSaveAbstractHtml(data.abstractText || '');
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
            this.company = data.company || '';
            this.twitterHandle = '';
            this.twitterLink = '';
            if (data.twitter && data.twitter.length > 1) {
                this.twitterHandle = data.twitter;
                this.twitterLink = "http://www.twitter.com/" + (data.twitter.indexOf('@') === 0 ? data.twitter.substr(1) : data.twitter);
            }

            this.email = "addme@when.available";
            this.image = "img/Unknown.png";
            this.blog = "http://addme.when.available";
            this.web = "http://addme.when.available";
            this.fb = "addme_when_avail";
            this.gplus = "addme_when_avail";
            this.bio = "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.";
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
                return dukeconUtils.getById(metaData.tracks, trackId);
            },

            getLanguage: function (metaData, languageId) {
                return dukeconUtils.getById(metaData.languages, languageId);
            },

            getLevel: function (metaData, levelId) {
                return dukeconUtils.getById(metaData.audiences, levelId);
            },

            getLocation: function (metaData, locationId) {
                return dukeconUtils.getById(metaData.locations, locationId);
            },

            getById: function (data, id) {
                var value = _.find(data, function (d) {
                    return d.id === id;
                });
                return value ? value.names[languageUtils.selectedLanguage()] : '';
            },

            getOrderById: function (data, id) {
                var value = _.find(data, function (d) {
                    return d.id === id;
                });
                return value ? value.order : 0;
            },

            getSpeakerInfo: function (speakerIds, speakers) {
                if (!speakerIds || speakerIds.length === 0) {
                    return [];
                }
                var filteredSpeakers = _.filter(speakers, function (speaker) {
                    return speaker && speaker.name;
                });
                return _.map(speakerIds, function (speakerId) {
                    var speaker = _.find(speakers, function (s) {
                                return s.id === speakerId;
                            }
                        ) || {};
                    var twitterHandle = "", twitterLink = "";
                    if (speaker.twitter && speaker.twitter.length > 1) {
                        twitterHandle = "(" + speaker.twitter + ")";
                        twitterLink = "http://www.twitter.com/" + (speaker.twitter.indexOf('@') === 0 ? speaker.twitter.substr(1) : speaker.twitter);
                    }
                    return {
                        name: speaker.name || "",
                        company: (speaker.company ? ", " + speaker.company : ''),
                        twitterHandle: twitterHandle,
                        twitterLink: twitterLink
                    };
                });
            },

            getSpeakerNames: function (speakerIds, speakers) {
                if (!speakerIds || speakerIds.length === 0) {
                    return [];
                }
                var filteredSpeakers = _.filter(speakers, function (speaker) {
                    return speaker && speaker.name;
                });
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

            getSaveAbstractHtml: function (unsafe) {
                return unsafe
                    .replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;")
                    .replace(/"/g, "&quot;")
                    .replace(/'/g, "&#039;")
                    .replace(/\n/g, "<br />");
            }
        };

        function initializeApp() {
            languageUtils.init();
            offline.init();
        }

        // insert the custom style into the html, if not already done
        if ($('#styleCssNode').length === 0) {
            urlprovider.getCustomCssUrl(function (url) {
                $('head').append($('<link id="styleCssNode" rel="stylesheet" href="' + url + '"/>'));
            });
        }

        return {
            initializeApp: initializeApp,
            Talk: Talk,
            Speaker: Speaker,
            toggleFavourite: dukeconUtils.toggleFavourite,
            cookiesConfirmed: cookiesConfirmed
        };
    }
);