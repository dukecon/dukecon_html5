// PLEASE! PLEASE! PLEASE! DO NEVER EVER CHANGE THIS LINE and check it into Git!!!
var jsonUrl = "rest/conferences/499959";
var slicedEventsJsonUrl = "rest/conferences/499959/slicedEvents";

function Talk(data, speakers, metaData, isFavourite) {
    var self = this;

    this.id = data.id || '';
    this.startDate = data.start ? new Date(data.start) : null;
    this.day = ko.observable(dukeconDateUtils.getDisplayDate(data.start));
    this.startDisplayed = dukeconDateUtils.getDisplayTime(data.start);
    this.duration = dukeconDateUtils.getDurationInMinutes(data.start, data.end);
    this.startSortable = data.start || '';
    this.trackDisplay = ko.observable(dukeconUtils.getTrack(metaData, data.trackId));
    this.track = data.trackId || '';
    this.talkIcon = dukeconUtils.getTalkIcon(data.trackId || '')
    this.isTrackVisible = ko.computed(function() { return self.trackDisplay() !== '';})
    this.locationDisplay = ko.observable(dukeconUtils.getLocation(metaData, data.locationId));
    this.location = data.locationId || '';
    this.locationOrder = dukeconUtils.getOrderById(metaData.locations, data.locationId)
    this.levelDisplay = ko.observable(dukeconUtils.getLevel(metaData, data.audienceId));
    this.level = data.audienceId || '';
    this.title = data.title || '';
    this.speakerString = dukeconUtils.getSpeakerNames(data.speakerIds, speakers, false).join(', ');
    this.speakersWithCompanies = dukeconUtils.getSpeakerNames(data.speakerIds, speakers, true);
    this.languageDisplay = ko.observable(dukeconUtils.getLanguage(metaData, data.languageId));
    this.language = data.languageId || '';
    this.fullAbstract = data.abstractText || '';
    this.timeCategory =  dukeconDateUtils.getTimeCategory(this.duration);
    this.timeClass = this.timeCategory == 'regular' ? 'time' : 'time-extra';
    this.favourite = ko.observable(isFavourite);
    this.favicon = ko.computed(function() {
        return this.favourite() ? "img/StarFilled.png" : "img/StarLine.png";
    }, this);
    this.toggleFavourite = function() {
        this.favourite(!this.favourite());
    };

    languageUtils.selectedLanguage.subscribe(function(language) {
        self.day(dukeconDateUtils.getDisplayDate(data.start));
        self.trackDisplay(dukeconUtils.getTrack(metaData, data.trackId));
        self.levelDisplay(dukeconUtils.getLevel(metaData, data.audienceId));
        self.languageDisplay(dukeconUtils.getLanguage(metaData, data.languageId));
        self.locationDisplay(dukeconUtils.getLocation(metaData, data.locationId));
    });

};

function Speaker(data, talks, speakers, metaData) {
    this.name = data.name || '';
    this.company = data.company || '';
    this.talks = dukeconUtils.getTalks(data.eventIds, talks, speakers, metaData);
};


var dukeconDateUtils = {

    weekDays : {
         'de' : ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"],
         'en' : ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    },

    sortDays : function(dayString1, dayString2) {
        var day1 = dayString1 ? dayString1.split(',')[0] : '';
        var day2 = dayString2 ? dayString2.split(',')[0] : '';
        var posDay1 = dukeconDateUtils.weekDays[languageUtils.selectedLanguage()].indexOf(day1);
        var posDay2 = dukeconDateUtils.weekDays[languageUtils.selectedLanguage()].indexOf(day2);
        if (posDay1 > posDay2) {
            return 1;
        }
        return posDay1 < posDay2 ? -1 : 0;
    },

    getDisplayDate : function(datetimeString) {
        if (!datetimeString) {
            return '';
        }
        var date = new Date(datetimeString);
        var month = this.addLeadingZero(date.getMonth() + 1);
        var day = this.addLeadingZero(date.getDate());
        var weekday = this.weekDays[languageUtils.selectedLanguage()][date.getDay()];
        return weekday + ", " + day + "." + month + ".";
    },

    //2016-03-08T10:30
    getDisplayTime : function(datetimeString) {
        if (!datetimeString) {
            return '';
        }
        var dayAndTime = datetimeString.split('T');
        if (dayAndTime.length != 2) {
            return '';
        }
        var hoursAndMinutes = dayAndTime[1].split(':');
        if (hoursAndMinutes.length < 2) {
            return '';
        }
        return this.addLeadingZero(hoursAndMinutes[0]) + ":" + this.addLeadingZero(hoursAndMinutes[1]);
    },

    getDurationInMinutes : function(dateStartString, dateEndString) {
        if (!dateStartString || !dateEndString) {
            return '';
        }
        var dateStart = new Date(dateStartString);
        var dateEnd = new Date(dateEndString);
        var millis = dateEnd - dateStart
        return millis / 1000 / 60;
    },

    getTimeCategory : function(duration) {
        if (typeof duration === 'undefined' || (duration > 30 && duration <= 60)) {
            return "regular";
        }
        if (duration <= 30) {
            return "short";
        }
        return "long";
    },

    addLeadingZero : function(data) {
        if (typeof data === 'number' && data < 10) {
            return '0' + data;
        }
        if (typeof data === 'string' && parseInt(data) < 10 && parseInt(data).length == 1) {
            return '0' + data;
        }
        return data + '';
    }
};

