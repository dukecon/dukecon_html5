define(['knockout', 'js/modules/languageutils', 'js/modules/offline', 'js/modules/dukecloak', 'js/modules/dukecon'], function(ko, languageUtils, dukeconTalkUtils, dukecloak, dukecon) {
    ko.bindingHandlers['resource'] = {
        init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            return {'controlsDescendantBindings': true};
        },
        update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            ko.utils.setHtml(element, languageUtils.getResource(valueAccessor()));
        }
    };

    ko.components.register('header-widget', {
        viewModel : function(params) {
            this.active = params.value;
            this.icon = languageUtils.getLanguageIconUrl();
            this.toggleLanguage = languageUtils.toggleLanguage;
            this.getCssClass = function(item) {
                return (item === this.active ? "mainmenu active" : "mainmenu inactive");
            };
            this.toggleMenu = function() {
                var menu = document.getElementById('mainmenu-items');
                if (menu && $('#mainmenu-button').is(':visible')) {
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
            + '	<a id="logo" href="index.html"><img src="img/logo_jfs.png" alt="Java Forum Stutgart 2016" title="Java Forum Stutgart 2016"/></a>'
            + '	<span id="backbutton_before"></span><a id="backbutton" onclick="window.history.back();" data-bind="resource: \'backbutton\'"></a>'
            + ' <span id="pagetitle" data-bind="resource: active"></span>'
            + ' <div id="mainmenu-button" data-bind="click: toggleMenu"><img src="img/menu_24px.svg"></div>'
            + ' <div id="mainmenu-items">'
            + '	 <a href="index.html" data-bind="resource: \'talks\', attr: {class: getCssClass(\'talks\')}"></a>'
            + '	 <a href="speakers.html" data-bind="resource: \'speaker\', attr: {class: getCssClass(\'speaker\')}"></a>'
            + '	 <a href="feedback.html" data-bind="resource: \'feedback\', attr: {class: getCssClass(\'feedback\')}"></a>'
            + '	 <a href="http://www.javaland.eu" target="new" class="mainmenu inactive">Javaland Home</a>'
            + '	 <a class="mainmenu" id="language-select" data-bind="click: function() {toggleLanguage(); toggleMenu(); }"><img alt="Sprache umschalten / Change language" title="Sprache umschalten / Change language" data-bind="attr : { src : icon }"/>'
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
            '<div id="login-area" data-bind="visible: dukecloak">'
            + '     <div>'
            + '         <a href="#" class="username" data-bind="text: dukecloak.auth.username, click: dukecloak.keycloakAuth.accountManagement, visible: dukecloak.auth.loggedIn && dukecloak.auth.username"></a>'
            + '         <a href="#" class="gravatar" data-bind="click: dukecloak.keycloakAuth.accountManagement, visible: dukecloak.auth.loggedIn && dukecloak.auth.username"><img data-bind="attr: {src: dukecloak.auth.gravatar}, visible: !hideLoginButton && dukecloak.auth.loggedIn"/></a>'
            + '         <a class="button" data-bind="click: dukecloak.login, visible: !hideLoginButton && dukecloak.auth.loggedOut" name="login"><img alt="Sign in/Register" title="Sign in/Register" src="img/unlock_24px.svg"></a>'
            + '         <a class="button" data-bind="click: dukecloak.logout, visible: !hideLoginButton && dukecloak.auth.loggedIn" name="logout"><img alt="Sign Out" title="Sign Out" src="img/lock_24px.svg"></a>'
            + '     </div>'
            + '</div>'
    });

    ko.components.register('footer-widget', {
        viewModel : function() {
            this.updateCheck = dukeconTalkUtils.updateCheck;
        },
        template:
            '<div class="footer">'
            + '<div id="#update-info">'
            + '<span data-bind="visible: updateCheck" style="margin-left:5px;">Checking for update...</span>'
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
            this.toggleFavourite = dukecon.toggleFavourite;
        },
        template:
            '<div data-bind="attr : {class: \'talk-cell \' + talk.timeCategory}">'
            + '<div class="fav-smallscreen" data-bind="click: toggleFavourite"><img style="cursor:pointer; margin-right: 2px;" title="Add to Favourites" data-bind="attr:{src: talk.favicon}"/></div>'
            + '<div class="talk-info">'
            + ' <div class="title">'
            + ' <img class="fav-largescreen" style="cursor:pointer; margin-right: 2px;" title="Add to Favourites" data-bind="click: toggleFavourite, attr:{src: talk.favicon}"/>'
            + ' <a style="padding: 0" data-bind="text: talk.title, attr : { href : \'talk.html#talk?talkId=\' + talk.id }"></a>'
            + ' </div>'
            + ' <div class="speaker" data-bind="click : function() {window.location.href=\'talk.html#talk?talkId=\' + talk.id; }"><span data-bind="text: talk.speakerString" /></div>'
            + ' <div data-bind="attr: {class: talk.timeClass}, click : function() {window.location.href=\'talk.html#talk?talkId=\' + talk.id; }">'
            + ' <img width="16px" height="16px" src="img/Clock.png" alt="Startzeit" title="Startzeit"/>'
            + '  <span class="day-long" data-bind="text: talk.day"></span>'
            + ' <span class="day-short" data-bind="text: talk.dayshort"></span><span>,&nbsp;</span>'
            + ' <span data-bind="text: talk.startDisplayed"></span> (<span data-bind="text: talk.duration"></span><span> min)</span>'
            + ' </div>'
            + ' <div class="room" data-bind="click : function() {window.location.href=\'talk.html#talk?talkId=\' + talk.id; }"><img width="16px" height="16px" src="img/Home.png" alt="Location" title="Location"/> <span data-bind="text: talk.locationDisplay" /></div>'
            + ' <div class="track" data-bind="visible: talk.isTrackVisible, click : function() {window.location.href=\'talk.html#talk?talkId=\' + talk.id; }"><img width="16px" height="16px" data-bind="attr: {src: talk.talkIcon }" alt="Track" title="Track"/> <span data-bind="text: talk.trackDisplay" /></div>'
            + ' </div>'
            + '</div>'
    });
});
