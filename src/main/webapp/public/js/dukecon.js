var jsonUrl = "demotalks.json";
//var jsonUrl = "../rest/talks";
//var jsonUrl = "http://dev.dukecon.org:9090/talks";
var originHeader = "http://dev.dukecon.org";

function Talk(data) {
    this.id = data.id;
    this.day = dukeconDateUtils.getDisplayDate(data.start);
    this.startDisplayed = dukeconDateUtils.getDisplayTime(data.start);
    this.startSortable = data.start;
    this.track = data.track;
    this.location = data.location;
    this.level = data.level;
    this.title = data.title;
    this.speakers = data.speakers;
    this.speakerString = data.speakers[0].name; // TODO: comma-list
    this.language = data.language;
    this.shortAbstract = data.abstractText.substring(0, 100) + "...";
    this.fullAbstract = data.abstractText;
    this.detailVisible = false;
    this.toggleText = ko.observable("more...");

    self.toggleDetail = function(element) {
        if (this.detailVisible) {
            this.toggleText("more...");
            $('#' + this.id).removeClass("shown");
            $('#' + this.id).addClass("folded");
        }
        else {
            this.toggleText("less...");
            $('#' + this.id).addClass("shown");
            $('#' + this.id).removeClass("folded");
        }
        this.detailVisible = !this.detailVisible;
    };
};

function Speaker(name, company, talks) {
    this.name = name;
    this.company = company;
    this.talks = talks;
};

var dukeconDateUtils = {

    weekDays : ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"],

    getDisplayDate : function(datetimeString) {
        var date = new Date(datetimeString);
        var month = this.addTrailingZero(date.getMonth() + 1);
        var day = this.addTrailingZero(date.getDate());
        var weekDay = this.weekDays[date.getDay()];
        return weekDay + ", " + day + "." + month;
    },

    getDisplayTime : function(datetimeString) {
        var date = new Date(datetimeString);
        return this.addTrailingZero(date.getHours()) + ":" + this.addTrailingZero(date.getMinutes());
    },

    addTrailingZero : function(data) {
        if (data < 10) {
            return '0' + data;
        }
        return data;
    }
};

var dukeconStorageUtils = {
    db_name : 'dukecon',
    talk_store : 'talks',
    indexedDB : window.indexedDB || window.webkitIndexedDB || window.msIndexedDB,

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
                console.log('Cursor', cursor);
                console.log('Cursor data', cursor.value);
                store.delete(cursor);
                cursor.continue();
            }
        };
        store.add(data);
    },

    getDataFromDb : function(store, callback) {
        store.openCursor().onsuccess = function(event) {
            var cursor = event.target.result;
            if (cursor) {
                callback(cursor.value);
            }
            else {
                console.log('No Entries in db, retrieving data from the server');
                callback(null);
            }
        };
    },

    getData : function(callback) {
       var utils = this;
       utils.createDatabase(function(e) {
           console.log('Db opened');
           var db = e.target.result;
           utils.getDataFromDb(utils.openTransaction(db), function(data) {
                if (data) {
                    callback(data);
                }
                else {
                    utils.getDataFromServer(function(data) {
                        utils.storeDataInDb(utils.openTransaction(db), data);
                        callback(data);
                    });
                }
            });
        });
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
