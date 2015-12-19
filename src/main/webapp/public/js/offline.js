// Check if a new cache is available on page load.
window.addEventListener('load', function(e) {
    window.applicationCache.addEventListener('updateready', function(e) {
        var doPageReload = setOfflineStatus(false);
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
    window.applicationCache.addEventListener("noupdate", function(e) {
        setOfflineStatus(false);
    });
}, false);

function setOfflineStatus(offline) {
    var doPageReload = false;
    if (offline) {
        console.log("We are offline");
        dukeconSettings.saveSetting(dukeconSettings.offline, true);
    }
    else {
        console.log("We are online - starting timer to check for updates");
        doPageReload = dukeconSettings.getSetting(dukeconSettings.offline);
        dukeconSettings.saveSetting(dukeconSettings.offline, false);
        dukeconTalkUtils.checkNewDataOnServer();
        setInterval(function() {
            dukeconTalkUtils.checkNewDataOnServer();
        }, 300000);
    }
    return doPageReload;
}

var dukeconTalkUtils = {
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
        console.log('Check for new data on server');
        var successCallback = function(data, status, xhr) {
            var newCacheHash = xhr.getResponseHeader("ETag");
            //var newCacheHash = Math.random().toString(36).slice(2);
            var oldCacheHash = dukeconSettings.getSetting(dukeconSettings.last_updated_hash);
            if (newCacheHash != oldCacheHash) {
                console.log("New Data on server; replacing old data in store");
                dukeconDb.save(dukeconDb.talk_store, data);
                dukeconSettings.saveSetting(dukeconSettings.last_updated_hash, xhr.getResponseHeader("ETag"));
            }
        };
        dukeconTalkUtils.doServerRequest(jsonUrl, successCallback, function(error) {
            console.log('No connection to server');
        });
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

    doServerRequest : function(url, successCallback, errorCallback) {
        $.ajax({
            method: 'GET',
            dataType: "json",
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

    context : window.location.pathame,

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

    toggleFavourite : function(talkObject) {
        var id = talkObject.talk.id;
        var favourites = dukeconSettings.getFavourites();
        var pos = favourites.indexOf(id);
        if (pos === -1) {
            favourites.push(id);
        }
        else {
            favourites.splice(pos, 1);
        }
        talkObject.talk.toggleFavourite();
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

var dukeconDb = {
    db_name : 'dukecon',
    talk_store : 'talks',
    indexedDB : window.indexedDB || window.webkitIndexedDB || window.msIndexedDB || window.mozIndexedDB,

    save : function(storeKey, data) {
        dukeconDb.clear(storeKey);
        dukeconDb.add(storeKey, data);
    },

    get : function(storeKey, callback) {
        console.log("Retrieve data from indexeddb");
        dukeconDb.createDatabase(storeKey, function(store) {
            var cursor = store.openCursor();
            cursor.onsuccess = function(event) {
                var cursor = event.target.result;
                callback(cursor ? cursor.value : null);
            };
            cursor.onerror = function(e) {
                console.log("Retrieving data from indexeddb failed");
            };
        });
    },

    clear : function(storeKey) {
        dukeconDb.createDatabase(storeKey, function(store) {
            store.clear().onerror = function(e) {
                console.log("Clearing the indexeddb failed");
            };
        });
    },

    add : function(storeKey, data) {
        dukeconDb.createDatabase(storeKey, function(store) {
            store.add(data).onerror = function(e2) {
                console.log("Saving data to indexeddb failed");
            };
        });
    },

    createDatabase : function(storeKey, callback) {
        //this.indexedDB.deleteDatabase(this.db_name); //please keep this line for debugging
        if (!this.indexedDB) {
            console.log("Cannot store in indexedDB");
            return;
        }
        var request = this.indexedDB.open(this.db_name, 3);
        request.onupgradeneeded = function(e) {
            if (!e || !e.target || !e.target.result) {
                console.log("No db in " + e);
            }
            else {
                dukeconDb.assertObjectStore(e.target.result, storeKey);
            }
        };
        request.onsuccess = function(e) {
            if (!e || !e.target || !e.target.result) {
                console.log("No db in " + e);
            }
            else {
                var store = dukeconDb.openTransaction(storeKey, e.target.result);
                if (store) {
                    callback(store);
                }
            }
        };
        request.onerror = function(e) {
            console.log("Opening database failed: " + e);
        };
    },

    openTransaction : function(storeKey, db) {
        var trans = db.transaction(storeKey, 'readwrite');
        if (!trans) {
            console.log("Could not open transaction");
            return null;
        }
        else {
            return trans.objectStore(storeKey);
        }
    },

    assertObjectStore : function(db, storeKey) {
        if (!db.objectStoreNames.contains(storeKey)){
            db.createObjectStore(storeKey, {
                keyPath: 'key',
                autoIncrement: true
            });
        }
    }
};