// PLEASE! PLEASE! PLEASE! DO NEVER EVER CHANGE THIS LINE and check it into Git!!!
var jsonUrl = "rest/conference";

function Talk(data, speakers, metaData, isFavourite) {
    this.id = data.id || '';
    this.day = dukeconDateUtils.getDisplayDate(data.start);
    this.startDisplayed = dukeconDateUtils.getDisplayTime(data.start);
    this.duration = dukeconDateUtils.getDurationInMinutes(data.start, data.end);
    this.startSortable = data.start || '';
    this.track = dukeconUtils.getTrack(metaData, data.trackId);
    this.location = dukeconUtils.getLocation(metaData, data.roomId);
    this.level = dukeconUtils.getLevel(metaData, data.audienceId);
    this.title = data.title || '';
    this.speakerString = dukeconUtils.getSpeakerNames(data.speakerIds, speakers, false).join(', ');
    this.speakersWithCompanies = dukeconUtils.getSpeakerNames(data.speakerIds, speakers, true);
    this.language = dukeconUtils.getLanguage(metaData, data.languageId);
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
    this.talkIcon = dukeconUtils.getTalkIcon(data.trackId || '')
};

function Speaker(data, talks, speakers, metaData) {
    this.name = data.name || '';
    this.company = data.company || '';
    this.talks = dukeconUtils.getTalks(data.talkIds, talks, speakers, metaData);
};


var dukeconDateUtils = {

    weekDays : ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"],

    sortDays : function(dayString1, dayString2) {
        var day1 = dayString1 ? dayString1.split(',')[0] : '';
        var day2 = dayString2 ? dayString2.split(',')[0] : '';
        var posDay1 = dukeconDateUtils.weekDays.indexOf(day1);
        var posDay2 = dukeconDateUtils.weekDays.indexOf(day2);
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
        var weekDay = this.weekDays[date.getDay()];
        return weekDay + ", " + day + "." + month + ".";
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
        if (hoursAndMinutes.length != 2) {
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
        this.title = params.value;
    },
    template:
        '<div class="header">'
        + '<a href="http://www.javaland.eu"><img src="img/logo_javaland.gif" title="javaland 2016"/></a>'
        + '<div class="main-menu">'
        + '<a href="index.html">Talks</a>|<a href="speakers.html">Sprecher</a>|<a href="feedback.html">Feedback</a>'
        + '</div>'
        + '<h1 id="headertitle" data-bind="text: title"></h1>'
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
                //+ '<img style="cursor:pointer; margin-left: 2px;" title="Add to Favourites" data-bind="click: dukeconSettings.toggleFavourite, attr:{src: talk.favicon}"/>'
            + '</div>'
            + '<div class="speaker"><span data-bind="text: talk.speakerString" /></div>'
            + '<div data-bind="attr: {class: talk.timeClass}">'
                + '<img width="16px" height="16px" src="img/Clock.png" alt="Startzeit" title="Startzeit"/>'
                + ' <span data-bind="text: talk.day"></span><span>,&nbsp;</span>'
                + '<span data-bind="text: talk.startDisplayed"></span> (<span data-bind="text: talk.duration"></span><span> min)</span>'
            + '</div>'
            + '<div class="room"><img width="16px" height="16px" src="img/Home.png" alt="Raum" title="Raum"/> <span data-bind="text: talk.location" /></div>'
            + '<div class="track"><img width="16px" height="16px" data-bind="attr: {src: talk.talkIcon }" alt="Track" title="Track"/> <span data-bind="text: talk.track" /></div>'
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
        //return dukeconUtils.getById(metaData.rooms, locationId);
        var value = _.find(metaData.rooms, function(d) {
            return d.id === locationId;
        });
        return value ? value.name : '';
    },

    getById : function(data, id) {
        var value = _.find(data, function(d) {
            return d.id === id;
        });
        return value ? value.names.de : '';
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

    getTalks(talkIds, talks, speakers, metaData) {
        return _.map(talkIds, function(id) {
           var talk = _.find(talks, function(t) {
                return t.id === id;
            });
           return talk ? new Talk(talk, speakers, metaData, false) : null;
        });
    },
};
