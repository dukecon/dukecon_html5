// PLEASE! PLEASE! PLEASE! DO NEVER EVER CHANGE THIS LINE and check it into Git!!!
var jsonUrl = "rest/conferences/499959";
var slicedEventsJsonUrl = "rest/conferences/499959/slicedEvents";

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
    this.isTrackVisible = ko.computed(function() { return self.trackDisplay() !== '';});
    this.locationDisplay = ko.observable(dukeconUtils.getLocation(metaData, data.locationId));
    this.location = data.locationId || '';
    this.locationOrder = dukeconUtils.getOrderById(metaData.locations, data.locationId);
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
    this.showAlertWindow = function() {
        // requires scrollfix.js for cookie handling:
        var alreadySeen = readCookie('dukecon.favouriteAlertSeen');
        if (!dukecloak.auth.loggedIn() && !alreadySeen) {
            var alertWin = document.getElementById('alert-window');
            if (alertWin) {
                var position = getScrollXY();
                alertWin.className = 'shown';
                alertWin.style.top = (position[1] + 150) + 'px';
                alertWin.style.left = (position[0] + 40) + 'px';
            }
        }
    };
    this.toggleFavourite = function() {
        this.showAlertWindow();
        this.favourite(!this.favourite());
    };

    languageUtils.selectedLanguage.subscribe(function() {
        self.day(dukeconDateUtils.getDisplayDate(data.start));
        self.trackDisplay(dukeconUtils.getTrack(metaData, data.trackId));
        self.levelDisplay(dukeconUtils.getLevel(metaData, data.audienceId));
        self.languageDisplay(dukeconUtils.getLanguage(metaData, data.languageId));
        self.locationDisplay(dukeconUtils.getLocation(metaData, data.locationId));
    });

}

function Speaker(data, talks, speakers, metaData, favorites) {
    this.name = data.name || '';
    this.company = data.company || '';
    this.talks = dukeconUtils.getTalks(data.eventIds, talks, speakers, metaData, favorites);
}


var cookiesConfirmed = ko.observable();
var closeCookieDisclaimer = function() {
    createCookie('dukecon.cookiesConfirmed', '1', 1);
    document.getElementById('cookies').style.display="none";
};

var dukeconDateUtils = {

    weekDays : {
         'de' : ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"],
         'en' : ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    },

    weekDaysShort : {
         'de' : ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
         'en' : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
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
        return this.getFullDate(datetimeString, true);
    },

    getDisplayDateShort : function(datetimeString) {
        return this.getFullDate(datetimeString, false);
    },

    getFullDate : function(datetimeString, useLongDay) {
        if (!datetimeString) {
            return '';
        }
        var date = new Date(datetimeString);
        var weekday = useLongDay ?
            this.weekDays[languageUtils.selectedLanguage()][date.getDay()] :
            this.weekDaysShort[languageUtils.selectedLanguage()][date.getDay()];
        return weekday + ", " + this.getNumericDate(datetimeString);
    },

    getNumericDate : function(datetimeString) {
        if (!datetimeString) {
            return '';
        }
        var date = new Date(datetimeString);
        var month = this.addLeadingZero(date.getMonth() + 1);
        var day = this.addLeadingZero(date.getDate());
        return day + "." + month + ".";
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
        var millis = dateEnd - dateStart;
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
        this.active = params.value;
        this.icon = languageUtils.getLanguageIconUrl();
		this.getCssClass = function(item) {
			return (item === this.active ? "mainmenu active" : "mainmenu inactive");
		};
		this.toggleMenu = function() {
			var menu = document.getElementById('mainmenu-items');
			if (menu) {
				if (menu.className === "") {
					menu.className = "shown";
				} else {
					menu.className = "";
				}
			}
		};
    },
    template:
        '<div class="header">'
		+ '<h1 id="headertitle">'
		+ '	<a id="logo" href="index.html"><img src="img/logo_javaland.gif" title="javaland 2016"/></a>'
		+ ' <span id="pagetitle" data-bind="resource: active"></span>'
		+ ' <div id="mainmenu-button" data-bind="click: toggleMenu"><img src="img/menu_24px.svg"></div>'
		+ ' <div id="mainmenu-items">'
		+ '	 <a href="index.html" data-bind="resource: \'talks\', attr: {class: getCssClass(\'talks\')}"></a>'
		+ '	 <a href="speakers.html" data-bind="resource: \'speaker\', attr: {class: getCssClass(\'speaker\')}"></a>'
		+ '	 <a href="feedback.html" data-bind="resource: \'feedback\', attr: {class: getCssClass(\'feedback\')}"></a>'
		+ '	 <a href="http://www.javaland.eu" target="new" class="mainmenu inactive">Javaland Home</a>'
		+ '	 <a class="mainmenu" id="language-select" onclick="languageUtils.toggleLanguage();"><img alt="Sprache umschalten / Change language" title="Sprache umschalten / Change language" data-bind="attr : { src : icon }"/>'
		+ ' </div>'
		+ '</h1>'
        + '</div>'
});

