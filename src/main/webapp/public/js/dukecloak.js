// TODO: a work in progress

var keycloakUrl = "rest/keycloak.json";
var redirectUri = location.href;
var dukecloak = new function() {
    // Data
    var self = this;

    self.keycloakAuth = new Keycloak(keycloakUrl);

    self.auth = {
        username : ko.observable(""),
        loggedIn : ko.observable(false),
        loggedOut : ko.observable(true)
    };

    self.loadUserData = function() {
		dukecloak.keycloakAuth.loadUserProfile().success(function(profile){
			dukecloak.auth.username(profile.username);
			console.log("Logged in: " + dukecloak.auth.username());
            dukecloak.keycloakAuth.updateToken()
                .success(function() {
                    dukeconSynch.pull();
                })
                .error(function() { console.log("Unable to update token");});
		});
    };

    self.logout = function() {
        dukecloak.keycloakAuth.logout({"redirectUri":redirectUri}).success(function() {
			dukecloak.auth.loggedIn(false);
			dukecloak.auth.loggedOut(true);
			dukecloak.auth.username("");
        }).error(function() {
			console.log("WTF");
        });
    };

    var dukecloakInitialized = false;

    self.login = function() {
        if(!dukecloakInitialized) {
            self.init(true);
            return;
        }
        dukecloak.keycloakAuth.login({"redirectUri":redirectUri}).success(function () {
            dukecloak.auth.loggedIn(true);
            dukecloak.auth.loggedOut(false);
        }).error(function () {
            dukecloak.auth.loggedIn(false);
            dukecloak.auth.loggedOut(true);
        });
    };

    self.init = function(login) {
        if(dukecloakInitialized) {
            return;
        }
        dukecloak.keycloakAuth.redirectUri = location.href;
        dukecloak.keycloakAuth.init({ onLoad: login ? "login-required" : "check-sso" }).success(function (authenticated) {
            dukecloakInitialized = true;
            dukecloak.auth.loggedIn(authenticated);
            dukecloak.auth.loggedOut(!authenticated);
            console.log('Authenticated: ' + authenticated);
            if (authenticated){
                console.log('local time: ' + new Date().getTime()/1000);
                console.log('iat: ' + dukecloak.keycloakAuth.tokenParsed.iat);
                console.log('diff: ' + (new Date().getTime()/1000 - dukecloak.keycloakAuth.tokenParsed.iat));
                console.log('exp in: ' + (dukecloak.keycloakAuth.tokenParsed.exp - new Date().getTime()/1000));
                console.log('isExpired: ' + dukecloak.keycloakAuth.isTokenExpired());
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

