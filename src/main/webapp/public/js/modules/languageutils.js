define(['knockout', 'js/modules/dukeconsettings', 'js/modules/browserinfo'], function(ko, dukeconSettings, browserInfo) {
    "use strict";

	var browserLanguage = browserInfo.getBrowserLanguage();
    
    var selectedLanguage = ko.observable(browserLanguage);

    var strings = {
        // back button
        backbutton : {
            'de' : 'Zurück',
            'en' : 'Back'
        },
        // search
        search : {
            'de' : 'Suchen',
            'en' : 'Search'
        },
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
        schedule : {
            'de' : 'Stundenplan',
            'en' : 'Timetable'
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
        uparrow : {
            'de' : 'nach oben',
            'en' : 'back to top'
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
            'de' : '<span>Rückmeldungen zur Conference Planner Webseite bitte per Mail an</span>'
                + '<a href="mailto:feedback@dukecon.org" title="email">feedback@dukecon.org</a><span> oder direkt</span>'
                + '<a href="https://github.com/dukecon/dukecon/issues" title="Isssuetracker">hier</a><span>ein Ticket erfassen!</span>',
            'en' : '<span>Please send any feedback about the Conference Planner website via mail to</span>'
                + '<a href="mailto:feedback@dukecon.org">feedback@dukecon.org</a><span>or</span>'
                + '<a href="https://github.com/dukecon/dukecon/issues" title="Isssuetracker">create a ticket here</a><span>!</span>'
        },
        // Speaker details
        speakertalks: {
            'de' : "Talks dieses Sprechers",
            'en' : "Talks held by this speaker"
        }
    };

    var init = function() {
        if (typeof dukeconSettings !== 'undefined') {
            selectedLanguage(dukeconSettings.getSelectedLanguage());
		} else {
            selectedLanguage(browserLanguage);
        }
        // pre-creating computed elements to avoid having it multiple times on a page
        var key;
        for (key in strings) {
            if (strings.hasOwnProperty(key)) {
                strings[key].resource = ko.pureComputed(function() {
                    return strings[this.key][selectedLanguage()];
                }, { strings : strings, selectedLanguage : selectedLanguage, key: key} );
            }
        }
    };

    var toggleLanguage = function () {
        if (selectedLanguage() === 'de') {
            selectedLanguage('en');
        } else {
            selectedLanguage('de');
        }
        dukeconSettings.saveSelectedLanguage(selectedLanguage());
    };

    var getLanguageIconUrl = function() {
        return ko.pureComputed(function() {
            return 'img/' + selectedLanguage() + '.png';
        }, { selectedLanguage : selectedLanguage });
    };

    var getResource = function(resourceKey) {
        return strings[resourceKey] ?  strings[resourceKey].resource  : resourceKey;
    };

    return {
        selectedLanguage : selectedLanguage,
        strings : strings,
        init : init,
        toggleLanguage : toggleLanguage,
        getLanguageIconUrl : getLanguageIconUrl,
        getResource : getResource
    };
});