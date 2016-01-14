// TODO: a work in progress

var keycloakUrl = "rest/keycloak.json";
var dukecloak = new function() {
    // Data
    var self = this;

    self.keycloakAuth = new Keycloak(keycloakUrl);

    self.auth = {
        username : ko.observable(""),
        loggedIn : ko.observable(false),
        loggedOut : ko.observable(true)
    };

    function saveTokens() {
        dukeconSettings.saveSetting('keycloak_token', dukecloak.keycloakAuth.token);
        dukeconSettings.saveSetting('keycloak_refreshToken', dukecloak.keycloakAuth.refreshToken);
        dukeconSettings.saveSetting('keycloak_idToken', dukecloak.keycloakAuth.idToken);
        dukeconSettings.saveSetting('keycloak_timeSkew', dukecloak.keycloakAuth.timeSkew);
    }

    function clearTokens() {
        dukeconSettings.clearSetting('keycloak_token');
        dukeconSettings.clearSetting('keycloak_refreshToken');
        dukeconSettings.clearSetting('keycloak_idToken');
        dukeconSettings.clearSetting('keycloak_timeSkew');
        dukeconSettings.clearSetting('keycloak_username');
    }

    self.loadUserData = function() {
        dukecloak.keycloakAuth.updateToken()
            .success(function() {
                var username = dukeconSettings.getSetting('keycloak_username');
                if (username) {
                    dukecloak.auth.username(username);
                } else {
                    dukecloak.keycloakAuth.loadUserProfile().success(function (profile) {
                        dukecloak.auth.username(profile.username);
                        dukeconSettings.saveSetting('keycloak_username', dukecloak.auth.username());
                        console.log("Logged in: " + dukecloak.auth.username());
                    });
                }
                dukeconSynch.pull();
            })
            .error(function() {
                /* load user data is quite close to the initial setup
                failling an update here might indicate the the saved tokens are no longer valid */
                clearTokens();
                console.log("Unable to update token");
            });
    };

    self.logout = function() {
        clearTokens();
        dukecloak.keycloakAuth.logout().success(function() {
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
        dukecloak.keycloakAuth.login().success(function () {
            dukecloak.auth.loggedIn(true);
            dukecloak.auth.loggedOut(false);
        }).error(function () {
            dukecloak.auth.loggedIn(false);
            dukecloak.auth.loggedOut(true);
        });
    };

    self.keycloakAuth.onAuthSuccess = function() {
        console.log("Auth Success!!");
        saveTokens();
    };

    self.keycloakAuth.onAuthRefreshSuccess = function() {
        console.log("Auth Refreshed!!");
        saveTokens();
    };

    self.keycloakAuth.onAuthLogout = function() {
        console.log("Logged out!!");
        clearTokens();
    };

    self.init = function(login) {
        if(dukecloakInitialized) {
            return;
        }

        dukecloak.keycloakAuth.timeSkew = dukeconSettings.getSetting('keycloak_timeSkew');

        dukecloak.keycloakAuth.init({
            onLoad: login ? "login-required" : "check-sso",
            token: dukeconSettings.getSetting('keycloak_token'),
            idToken: dukeconSettings.getSetting('keycloak_idToken'),
            refreshToken: dukeconSettings.getSetting('keycloak_refreshToken')
        }).success(function (authenticated) {
            dukecloakInitialized = true;
            dukecloak.auth.loggedIn(authenticated);
            dukecloak.auth.loggedOut(!authenticated);
            console.log('Authenticated: ' + authenticated);
            if (authenticated) {
                console.log('local time: ' + new Date().getTime() / 1000);
                console.log('iat: ' + dukecloak.keycloakAuth.tokenParsed.iat);
                console.log('diff: ' + (new Date().getTime() / 1000 - dukecloak.keycloakAuth.tokenParsed.iat));
                console.log('exp in: ' + (dukecloak.keycloakAuth.tokenParsed.exp - new Date().getTime() / 1000));
                console.log('isExpired: ' + dukecloak.keycloakAuth.isTokenExpired());
                dukecloak.loadUserData();
            }
        }).error(function () {
            console.log("Error initializing keycloak");
        });
    }
};

