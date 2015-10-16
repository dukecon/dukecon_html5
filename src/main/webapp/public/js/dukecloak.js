//TODO: fix this!

var keycloakUrl = 'rest/keycloak.json';
var dukecloak = {
    keycloakAuth : new Keycloak(keycloakUrl),

    auth : {
        username : ko.observable(""),
        loggedIn : ko.observable(false),
        loggedOut : ko.observable(true)
    },
    logout : function() {
        console.log('*** LOGOUT');
        dukecloak.auth.loggedIn(false);
        dukecloak.auth.loggedOut(true);
        dukecloak.auth.username("");
        dukecloak.auth.logoutUrl = dukecloak.keycloakAuth.authServerUrl + "/realms/" + dukecloak.keycloakAuth.realm + "/tokens/logout";
        console.log(dukecloak.auth.logoutUrl);
        window.location = dukecloak.auth.logoutUrl;
    },
    login : function() {
        console.log('*** LOGIN');
        var redirectUri = location.href + "rest/preferences";
        dukecloak.keycloakAuth.login({"redirectUri":redirectUri}).success(function () {
            console.log('*** LOGIN-success');
            dukecloak.auth.loggedIn(true);
            dukecloak.auth.loggedOut(false);
            console.log(dukecloak.keycloakAuth.hasRealmRole('user'));
            console.log(dukecloak.keycloakAuth.hasRealmRole('admin'));
            dukecloak.auth.logoutUrl = dukecloak.keycloakAuth.authServerUrl + "/realms/" + dukecloak.keycloakAuth.realm + "/tokens/logout";
        }).error(function () {
            console.log('*** LOGIN-error');
        });
    },
    init : function() {
        dukecloak.keycloakAuth.redirectUri = location.href + "rest/preferences";
        dukecloak.keycloakAuth.init({ onLoad: "check-sso" }).success(function (authenticated) {
            dukecloak.auth.loggedIn(authenticated);
            console.log('Authenticated: ' + authenticated);
            if(authenticated){
                dukecloak.keycloakAuth.loadUserProfile().success(function(profile){
                    dukecloak.auth.username = profile.username;
                    console.log(dukecloak.auth.username);
                    //TODO: load user data
                });
            }
        }).error(function () {
            console.log("Error initializing keycloak");
        });
        dukecloak.keycloakAuth.onAuthSuccess = function() { alert('onAuthSuccess'); };
        dukecloak.keycloakAuth.onAuthRefreshSuccess = function() { alert('onAuthRefreshSuccess'); };
    }
};

