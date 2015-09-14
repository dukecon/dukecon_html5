var jsonUrl = "demotalks.json";
//var jsonUrl = "../rest/talks";
//var jsonUrl = "http://dev.dukecon.org/latest/rest/talks";
var originHeader = "http://dev.dukecon.org";

function Talk(data, isFavourite) {
    this.id = data.id || '';
    this.day = dukeconDateUtils.getDisplayDate(data.start);
    this.startDisplayed = dukeconDateUtils.getDisplayTime(data.start);
    this.startSortable = data.start || '';
    this.track = data.track || '';
    this.location = data.location || '';
    this.level = data.level || '';
    this.title = data.title || '';
    this.speakers = dukeconUtils.getSpeakerNames(data.speakers);
    this.speakerString = data.speakers ? data.speakers[0].name : ""; // TODO: comma-list
    this.language = data.language || '';
    this.fullAbstract = data.abstractText || '';
    this.shortAbstract = this.fullAbstract.substring(0, 100) + "...";
    this.favourite = ko.observable(isFavourite);
    this.favicon = ko.computed(function() {
        return this.favourite() ? "img/StarFilled.png" : "img/StarLine.png";
    }, this);
    this.toggleFavourite = function() {
        this.favourite(!this.favourite());
    };
    this.talkIcon = dukeconUtils.talkIcons[this.track] || 'img/Unknown.png';
};

function Speaker(name, company, talks) {
    this.name = name;
    this.company = company;
    this.talks = talks;
};


var dukeconDateUtils = {

    weekDays : ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"],

    getDisplayDate : function(datetimeString) {
        if (!datetimeString) {
            return '';
        }
        var date = new Date(datetimeString);
        var month = this.addTrailingZero(date.getMonth() + 1);
        var day = this.addTrailingZero(date.getDate());
        var weekDay = this.weekDays[date.getDay()];
        return weekDay + ", " + day + "." + month;
    },

    getDisplayTime : function(datetimeString) {
        if (!datetimeString) {
            return '';
        }
        var date = new Date(datetimeString);
        return this.addTrailingZero(date.getHours()) + ":" + this.addTrailingZero(date.getMinutes());
    },

    addTrailingZero : function(data) {
        if (data < 10) {
            return '0' + data;
        }
        return data;
    }
};

//widgets
ko.components.register('header-widget', {
    viewModel : function(params) {
        this.title = params.value;
    },
    template:
        '<div class="header">'
        + '<img src="img/logo_javaland.gif" title="javaland 2016"/>'
        + '<div class="main-menu">'
        + '<a href="index.html">Talks</a>|<a href="speakers.html">Sprecher</a>|<a href="impressum.html">Impressum</a>'
        + '</div>'
        + '<h1 id="headertitle" data-bind="text: title"></h1>'
        + '</div>'
});

ko.components.register('talk-widget', {
    viewModel: function(data) {
        this.talk = data.value;
    },
    template:
        '<div class="talk-cell">'
            + '<div class="title">'
                + '<a style="padding: 0px" data-bind="text: talk.title, attr : { href : \'talk.html#talk?talkId=\' + talk.id }"></a>'
                //+ '<img style="cursor:pointer; margin-left: 2px;" title="Add to Favourites" data-bind="click: dukeconSettings.toggleFavourite, attr:{src: talk.favicon}"/>'
            + '</div>'
            + '<div class="speaker"><span data-bind="text: talk.speakerString" /></div>'
            + '<div class="time"><img witdh="16px" height="16px" src="img/Clock.png" alt="Startzeit" title="Startzeit"/> <span data-bind="text: talk.day" />,&nbsp;</div><div class="time"> <span data-bind="text: talk.startDisplayed" /> </div>'
            + '<div class="room"><img witdh="16px" height="16px" src="img/House.png" alt="Raum" title="Raum"/> <span data-bind="text: talk.location" /></div>'
            + '<div class="track"><img witdh="16px" height="16px" data-bind="attr: {src: talk.talkIcon }" alt="Track" title="Track"/> <span data-bind="text: talk.track" /></div>'
            + '</div>'
});

//not sure where else to put
var dukeconUtils = {
    talkIcons : {
        "Architecture & Security": "img/track_architecture.jpg",
        "Core Java/JVM-basierte Sprachen": "img/track_jvm-languages.jpg",
        "Enterprise Java und Cloud": "img/track_enterprise-java-cloud.jpg",
        "Frontend & Mobile": "img/track_frontend-mobile.jpg",
        "IDEs & Tools": "img/track_ide-tools.jpg",
        "Container und Microservices": "img/track_microservices.jpg",
        "Internet der Dinge": "img/track_internet-of-things.jpg",
        "Newcomer": "img/track_newcomer.jpg"
    },

    getSpeakerNames : function(speakers) {
        var filteredSpeakers = _.filter(speakers, function(speaker) {
            return speaker;
        });
        return _.map(filteredSpeakers, function(speaker) {
            return speaker.name + ", " + speaker.company;
        });
    }
};
