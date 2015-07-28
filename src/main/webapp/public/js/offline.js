var dukeconStorageUtils = {
    db_name : 'dukecon',
    talk_store : 'talks',
    indexedDB : window.indexedDB || window.webkitIndexedDB || window.msIndexedDB,

    getData : function(callback) {
        var utils = this;
        utils.createDatabase(function(e) {
            var db = e.target.result;
            utils.getDataFromDb(utils.openTransaction(db), function(data) {
                if (data) {
                    callback(data);
                }
                else {
                    console.log('No Entries in db, retrieving data from the server');
                    utils.getDataFromServer(function(data) {
                        utils.storeDataInDb(utils.openTransaction(db), data);
                        callback(data);
                    });
                }
            });
        });
    },

    createDatabase : function(callback) {
        //this.indexedDB.deleteDatabase(this.db_name);
        var storeKey = this.talk_store;
        var request = this.indexedDB.open(this.db_name);
        request.onupgradeneeded = function(e){
            var db = e.target.result;
            if (!db.objectStoreNames.contains(storeKey)){
                store = db.createObjectStore(storeKey, {
                    keyPath: 'key',
                    autoIncrement: true
                });
            }
        };
        request.onsuccess = callback;
    },

    storeDataInDb : function(store, data) {
        store.openCursor().onsuccess = function(event) {
            var cursor = event.target.result;
            if (cursor) {
                store.delete(cursor);
                cursor.continue();
            }
        };
        store.add(data);
    },

    getDataFromDb : function(store, callback) {
        store.openCursor().onsuccess = function(event) {
            var cursor = event.target.result;
            callback(cursor ? cursor.value : null);
        };
    },

    openTransaction : function(db) {
        var trans = db.transaction(this.talk_store, 'readwrite');
        return trans.objectStore(this.talk_store);
    },

    getDataFromServer : function(callback) {
        $.ajax({
            method: 'GET',
            dataType: "json",
            url: jsonUrl,
            success: callback,
            error: function(error) {
                console.log("Nothing updated. Device offline?");
            }
        });
    }
};

var dukeconSettings = {
    fav_key : "dukeconfavs",

    getFavourites : function() {
        if (localStorage) {
            var favourites = localStorage.getItem(dukeconSettings.fav_key);
            return favourites ? JSON.parse(favourites) : [];
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
    }
};