//widgets
ko.components.register('header-widget', {
    viewModel : function(params) {
        this.resource = params.value;
        this.title = languageUtils.getResource(params.value);
        this.icon = languageUtils.getLanguageIconUrl();
        this.speaker = languageUtils.getResource('speaker');
    },
    template:
        '<div class="header">'
        + '<a href="http://www.javaland.eu"><img src="img/logo_javaland.gif" title="javaland 2016"/></a>'
        + '<a id="language-select" onclick="languageUtils.toggleLanguage();"><img alt="Sprache umschalten / Change language" title="Sprache umschalten / Change language" data-bind="attr : { src : icon }"/></a>'
        + '<div class="main-menu">'
        + '<a href="index.html">Talks</a>|<a href="speakers.html" data-bind="text: speaker" data-resource="speaker"></a>|<a href="feedback.html">Feedback</a>'
        + '</div>'
        + '<h1 id="headertitle" data-bind="text: title, attr : {\'data-resource\' : resource}"></h1>'
        + '</div>'
});

ko.components.register('footer-widget', {
    viewModel : function() {},
    template:
        '<div class="footer">'
        + '<a href="impressum.html">Impressum</a>'
        + '</div>'
});

ko.components.register('talk-widget', {
    viewModel: function(data) {
        this.talk = data.value;
    },
    template:
        '<div data-bind="attr : {class: \'talk-cell \' + talk.timeCategory}">'
            + '<div class="title">'
                + '<a style="padding: 0px" data-bind="text: talk.title, attr : { href : \'talk.html#talk?talkId=\' + talk.id }"></a>'
                + '<img style="cursor:pointer; margin-left: 2px;" title="Add to Favourites" data-bind="click: dukeconSettings.toggleFavourite, attr:{src: talk.favicon}"/>'
            + '</div>'
            + '<div class="speaker"><span data-bind="text: talk.speakerString" /></div>'
            + '<div data-bind="attr: {class: talk.timeClass}">'
                + '<img width="16px" height="16px" src="img/Clock.png" alt="Startzeit" title="Startzeit"/>'
                + ' <span data-bind="text: talk.day"></span><span>,&nbsp;</span>'
                + '<span data-bind="text: talk.startDisplayed"></span> (<span data-bind="text: talk.duration"></span><span> min)</span>'
            + '</div>'
            + '<div class="room"><img width="16px" height="16px" src="img/Home.png" alt="Location" title="Location"/> <span data-bind="text: talk.locationDisplay" /></div>'
            + '<div class="track" data-bind="visible: talk.isTrackVisible"><img width="16px" height="16px" data-bind="attr: {src: talk.talkIcon }" alt="Track" title="Track"/> <span data-bind="text: talk.trackDisplay" /></div>'
            + '</div>'
});

