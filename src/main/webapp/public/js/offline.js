// Check if a new cache is available on page load.
window.addEventListener('load', function(e) {
    window.applicationCache.addEventListener('updateready', function(e) {
        var doPageReload = dukeconSettings.getSetting(dukeconSettings.offline);
        setOfflineStatus(false);
        if (window.applicationCache.status == window.applicationCache.UPDATEREADY) {
            console.log("Loading new version of page");
            // Browser downloaded a new app cache.
            // Swap it in and reload the page to get the new hotness.
            window.applicationCache.swapCache();
            window.location.reload();
        }
        else if (doPageReload) {
            console.log ("Back online - reload page in case there is new data");
            window.location.reload();
        }
        else {
            console.log ("The manifest did not change!");
        }
    }, false);
    window.applicationCache.addEventListener("error", function(e) {
       setOfflineStatus(true);
    });
    window.applicationCache.addEventListener("cached", function(e) {
        setOfflineStatus(false);
    });
    window.applicationCache.addEventListener("noupdate", function(e) {
        setOfflineStatus(false);
    });
}, false);

function setOfflineStatus(offline) {
    if (offline) {
        console.log("We are offline");
        dukeconSettings.saveSetting(dukeconSettings.offline, true);
        dukeconSettings.saveSetting(dukeconSettings.previously_offline, false);
    }
    else {
        console.log("We are online - starting timer to check for updates");
        dukeconSettings.saveSetting(dukeconSettings.previously_offline, dukeconSettings.getSetting(dukeconSettings.offline));
        dukeconSettings.saveSetting(dukeconSettings.offline, false);
        dukeconTalkUtils.checkNewDataOnServer();
        setInterval(function() {
            dukeconTalkUtils.checkNewDataOnServer();
        }, 300000);
        if(typeof dukecloak !== 'undefined') {
            dukecloak.nowOnline();
        }
    }
}

var dukeconTalkUtils = {
    updateCheck : ko.observable(false),

    getData : function(url, callback) {
        var offline = dukeconSettings.getSetting(dukeconSettings.offline);
        var dataHash = dukeconSettings.getSetting(dukeconSettings.last_updated_hash);
        if (!offline && !dataHash) {
            dukeconTalkUtils.getDataFromServer(url, callback);
        }
        else {
            dukeconDb.get(dukeconDb.talk_store, function(data) {
                if (data) {
                    callback(data);
                }
                else if (!offline) {
                    dukeconTalkUtils.getDataFromServer(url, callback);
                }
            });
        }
    },

    checkNewDataOnServer : function() {
        dukeconTalkUtils.updateCheck(true);
        console.log('Check for new data on server');
        var oldCacheHash = dukeconSettings.getSetting(dukeconSettings.last_updated_hash);
        //var oldCacheHash = Math.random().toString(36).slice(2);

        var successCallback = function(data, status, xhr) {
            if (data) {
                console.log("New Data on server; replacing old data in store");
                dukeconDb.save(dukeconDb.talk_store, data);
                dukeconSettings.saveSetting(dukeconSettings.last_updated_hash, xhr.getResponseHeader("ETag"));
            }
            dukeconTalkUtils.updateCheck(false);
        };
        dukeconTalkUtils.doServerRequest(jsonUrl, successCallback, function(error) {
            console.log('No connection to server');
            dukeconTalkUtils.updateCheck(false);
        }, { "If-None-Match": oldCacheHash });
    },

    getDataFromServer : function(url, callback) {
        console.log("Retrieving data from server");
        var successCallback = function(data, status, xhr) {
            if (data) {
                dukeconDb.save(dukeconDb.talk_store, data);
                dukeconSettings.saveSetting(dukeconSettings.last_updated_hash, xhr.getResponseHeader("ETag"));
                callback(data);
            }
        };
        var errorCallback = function() {
            console.log('No connection to server, retrieving data from local storage');
            dukeconDb.get(dukeconDb.talk_store, function(data) {
                if (data) {
                    callback(data);
                }
                else {
                    console.log('Could not retrieve any data');
                }
            });
        };
        dukeconTalkUtils.doServerRequest(url, successCallback, errorCallback);
    },

    doServerRequest : function(url, successCallback, errorCallback, headers) {
        $.ajax({
            method: 'GET',
            dataType: "json",
            headers: headers,
            url: url,
            success: successCallback,
            error: errorCallback
        });
    }
};