//widgets
ko.components.register('login-widget', {
    viewModel : function(params) {
    	this.hideLoginButton = params.allowLogin === false;
    },
    template:
    	'<div id="login-area" data-bind="visible: dukecloak">'
		+ '     <div>'
		+ '         <a href="#" class="username" data-bind="text: dukecloak.auth.username, click: dukecloak.keycloakAuth.accountManagement, visible: dukecloak.auth.loggedIn && dukecloak.auth.username"></a>'
		+ '         <a class="button" data-bind="click: dukecloak.login, visible: !hideLoginButton && dukecloak.auth.loggedOut" name="login"><img alt="Sign in/Register" title="Sign in/Register" src="img/unlock_24px.svg"></a>'
		+ '         <a class="button" data-bind="click: dukecloak.logout, visible: !hideLoginButton && dukecloak.auth.loggedIn" name="logout"><img alt="Sign Out" title="Sign Out" src="img/lock_24px.svg"></a>'
		+ '     </div>'
		+ '</div>'
});

ko.components.register('footer-widget', {
    template:
        '<div class="footer">'
        + '<div id="#update-info">'
            + '<span data-bind="visible: dukeconTalkUtils.updateCheck"style="margin-left:5px;">Checking for update...</span>'
        + '</div>'
            + '<a href="impressum.html" data-bind="resource: \'imprint\'"></a>'
        + '</div>'
});

ko.components.register('alert-window', {
    viewModel : function(params) {
    	this.resourceTitle = params.resourceTitle;
    	this.resourceBody = params.resourceBody;
    	this.hide = function() {
            createCookie('dukecon.favouriteAlertSeen', '1', 1);
    	    document.getElementById('alert-window').className="";
    	};
    },
    template:
        '<div id="alert-window">'
        + '   <div class="alert-title" data-bind="resource : resourceTitle"></div>'
        + '   <div class="alert-body" data-bind="resource : resourceBody"></div>'
        + '   <div class="alert-button">'
        + '      <button data-bind="click: function() { hide(); }">OK</button>'
        + '   </div>'
        + '</div>'
});

