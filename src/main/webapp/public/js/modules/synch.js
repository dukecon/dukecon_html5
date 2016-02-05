define(['jquery', 'underscore', 'js/modules/dukeconsettings'], function($, _, dukeconsettings) {
    var setToken = function(token) {
        return function(request) {
            request.setRequestHeader("Authorization", 'Bearer ' + token);
        };
    };

    var push = function(token, updateTokenFunction) {
        //if (!dukecloak.keycloakAuth.authenticated) {
          //  return;
        //}
        var favourites = _.map(dukeconsettings.getFavourites(), function (fav) {
            return {"eventId": fav, "version": "1"};
        });
        updateTokenFunction()
            .success(function () {
                $.ajax({
                    method: 'POST',
                    beforeSend: setToken,
                    contentType: "application/json",
                    data: JSON.stringify(favourites),
                    url: "rest/preferences",
                    success: function () {
                        console.log("Pushed favourites to server");
                    },
                    error: function () {
                        console.log("Error pushing favourites to server");
                    }
                });
            })
            .error(function () {
                console.log("Error!");
            });
    };

    var pull = function (token, updateTokenFunction) {
        $.ajax({
            method: 'GET',
            beforeSend: setToken,
            dataType: "json",
            url: "rest/preferences",
            success: function (data) {
                console.log("Pulling favourites from server");
                var favouritesFromServer = _.map(data, function (fav) {
                    return fav.eventId;
                });
                var localFavourites = dukeconsettings.getFavourites();
                if (_.difference(localFavourites, favouritesFromServer).length > 0 || _.difference(favouritesFromServer, localFavourites).length > 0) {
                    var previouslyOffline = dukeconsettings.getSetting(dukeconsettings.keys.previously_offline);
                    console.log("Taking local favourites: " + previouslyOffline);
                    dukeconsettings.saveSetting(dukeconsettings.keys.fav_key, previouslyOffline ? localFavourites : _.union(favouritesFromServer, localFavourites));
                    push(token, updateTokenFunction);
                    if (dukeconTalklistModel) {
                        dukeconTalklistModel.updateFavourites();
                    }
                }
            },
            error: function () {
                console.log("Error loading preferences");
            }
        });
    };

    return {
        push : push,
        pull : pull
    }
});