var dukeconSettings = {
    fav_key : "dukeconfavs",
    filter_key_prefix : "dukeconfilters_",
    filter_active_key : "dukeconfilters_active",
    favs_active : "dukeconfavs_active",
    selected_language_key : "dukecon_language",
    day_key : "dukeconday",
    last_updated_hash : "dukecon_last_updated_hash",
    offline : "dukecon_offline",
    previously_offline : "dukecon_previously_offline",

    // strip the file name from the URL to get the context (i.e. '/latest/speakers.html' -> '/latest')
    // so that all pages of the app use the same context
    context : window.location.pathname.substring(0, window.location.pathname.lastIndexOf("/")),

    getFavourites : function() {
        return dukeconSettings.getSettingOrEmptyArray(dukeconSettings.fav_key);
    },

    getSavedFilters : function(filters) {
        var savedFilters = {};
        _.each(filters, function(filter) {
            savedFilters[filter.filterKey] = dukeconSettings.getSettingOrEmptyArray(dukeconSettings.filter_key_prefix + filter.filterKey);
        });
        return savedFilters;
    },

    getSelectedDay : function() {
        var day = dukeconSettings.getSetting(dukeconSettings.day_key);
        return day ? day : "0";
    },

    getSelectedLanguage : function() {
        var language = dukeconSettings.getSetting(dukeconSettings.selected_language_key);
        return language ? language : "de";
    },

    isFavourite : function(id) {
        return dukeconSettings.getFavourites().indexOf(id) != -1;
    },

    filtersActive : function() {
        var result = dukeconSettings.getSetting(dukeconSettings.filter_active_key);
        return result == null ? true : result;
    },

    favoritesActive : function() {
        var result = dukeconSettings.getSetting(dukeconSettings.favs_active);
        return result == null ? false : result;
    },

    toggleFavourite : function(id) {
        var favourites = dukeconSettings.getFavourites();
        var pos = favourites.indexOf(id);
        if (pos === -1) {
            favourites.push(id);
        }
        else {
            favourites.splice(pos, 1);
        }
        dukeconSettings.saveSetting(dukeconSettings.fav_key, favourites);
    },

    saveSelectedFilters : function(filters) {
        _.each(filters, function(filter) {
            var selected = _.map(
                _.filter(filter.filtervalues(), function(val) { return val.selected(); }),
                function(filterValue) { return filterValue.id; });
            dukeconSettings.saveSetting(dukeconSettings.filter_key_prefix + filter.filterKey, selected);
        });
    },

    saveSelectedDay : function(day_index) {
        dukeconSettings.saveSetting(dukeconSettings.day_key, day_index);
    },

    saveSelectedLanguage : function(language) {
        dukeconSettings.saveSetting(dukeconSettings.selected_language_key, language);
    },

    getSettingOrEmptyArray : function(settingKey) {
        var setting = dukeconSettings.getSetting(settingKey);
        return setting ? setting : [];
    },

    getSetting : function(settingKey) {
        if (localStorage) {
            var setting = localStorage.getItem(dukeconSettings.context + settingKey);
            //console.log("Load: " + settingKey + " -> " + setting);
            return setting ? JSON.parse(setting) : null;
        }
        return null;
    },

    saveSetting : function(settingKey, value) {
        if (localStorage) {
            //console.log("Save: " + settingKey + " -> " + JSON.stringify(value));
            localStorage.setItem(dukeconSettings.context + settingKey, JSON.stringify(value));
        }
    },

    clearSetting : function(settingKey) {
        if (localStorage) {
            //console.log("Clear: " + settingKey));
            localStorage.removeItem(dukeconSettings.context + settingKey);
        }
    }

};

var dukeconSynch = {
    setToken : function(request) {
        request.setRequestHeader("Authorization", 'Bearer ' + dukecloak.keycloakAuth.token);
    },

    push : function() {
        if (!dukecloak.keycloakAuth.authenticated) {
            return;
        }
        var favourites = _.map(dukeconSettings.getFavourites(), function(fav) {
            return {"eventId" : fav, "version" : "1"};
        });
        dukecloak.keycloakAuth.updateToken()
            .success(function() {
                $.ajax({
                    method: 'POST',
                    beforeSend: dukeconSynch.setToken,
                    contentType : "application/json",
                    data : JSON.stringify(favourites),
                    url: "rest/preferences",
                    success: function() {
                        console.log("Pushed favourites to server");
                    },
                    error: function() {
                        console.log("Error pushing favourites to server");
                    }
                });
            })
            .error(function() {
                console.log("Error!");
            });
    },

    pull : function() {
        $.ajax({
            method: 'GET',
            beforeSend: dukeconSynch.setToken,
            dataType: "json",
            url:"rest/preferences",
            success: function(data) {
                console.log("Pulling favourites from server");
                var favouritesFromServer = _.map(data, function(fav) {
                    return fav.eventId;
                });
                var localFavourites = dukeconSettings.getFavourites();
                if (_.difference(localFavourites, favouritesFromServer).length > 0 || _.difference(favouritesFromServer, localFavourites).length > 0) {
                    var previouslyOffline = dukeconSettings.getSetting(dukeconSettings.previously_offline);
                    console.log("Taking local favourites: " + previouslyOffline);
                    dukeconSettings.saveSetting(dukeconSettings.fav_key, previouslyOffline ? localFavourites : _.union(favouritesFromServer, localFavourites));
                    dukeconSynch.push();
                    if (dukeconTalklistModel) {
                        dukeconTalklistModel.updateFavourites();
                    }
                }
            },
            error: function() { console.log("Error loading preferences");}
        });
    }
};