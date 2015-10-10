var languageUtils = {
    selectedLanguage : ko.observable(dukeconSettings.getSelectedLanguage()),

    strings: {
        // talks page
        filterOptions : {
            'de' : 'Filter-Optionen',
            'en' : 'Filter Options'
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
        },
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

(function (window, document) {

    var layout   = document.getElementById('layout'),
        menu     = document.getElementById('menu'),
        menuLink = document.getElementById('menuLink');

    function toggleClass(element, className) {
        var classes = element.className.split(/\s+/),
            length = classes.length,
            i = 0;

        for(; i < length; i++) {
          if (classes[i] === className) {
            classes.splice(i, 1);
            break;
          }
        }
        // The className is not found
        if (length === classes.length) {
            classes.push(className);
        }

        element.className = classes.join(' ');
    }

    if (menuLink) {
        menuLink.onclick = function (e) {
            var active = 'active';

            e.preventDefault();
            toggleClass(layout, active);
            toggleClass(menu, active);
            toggleClass(menuLink, active);
        };
    }

    languageUtils.setLanguageStrings();

}(this, this.document));
