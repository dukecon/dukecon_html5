var dukeconTalkUtils = {
    getData : function(callback) {
        dukeconDb.get(dukeconDb.talk_store, function(data) {
            if (data) {
                callback(data);
            }
            else {
                console.log('No Entries in db, retrieving data from the server');
                dukeconTalkUtils.getDataFromServer(function(data) {
                    dukeconDb.save(dukeconDb.talk_store, data);
                    callback(data);
                });
            }
        });
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