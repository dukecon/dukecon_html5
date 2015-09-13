// Check if a new cache is available on page load.
window.addEventListener('load', function(e) {
    console.log ("Adding event listener for cache updates");
    window.applicationCache.addEventListener('updateready', function(e) {
        if (window.applicationCache.status == window.applicationCache.UPDATEREADY) {
            // Browser downloaded a new app cache.
            // Swap it in and reload the page to get the new hotness.
            window.applicationCache.swapCache();
            if (confirm('A new version of this site is available. Load it?')) {
                window.location.reload();
            }
        } else {
            // Manifest didn't changed. Nothing new to server.
        }
    }, false);
}, false);

var dukeconTalkUtils = {
    getData : function(callback) {
        var successCallback = function(data) {
            dukeconDb.save(dukeconDb.talk_store, data);
            callback(data);
        };
        var errorCallback = function() {
            dukeconDb.get(dukeconDb.talk_store, function(data) {
                if (data) {
                    callback(data);
                }
                else {
                    console.log('Could not retrieve any data');
                }
            });
        };
        console.log("Retrieving data from server");
        dukeconTalkUtils.getDataFromServer(callback, errorCallback);
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
    }
};

var dukeconSettings = {
    fav_key : "dukeconfavs",
    filter_key_prefix : "dukeconfilters_",

    getFavourites : function() {
        return dukeconSettings.getSetting(dukeconSettings.fav_key);
    },

    getSelectedFilters : function(filterKey) {
        return dukeconSettings.getSetting(dukeconSettings.filter_key_prefix + filterKey);
    },

    getSetting : function(settingKey) {
        if (localStorage) {
            var setting = localStorage.getItem(settingKey);
            return setting ? JSON.parse(setting) : [];
        }
        return [];
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
        if (localStorage) {
            localStorage.setItem(dukeconSettings.fav_key, JSON.stringify(favourites));
        }
    },

    saveSelectedFilters : function(filterKey, selected) {
        if (localStorage) {
            localStorage.setItem(dukeconSettings.filter_key_prefix + filterKey, JSON.stringify(selected));
        }
    }

};

var dukeconDb = {
    db_name : 'dukecon',
    talk_store : 'talks',
    fav_store : 'dukeconfavs',
    indexedDB : window.indexedDB || window.webkitIndexedDB || window.msIndexedDB,

    save : function(storeKey, data) {
        dukeconDb.createDatabase(storeKey, function(e) {
            var db = e.target.result;
            var store = dukeconDb.openTransaction(storeKey, db);
            store.openCursor().onsuccess = function(event) {
                var cursor = event.target.result;
                if (cursor) {
                    store.delete(cursor);
                    cursor.continue();
                }
            };
            store.add(data);
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
            dukeconDb.assertObjectStore(db, dukeconDb.fav_store);
        };
        request.onsuccess = callback;
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