ko.components.register('talk-widget', {
    viewModel: function(data) {
        this.talk = data.value;
    },
    template:
        '<div data-bind="attr : {class: \'talk-cell \' + talk.timeCategory}">'
            + '<div class="title">'
                + '<img style="cursor:pointer; margin-right: 2px;" title="Add to Favourites" data-bind="click: dukeconUtils.toggleFavourite, attr:{src: talk.favicon}"/>'
                + '<a style="padding: 0px" data-bind="text: talk.title, attr : { href : \'talk.html#talk?talkId=\' + talk.id }"></a>'
            + '</div>'
            + '<div class="speaker"><span data-bind="text: talk.speakerString" /></div>'
            + '<div data-bind="attr: {class: talk.timeClass}">'
                + '<img width="16px" height="16px" src="img/Clock.png" alt="Startzeit" title="Startzeit"/>'
                + ' <span class="day-long" data-bind="text: talk.day"></span>'
                + '<span class="day-short" data-bind="text: talk.dayshort"></span><span>,&nbsp;</span>'
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
                    return s.id === speakerId;
                }
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

	getTalks : function(talkIds, talks, speakers, metaData, favourites) {
        return _.map(talkIds, function(id) {
           var talk = _.find(talks, function(t) {
                return t.id === id;
            });
           return talk ? new Talk(talk, speakers, metaData, favourites.indexOf(talk.id) !== -1) : null;
        });
    },

    toggleFavourite : function(talkObject) {
        var favourites = dukeconSettings.toggleFavourite(talkObject.talk.id);
        talkObject.talk.toggleFavourite();
        dukeconSynch.push();
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
        talks : {
            'de' : 'Talks',
            'en' : 'Talks'
        },
        speaker : {
            'de' : 'Sprecher',
            'en' : 'Speakers'
        },
        feedback : {
            'de' : 'Feedback',
            'en' : 'Feedback'
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
        disablefavorites : {
            'de' : 'Ist eventuell die Einstellung "Nur Favoriten" aktiviert?',
            'en' : 'Also check if you have "Only Favorites" selected.'
        },
        active : {
            'de' : 'Aktiv',
            'en' : 'Active'
        },
        // imprint
        imprint : {
            'de' : 'Impressum',
            'en' : 'Imprint'
        },
        // favorites hint
        favoriteAlertTitle : {
            'de' : 'Favoriten',
            'en' : 'Favorites'
        },
        favoriteAlertBody : {
            'de' : 'Favoriten werden erst mit Eurem Konto synchronisiert wenn Ihr Euch einloggt bzw. registriert. <br><br>Clickt dazu auf das Schloss-Symbol oben.',
            'en' : 'Favorites are synchronized with your account once you log in. <br><br>Click the lock symbol at the top to do so.'
        },
        // regarding cookies
        cookieDisclaimer : {
            'de' : 'Diese Seite verwendet <a href="https://de.wikipedia.org/wiki/Cookie" target="new">Cookies</a>, ' +
                   'um Seitenpositionen und Authentifizierungsstatus zu verfolgen. Es werden keine Daten aus diesen Cookies an '
                   + 'Dritte weitergegeben. Mit Verwendung dieser Webseite erklären Sie sich mit diesen Bedingungen einverstanden. '
                   + 'Wenn Sie Cookies im Browser deaktivieren, kann dies die Bedienung dieser Webseite beeinträchtigen.',
            'en' : '<a href="https://en.wikipedia.org/wiki/HTTP_cookie" target="new">Cookies</a> are used on this page to track '
                   + 'page positions and authentication status. No data from these cookies is forwarded to third parties. '
                   + 'By using this website you agree to these conditions. Please note that disabling cookies in your browser '
                   + 'may diminish your experience when using this site.'
        },
        cookieDisclaimerOK : {
            'de' : 'Verstanden',
            'en' : 'Understood'
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
        if(typeof dukeconSettings !== 'undefined') {
            languageUtils.selectedLanguage(dukeconSettings.getSelectedLanguage());
        } else {
            languageUtils.selectedLanguage("de");
        }
        // pre-creating computed elements to avoid having it multiple times on a page
        for (var key in languageUtils.strings) {
            if (languageUtils.strings.hasOwnProperty(key)) {
                languageUtils.strings[key].resource = ko.pureComputed(function() {
                    return this.languageUtils.strings[this.key][this.languageUtils.selectedLanguage()];
                }, { languageUtils: languageUtils, key: key} );
            }
        }
    },

    toggleLanguage : function () {
        if (languageUtils.selectedLanguage() === 'de') {
            languageUtils.selectedLanguage('en');
        } else {
            languageUtils.selectedLanguage('de');
        }
        dukeconSettings.saveSelectedLanguage(languageUtils.selectedLanguage());
    },

    getLanguageIconUrl : function() {
        return ko.pureComputed(function() {
            return 'img/' + languageUtils.selectedLanguage() + '.png';
        }, { languageUtils: languageUtils});
    },

    getResource : function(resourceKey) {
        return languageUtils.strings[resourceKey] ?
            languageUtils.strings[resourceKey].resource  :
            resourceKey;
    }
};

languageUtils.init();

ko.bindingHandlers['resource'] = {
    init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
        return { 'controlsDescendantBindings': true };
    },
    update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
        ko.utils.setHtml(element, languageUtils.getResource(valueAccessor()));
    }
};

var hideLoading = function(delayMs) {
        var loadingDiv = $('#loading'), contentDiv = $('.content');
        // tried knockout-event-catching (ko.bindingHandlers...) but it doesn't work, so adding a minimal timeout here to avoid watching the screen render
        setTimeout(function() {
            contentDiv.removeClass('hidden');
            if (!loadingDiv.hasClass('hidden')) {
              loadingDiv.addClass('hidden');
            }
        }, delayMs ? delayMs : 5);
 };