//not sure where else to put
var dukeconUtils = {
    talkIcons : {
        "7": "img/track_architecture.jpg",
        "2": "img/track_jvm-languages.jpg",
        "3": "img/track_enterprise-java-cloud.jpg",
        "4": "img/track_frontend-mobile.jpg",
        "5": "img/track_ide-tools.jpg",
        "1": "img/track_microservices.jpg",
        "6": "img/track_internet-of-things.jpg",
        "8": "img/track_newcomer.jpg"
    },

    getTrack : function(metaData, trackId) {
        return dukeconUtils.getById(metaData.tracks, trackId);
    },

    getLanguage : function(metaData, languageId) {
        return dukeconUtils.getById(metaData.languages, languageId);
    },

    getLevel : function(metaData, levelId) {
        return dukeconUtils.getById(metaData.audiences, levelId);
    },

    getLocation : function(metaData, locationId) {
        return dukeconUtils.getById(metaData.locations, locationId);
    },

    getById : function(data, id) {
        var value = _.find(data, function(d) {
            return d.id === id;
        });
        return value ? value.names[languageUtils.selectedLanguage()] : '';
    },

    getOrderById : function(data, id) {
        var value = _.find(data, function(d) {
            return d.id === id;
        });
        return value ? value.order : 0;
    },

    getSpeakerNames : function(speakerIds, speakers, withCompany) {
        if (!speakerIds || speakerIds.length === 0) {
            return [];
        }
        var filteredSpeakers = _.filter(speakers, function(speaker) {
            return speaker && speaker.name;
        });
        return _.map(speakerIds, function(speakerId) {
            var speaker = _.find(speakers, function(s) {
                return s.id === speakerId}
            );
            if (withCompany) {
                return speaker.name + (speaker.company ? ", " + speaker.company : '');
            }
            return speaker.name;
        });
    },

    getTalkIcon : function(typeId) {
        return dukeconUtils.talkIcons[typeId] || 'img/Unknown.png';
    },

	getTalks : function(talkIds, talks, speakers, metaData) {
        return _.map(talkIds, function(id) {
           var talk = _.find(talks, function(t) {
                return t.id === id;
            });
           return talk ? new Talk(talk, speakers, metaData, false) : null;
        });
    }
};

var languageUtils = {

    selectedLanguage : ko.observable("de"),

    strings: {
        // talks page
        filterOptions : {
            'de' : 'Filter-Optionen',
            'en' : 'Filter Options'
        },
        toggleFavorites: {
            'de' : 'Nur Favoriten',
            'en' : 'Only Favorites'
        },
        reset : {
            'de' : 'Zurücksetzen',
            'en' : 'Reset'
        },
        speaker : {
            'de' : 'Sprecher',
            'en' : 'Speakers'
        },
        level : {
            'de' : 'Zielgruppe',
            'en' : 'Audience'
        },
        track : {
            'de' : 'Track',
            'en' : 'Track'
        },
        location : {
            'de' : 'Ort',
            'en' : 'Location'
        },
        language : {
            'de' : 'Sprache',
            'en' : 'Language'
        },
        notalksfound : {
            'de' : 'Keine Talks gefunden; bitte die Filter ',
            'en' : 'No talks found; please perform a filter '
        },
        deactivate : {
            'de' : 'Deaktivieren',
            'en' : 'Deactivation'
        },
        or : {
            'de' : ' oder ',
            'en' : ' or '
        },
        active : {
            'de' : 'Aktiv',
            'en' : 'Active'
        },
        // feedback page
        feedback_content : {
            'de' : '<span>Rückmeldungen zur Javaland Talks Webseite bitte per Mail an</span>'
                + '<a href="mailto:feedback@dukecon.org">feedback@dukecon.org</a><span> oder direkt</span>'
                + '<a href="https://github.com/dukecon/dukecon/issues" alt="Isssuetracker">hier</a><span>ein Ticket erfassen!</span>',
            'en' : '<span>Please send any feedback about the Javaland Talks website via mail to</span>'
                + '<a href="mailto:feedback@dukecon.org">feedback@dukecon.org</a><span>or</span>'
                + '<a href="https://github.com/dukecon/dukecon/issues" alt="Isssuetracker">create a ticket here</a><span>!</span>'
        }
    },

    init : function() {
        languageUtils.selectedLanguage(dukeconSettings.getSelectedLanguage());
    },

    toggleLanguage : function () {
        var languageImg = $('#language-select img');
        if (languageUtils.selectedLanguage() === 'de') {
            languageUtils.selectedLanguage('en');
        } else {
            languageUtils.selectedLanguage('de');
        }
        languageUtils.setLanguageStrings();
        languageImg.attr('src', languageUtils.getLanguageIconUrl());
        dukeconSettings.saveSelectedLanguage(languageUtils.selectedLanguage());
    },

    getLanguageIconUrl : function() {
        return 'img/' + languageUtils.selectedLanguage() + '.png';
    },

    getResource : function(resourceKey) {
        return languageUtils.strings[resourceKey] ?
            languageUtils.strings[resourceKey][languageUtils.selectedLanguage()] :
            resourceKey;
    },

    setLanguageStrings : function() {
        $.each($('[data-resource]'), function(index, elem) {
            var node = $(elem),
                resourceKey = node.attr('data-resource');
            if (typeof languageUtils.strings[resourceKey] !== 'undefined') {
                node.html(languageUtils.getResource(resourceKey));
            }
        });
    }
};