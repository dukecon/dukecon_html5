// TODO: a work in progress

var keycloakUrl = "rest/keycloak.json";
var preferencesUrl = "rest/preferences";
var redirectUri = location.href;
var dukecloak = {
    keycloakAuth : new Keycloak(keycloakUrl),

    auth : {
        username : ko.observable(""),
        loggedIn : ko.observable(false),
        loggedOut : ko.observable(true)
    },

    loadUserData : function() {
		dukecloak.keycloakAuth.loadUserProfile().success(function(profile){
			dukecloak.auth.username(profile.username);
			console.log("Logged in: " + dukecloak.auth.username());
            $.ajax({
                method: 'GET',
                dataType: "json",
                url: preferencesUrl,
                success: function(data) {
                    console.log("Loaded preferences");
                    var favourites = _.map(data, function(fav) {
                        return fav.eventId;
                    });
                    dukeconSettings.saveSetting(dukeconSettings.fav_key, favourites);
                    window.location.reload();
                },
                error: function() { console.log("Error loading preferences");}
            });
		});
    },

    logout : function() {
        dukecloak.keycloakAuth.logout({"redirectUri":redirectUri}).success(function() {
			dukecloak.auth.loggedIn(false);
			dukecloak.auth.loggedOut(true);
			dukecloak.auth.username("");
        }).error(function() {
			console.log("WTF");
        });
    },
    login : function() {
        dukecloak.keycloakAuth.login({"redirectUri":redirectUri}).success(function () {
            dukecloak.auth.loggedIn(true);
            dukecloak.auth.loggedOut(false);
        }).error(function () {
            dukecloak.auth.loggedIn(false);
            dukecloak.auth.loggedOut(true);
        });
    },
    init : function() {
        dukecloak.keycloakAuth.redirectUri = location.href;
        dukecloak.keycloakAuth.init({ onLoad: "check-sso" }).success(function (authenticated) {
            dukecloak.auth.loggedIn(authenticated);
            dukecloak.auth.loggedOut(!authenticated);
            console.log('Authenticated: ' + authenticated);
            if (authenticated){
            	dukecloak.loadUserData();
	        } else {
				if (redirectUri.indexOf('?') >= 0) {
			        location.href = redirectUri.split("?")[0]; // TODO: URL contains a huge querystring after returning from KC, how to keep this from happening?
				}
            }
        }).error(function () {
            console.log("Error initializing keycloak");
        });
        dukecloak.keycloakAuth.onAuthSuccess = function() { console.log("Auth Success!!"); };
        dukecloak.keycloakAuth.onAuthRefreshSuccess = function() { console.log("Authenticated!!"); };
    }
};

