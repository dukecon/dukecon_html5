// Check if a new cache is available on page load.
window.addEventListener('load', function(e) {
    window.applicationCache.addEventListener('updateready', function(e) {
        if (window.applicationCache.status == window.applicationCache.UPDATEREADY) {
            // Browser downloaded a new app cache.
            // Swap it in and reload the page to get the new hotness.
            window.applicationCache.swapCache();
            if (confirm('A new version of this site is available. Load it?')) {
                window.location.reload();
            } else {
            	console.log ("The reload of the site was refused by the user");
            }
        } else {
            console.log ("The manifest did not change!");
        }
    }, false);
}, false);

var dukeconTalkUtils = {
    getData : function(callback) {
        var successCallback = function(data) {
            dukeconDb.save(dukeconDb.talk_store, data);
            callback(dukeconTalkUtils.filterNullTalks(data));
        };
        var errorCallback = function() {
            dukeconDb.get(dukeconDb.talk_store, function(data) {
                if (data) {
                    callback(dukeconTalkUtils.filterNullTalks(data));
                }
                else {
                    console.log('Could not retrieve any data');
                }
            });
        };
        console.log("Retrieving data from server");
        dukeconTalkUtils.getDataFromServer(successCallback, errorCallback);
    },

    getDataFromServer : function(callback, errorCallback) {
        $.ajax({
            method: 'GET',
            dataType: "json",
            url: jsonUrl,
            success: callback,
            error: function(error) {
                console.log('No connection to server, retrieving data from local storage');
                errorCallback();
            }
        });
    },

    filterNullTalks : function(allTalks) {
        return _.filter(allTalks, function(talk) { return talk !== null; })
    }
};

var dukeconSettings = {
    fav_key : "dukeconfavs",
    filter_key_prefix : "dukeconfilters_",
    day_key : "dukeconday",

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

    isFavourite : function(id) {
        return dukeconSettings.getFavourites().indexOf(id) != -1;
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
            dukeconSettings.saveSetting(dukeconSettings.filter_key_prefix + filter.filterKey, filter.selected());
        });
    },

    saveSelectedDay : function(day_index) {
        dukeconSettings.saveSetting(dukeconSettings.day_key, day_index);
    },

    getSettingOrEmptyArray : function(settingKey) {
        var setting = dukeconSettings.getSetting(settingKey);
        return setting ? setting : [];
    },

    getSetting : function(settingKey) {
        if (localStorage) {
            var setting = localStorage.getItem(settingKey);
            //console.log("Load: " + settingKey + " -> " + setting);
            return setting ? JSON.parse(setting) : null;
        }
        return null;
    },

    saveSetting : function(settingKey, value) {
        if (localStorage) {
            //console.log("Save: " + settingKey + " -> " + value)
            localStorage.setItem(settingKey, JSON.stringify(value));
        }
    }

};

var dukeconDb = {
    db_name : 'dukecon',
    talk_store : 'talks',
    indexedDB : window.indexedDB || window.webkitIndexedDB || window.msIndexedDB,

    save : function(storeKey, data) {
        dukeconDb.clear(storeKey);
        dukeconDb.createDatabase(storeKey, function(e) {
            var db = e.target.result;
            var store = dukeconDb.openTransaction(storeKey, db);
            store.add(data).onerror = function(e2) {
                console.log("Saving data to indexeddb failed");
            };
        });
    },

    get : function(storeKey, callback) {
        dukeconDb.createDatabase(storeKey, function(e) {
            var db = e.target.result;
            var store = dukeconDb.openTransaction(storeKey, db);
            store.openCursor().onsuccess = function(event) {
                var cursor = event.target.result;
                callback(cursor ? cursor.value : null);
            };
        });
    },

    createDatabase : function(storeKey, callback) {
        //this.indexedDB.deleteDatabase(this.db_name); //please keep this line for debugging
        var request = this.indexedDB.open(this.db_name, 2);
        request.onupgradeneeded = function(e){
            var db = e.target.result;
            dukeconDb.assertObjectStore(db, dukeconDb.talk_store);
        };
        request.onsuccess = callback;
        request.onerror = function(e) {
            console.log("Opening database failed: " + e);
        }
    },

    clear : function(storeKey) {
        dukeconDb.createDatabase(storeKey, function(e) {
            var db = e.target.result;
            var store = dukeconDb.openTransaction(storeKey, db);
            store.clear().onerror = function(e2) {
                console.log("Clearing the db failed");
            };
        });
    },

    openTransaction : function(storeKey, db) {
        var trans = db.transaction(storeKey, 'readwrite');
        return trans.objectStore(storeKey);
    },

    assertObjectStore : function(db, storeKey) {
        if (!db.objectStoreNames.contains(storeKey)){
            store = db.createObjectStore(storeKey, {
                keyPath: 'key',
                autoIncrement: true
            });
        }
    }
};