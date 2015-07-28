var jsonUrl = "demotalks.json";
//var jsonUrl = "../rest/talks";
//var jsonUrl = "http://dev.dukecon.org:9090/talks";
var originHeader = "http://dev.dukecon.org";

function Talk(data) {
    this.id = data.id || '';
    this.day = dukeconDateUtils.getDisplayDate(data.start);
    this.startDisplayed = dukeconDateUtils.getDisplayTime(data.start);
    this.startSortable = data.start || '';
    this.track = data.track || '';
    this.location = data.location || '';
    this.level = data.level || '';
    this.title = data.title || '';
    this.speakers = dukeconUtils.getSpeakerNames(data.speakers);
    this.speakerString = data.speakers ? data.speakers[0].name : ""; // TODO: comma-list
    this.language = data.language || '';
    this.fullAbstract = data.abstractText || '';
    this.shortAbstract = this.fullAbstract.substring(0, 100) + "...";
    this.favourite = ko.observable(data.id ? dukeconSettings.isFavourite(data.id) : false);
    this.favclass = ko.computed(function() {
        return this.favourite() ? "fa-star" : "fa-star-o";
    }, this);
    this.toggleFavourite = function() {
        this.favourite(!this.favourite());
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
        if (!datetimeString) {
            return '';
        }
        var date = new Date(datetimeString);
        var month = this.addTrailingZero(date.getMonth() + 1);
        var day = this.addTrailingZero(date.getDate());
        var weekDay = this.weekDays[date.getDay()];
        return weekDay + ", " + day + "." + month;
    },

    getDisplayTime : function(datetimeString) {
        if (!datetimeString) {
            return '';
        }
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

//widgets
ko.components.register('header-widget', {
    viewModel : function(params) {
        this.title = params.value;
    },
    template:
        '<div class="header">'
        + '<img src="img/logo_javaland.gif" title="javaland 2016"/>'
        + '<div class="main-menu">'
        + '<a href="index.html">Talks</a>|<a href="speakers.html">Sprecher</a>'
        + '</div>'
        + '<h1 data-bind="text: title"></h1>'
        + '</div>'
});

ko.components.register('talk-widget', {
    viewModel: function(data) {
        this.talk = data.value;
    },
    template:
        '<div class="talk-cell">'
            + '<div class="title">'
                + '<a style="padding: 0px" data-bind="text: talk.title, attr : { href : \'talk.html#talk?talkId=\' + talk.id }"></a>'
                + '<i class="fa fa-lg" style="cursor:pointer; margin-left: 2px;" title="Add to Favourites" data-bind="click: dukeconSettings.toggleFavourite, css: talk.favclass"></i>'
            + '</div>'
            + '<div class="speaker"><span data-bind="text: talk.speakerString" /></div>'
            + '<div class="time">Start: <span data-bind="text: talk.day" /></div><div class="time">, <span data-bind="text: talk.startDisplayed" /> </div>'
            + '<div class="room">Raum: <span data-bind="text: talk.location" /></div>'
            + '<div class="track">Track: <span data-bind="text: talk.track" /></div>'
            + '</div>'
});

//not sure where else to put
var dukeconUtils = {
    getSpeakerNames : function(speakers) {
        var filteredSpeakers = _.filter(speakers, function(speaker) {
            return speaker;
        });
        return _.map(filteredSpeakers, function(speaker) {
            return speaker.name + ", " + speaker.company;
        });
    }
};