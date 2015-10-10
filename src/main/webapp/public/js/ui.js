var languageUtils = {
    selectedLanguage : ko.observable('de'),

    strings: {
        filterOptions : {
            'de' : 'Filter-Optionen',
            'en' : 'Filter Options'
        },
        reset : {
            'de' : 'Zurücksetzen',
            'en' : 'Reset'
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
        }
    },

    toggleLanguage : function () {
        var languageImg = $('#language-select img');
        if (languageUtils.selectedLanguage() === 'de') {
            languageUtils.selectedLanguage('en');
            languageImg.attr('src', 'img/en.png');
        } else {
            languageUtils.selectedLanguage('de');
            languageImg.attr('src', 'img/de.png');
        }
        languageUtils.setLanguageStrings();
    },

    setLanguageStrings : function() {
        $.each($('[data-resource]'), function(index, elem) {
            var node = $(elem),
                resourceKey = node.attr('data-resource');
            if (typeof languageUtils.strings[resourceKey] !== 'undefined') {
                node.text(languageUtils.strings[resourceKey][languageUtils.selectedLanguage()]);
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

    menuLink.onclick = function (e) {
        var active = 'active';

        e.preventDefault();
        toggleClass(layout, active);
        toggleClass(menu, active);
        toggleClass(menuLink, active);
    };

    languageUtils.setLanguageStrings();

}(this, this.document));
