define(['knockout', 'js/modules/languageutils', 'js/modules/offline', 'js/modules/dukecloak', 'js/modules/dukecon'], function(ko, languageUtils, dukeconTalkUtils, dukecloak, dukecon) {
    "use strict";

    //noinspection JSUnusedLocalSymbols
    ko.bindingHandlers['resource'] = {
        init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            return {'controlsDescendantBindings': true};
        },
        update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            ko.utils.setHtml(element, languageUtils.getResource(valueAccessor()));
        }
    };

    ko.bindingHandlers['attrResource'] = {
        init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            return {'controlsDescendantBindings': true};
        },
        update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            var keys = Object.keys(valueAccessor());
            var i, key;
            for (i = 0; i < keys.length; i++) {
                key = keys[i];
                element.setAttribute(key, languageUtils.getResource(valueAccessor()[key])());
            }
        }
    };

    ko.components.register('header-widget', {
        viewModel : function(params) {
            var me = this;
            me.active = params.value;
            me.icon = languageUtils.getLanguageIconUrl();
            me.toggleLanguage = languageUtils.toggleLanguage;
            me.homeTitle = ko.observable();
            me.homeUrl = ko.observable();

            dukeconTalkUtils.getData(function (allData) {
                me.homeTitle(allData.name);
                me.homeUrl(allData.homeUrl);
            });

            me.getCssClass = function(item) {
                return (item === me.active ? "mainmenu active dark reverseBack" : "mainmenu darkBack reverse");
            };

            this.toggleMenu = function() {
                var menu = document.getElementById('mainmenu-items');
                var veil = document.getElementById('menu-veil');
                if (menu && $('#mainmenu-button').is(':visible')) {
                    if (menu.className.indexOf("shown") < 0) {
                        menu.className += " shown";
                        veil.className = "shown";
                    } else {
                        menu.className = menu.className.replace(" shown", "");
						veil.className = "";
                    }
                }
            };
        },
        template:
            '<div class="header hidden">'
            + '<h1 id="headertitle" class="darkBack reverse">'
            + '	<a id="logo" href="index.html"><img src="img/logo_javaland.gif" title="javaland 2016"/></a>'
            + '	<span id="backbutton_before"></span><a id="backbutton" onclick="window.history.back();" data-bind="resource: \'backbutton\'"></a>'
            + ' <span id="pagetitle" data-bind="resource: active"></span>'
            + ' <div id="mainmenu-button" data-bind="click: toggleMenu"><img src="img/menu_24px.svg"></div>'
			+ ' <div id="menu-veil" data-bind="click: toggleMenu"></div>'
            + ' <div id="mainmenu-items" class="darkBack">'
            + '	  <a href="index.html" data-bind="resource: \'talks\', attr: {class: getCssClass(\'talks\')}"></a>'
            + '	  <a href="schedule.html" data-bind="resource: \'schedule\', attr: {class: \'hideOnMobile \' + getCssClass(\'schedule\')}"></a>'
            + '	  <a href="speakers.html" data-bind="resource: \'speaker\', attr: {class: getCssClass(\'speaker\')}"></a>'
            + '	  <a href="feedback.html" data-bind="resource: \'feedback\', attr: {class: getCssClass(\'feedback\')}"></a>'
            + '	  <a data-bind="visible: homeTitle, text: homeTitle, attr: { href: homeUrl}" target="_blank" class="mainmenu darkBack reverse"></a>'
            + '	  <a class="mainmenu darkBack reverse" id="language-select" data-bind="click: function() {toggleLanguage(); toggleMenu(); }, clickBubble: false"><img alt="Sprache umschalten / Change language" title="Sprache umschalten / Change language" data-bind="attr : { src : icon }"/>'
            + ' </div>'
            + '</h1>'
            + '</div>'
    });

    ko.components.register('login-widget', {
        viewModel : function(params) {
            this.hideLoginButton = params.allowLogin === false;
            this.dukecloak = dukecloak.dukecloak;
        },
        template:
            '<div id="login-area" class="hidden" data-bind="visible: dukecloak">'
            + '     <div>'
			+ '         <a class="button" data-bind="click: dukecloak.login, visible: !hideLoginButton && dukecloak.auth.loggedOut" name="login"><img alt="Sign in/Register" title="Sign in/Register" src="img/unlock_24px.svg"></a>'
			+ '         <a class="button" data-bind="click: dukecloak.logout, visible: !hideLoginButton && dukecloak.auth.loggedIn" name="logout"><img alt="Sign Out" title="Sign Out" src="img/lock_24px.svg"></a>'
            + '         <a href="#" class="username" data-bind="text: dukecloak.auth.username, click: dukecloak.keycloakAuth.accountManagement, visible: dukecloak.auth.loggedIn && dukecloak.auth.username"></a>'
            + '         <a href="#" class="username" data-bind="resource: \'loggedIn\', visible: dukecloak.auth.loggedIn() && !dukecloak.auth.username()"></a>'
            + '         <a href="#" class="gravatar" data-bind="click: dukecloak.keycloakAuth.accountManagement, visible: dukecloak.auth.loggedIn && dukecloak.auth.username"><img data-bind="attr: {src: dukecloak.auth.gravatar}, visible: !hideLoginButton && dukecloak.auth.loggedIn"/></a>'
            + '     </div>'
            + '</div>'
    });

    ko.components.register('search-widget', {
        viewModel : function(params) {
            this.searchTerm = params.searchTerm;
        },
        template:
            '<div id="search-area" class="hidden">\n'
            + '   <input class="quicksearch" type="search" data-bind="textInput: searchTerm, attrResource: {\'placeholder\' : \'search\'}"/>\n'
            + '   <img src="img/search.png">\n'
            + '</div>\n'
    });

    ko.components.register('footer-widget', {
        viewModel : function() {
            var links = {  // temporarily hard-wired, until returned somehow from backend
				imprint : {
					'de' : 'https://www.javaland.eu/de/impressum/',
					'en' : 'https://www.javaland.eu/en/imprint/'
				},
				termsOfUse : {
					'de' : 'https://www.javaland.eu/de/nutzungsbedingungen/',
					'en' : 'https://www.javaland.eu/en/term-of-use/'
				},
				privacy : {
					'de' : 'https://www.javaland.eu/de/datenschutz/',
					'en' : 'https://www.javaland.eu/en/privacy/'
				}
			};
            var me = this;
	
			me.updateCheck = dukeconTalkUtils.updateCheck;
	
			me.imprintLink = ko.observable(links.imprint[languageUtils.selectedLanguage()]);
            me.privacyLink = ko.observable(links.privacy[languageUtils.selectedLanguage()]);
            me.termsLink = ko.observable(links.termsOfUse[languageUtils.selectedLanguage()]);

            languageUtils.selectedLanguage.subscribe(function(newLanguage) {
				me.imprintLink(links.imprint[newLanguage]);
				me.privacyLink(links.privacy[newLanguage]);
				me.termsLink(links.termsOfUse[newLanguage]);
            });
        },
        template:
            '<div class="footer hidden">'
            + '<div id="update-info">'
            + '<span data-bind="visible: updateCheck" style="margin-left:5px;">Checking for update...</span>'
            + '</div>'
            + '<a target="_blank" data-bind="resource: \'imprint\', attr: { href: imprintLink}"></a> '
            + '<a target="_blank" data-bind="resource: \'privacy\', visible: privacyLink(), attr: { href: privacyLink}"></a> '
            + '<a target="_blank" data-bind="resource: \'termsOfUse\', visible: termsLink(), attr: { href: termsLink}"></a> '
            + '<span>powered by<a href="http://www.dukecon.org" target="_blank">DukeCon</a></span>'
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
            '<div id="alert-window" class="dark">'
            + '   <div class="alert-title darkBack reverse" data-bind="resource : resourceTitle"></div>'
            + '   <div class="alert-body" data-bind="resource : resourceBody"></div>'
            + '   <div class="alert-button">'
            + '      <button data-bind="click: function() { hide(); }">OK</button>'
            + '   </div>'
            + '</div>'
    });

    ko.components.register('talk-widget', {
        viewModel: function(data) {
            var me = this;
            me.talk = data.value;
            me.isOtherTalk = data.isOtherTalk;
            me.toggleFavourite = dukecon.toggleFavourite;
            me.checkMustReload = function() {
              if (me.isOtherTalk) {
                  window.location.href = "talk.html#talk?talkId=" + me.talk.id;
                  window.location.reload();
              }
            };
        },
        template:
            '<!-- ko if: talk && talk.title -->'
            + '<div data-bind="attr : {class: \'talk-cell \' + talk.timeCategory}, click : function() {window.location.href=\'talk.html#talk?talkId=\' + talk.id; }">'
            + '<div class="fav-smallscreen" data-bind="click: toggleFavourite, clickBubble: false"><img style="cursor:pointer; margin-right: 2px;" alt="Favorit +-" title="Favorit +-"  data-bind="attr:{src: talk.favicon}"/></div>'
            + '<div class="talk-info">'
            + ' <div class="title darkLink">'
            + ' <img class="fav-largescreen" style="cursor:pointer; margin-right: 2px;" ' +
            '       alt="Favorit +-" title="Favorit +-" data-bind="click: toggleFavourite, clickBubble: false, attr:{src: talk.favicon}"/>'
            + ' <a style="padding: 0" data-bind="html: talk.title, attr : { href : \'talk.html#talk?talkId=\' + talk.id, title: talk.title }, click: checkMustReload"></a>'
            + ' <img class="language-icon" src="" data-bind="attr: {src: talk.languageIcon, alt: talk.languageDisplay}, css: {\'no-speaker\': !talk.speakerString}">'
            + ' </div>'
            + ' <div style="display:none;" class="fully-booked stamp" data-bind="resource: \'fullyBooked\', visible: talk.fullyBooked"></div>'
            + ' <div style="display:none;" class="very-popular stamp" data-bind="resource: \'veryPopular\', visible: talk.veryPopular() && !talk.fullyBooked()"></div>'
            + ' <div class="speaker"><span data-bind="text: talk.speakerString" /></div>'
            + ' <div data-bind="attr: {class: talk.timeClass}">'
            + ' <img width="16px" height="16px" src="img/Clock.png" alt="Startzeit" title="Startzeit"/>'
            + '  <span class="day-long" data-bind="text: talk.day"></span>'
            + ' <span class="day-short" data-bind="text: talk.dayshort"></span><span>,&nbsp;</span>'
            + ' <span data-bind="text: talk.startDisplayed"></span> <span>(</span><span data-bind="text: talk.duration"></span><span> min)</span>'
            + ' </div>'
            + ' <div class="room"><img width="16px" height="16px" src="img/Home.png" alt="at" title="Location"/> '
            + ' <span data-bind="text: talk.locationDisplay" /> '
            + '<!-- ko if: talk.locationCapacity -->'
            + '<span>(</span><span data-bind="text: talk.locationCapacity"></span><span>)</span>'
            + '<!-- /ko -->'
            + ' </div>'
            + ' <div class="track" data-bind="visible: talk.isTrackVisible"><img width="16px" height="16px" data-bind="attr: {src: talk.talkIcon }" alt="Track" title="Track"/> <span data-bind="text: talk.trackDisplay" /></div>'
            + ' </div>'
            + '</div>'
            + '<!-- /ko -->'
    });
    
    ko.components.register('speaker-widget', {
        viewModel: function(data) {
            var me = this;
            me.speaker = data.value;
            me.parentTalkId = data.parentTalkId;
			me.socialmedias = ko.observable(["facebook", "googleplus", "instagram", "linkedin", "pinterest", "twitterLink", "xing", "youtube"]);
        },
        template:
            '<div class="speaker-content">' +
            '	<div class="speaker-overview">' +
            '		<div class="flexbox">' +
            '			<div class="speaker-portrait">' +
            '				<img alt="" src="" data-bind="attr : { src : speaker.image }">' +
            '			</div>' +
            '			<div class="speaker-contact">' +
            '				<h2 class="darkLink" data-bind="text: speaker.name">' +
            '				</h2>' +
            '				<div class="speaker-function">' +
            '					<div data-bind="text: speaker.function, visible: speaker.function">Function</div>' +
            '					<div data-bind="text: speaker.company, visible: speaker.company">Company</div>' +
            '				</div>' +
            '				<table>' +
            '					<tr data-bind="visible: speaker.email">' +
            '						<th>E-Mail:</th>' +
            '						<td><a data-bind="text: speaker.email, attr: { href: \'mailto:\' + speaker.email }"></a></td>' +
            '					</tr>' +
            '					<tr data-bind="visible: speaker.web">' +
            '						<th>Web:</th>' +
            '						<td><a target="_blank" data-bind="text: speaker.web, attr: { href: speaker.web }"></a></td>' +
            '					</tr>' +
            '					<tr data-bind="visible: speaker.blog">' +
            '						<th>Blog:</th>' +
            '						<td><a target="_blank" data-bind="text: speaker.blog, attr: { href: speaker.blog }"></a></td>' +
            '					</tr>' +
            '				</table>' +
            '				<div class="speaker-socialmedia">' +
            '					<!-- ko foreach: socialmedias -->' +
            '					<span data-bind="visible: $parent.speaker[$data], attr: { class: \'speaker-\' + $data}">' +
            '                            <a target="_blank" href="" data-bind="attr: { href: $parent.speaker[$data]}">' +
            '                                <img src="" data-bind="attr: {src: \'img/social_\' + $data + \'.svg\', alt: $data}">' +
            '                            </a>' +
            '                        </span>' +
            '					<!-- /ko -->' +
            '				</div>' +
            '			</div>' +
            '		</div>' +
            '		<div id="speaker-bio" data-bind="text: speaker.bio">' +
            '		</div>' +
            '	</div>' +
            '	<div class="speaker-talks">' +
            '		<h2 data-bind="resource: parentTalkId ? \'other_speakertalks\' : \'speakertalks\'"></h2>' +
            '        <div data-bind="resource: \'none\', visible: parentTalkId && speaker.talks && speaker.talks.length <= 1"></div>'+
            '		<!-- ko foreach: speaker.talks -->' +
			'		    <!-- ko if: id !== $parent.parentTalkId -->' +
            '		    <div class="talk-widget" data-bind="component: { name: \'talk-widget\', params: { value: $data, isOtherTalk: true } }"></div>' +
			'		    <!-- /ko -->' +
			'		<!-- /ko -->' +
            '	</div>' +
            '</div>'
	});
});
