define(
    ['jquery'],
    function($) {
        var cssFile = "/styles.css";
        var currentBaseUrl = window.location.href
            .replace(/\/[^\/]+\.html\S*/ig, "")
            .replace(/#\S*/g, "")
            .replace(/\?\S*/g, "")
            .replace(/\/$/ig, "");
        console.log('Using currentBaseUrl: "' + currentBaseUrl + '"');

        var data = {
            jsonUrl: null,
            customCssUrl: null,
            bookingsUrl: null,
            homepageName: null,
            homepageUrl: null
        };

        var initialized = false;
        var allQueryParams;

        function getQueryParams() {
            var vars = {};
            var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi,
                function(m,key,value) {
                    vars[key] = decodeURIComponent(value);
                });
            allQueryParams = vars;
        }
        
        var getUrlVar = function(name) {
            if (!allQueryParams) {
                getQueryParams();
            }
            return allQueryParams[name];
        };

        var setUrlVar = function(name, value) {
            if (!allQueryParams) {
                getQueryParams();
            }
            allQueryParams[name] = value;
            var newUrl = window.location.href.replace(/\?\S*/g, "");
            var first = true;
            for (paramName in allQueryParams) {
                if (allQueryParams[paramName]) {
                    newUrl += first ? "?" : "&";
                    first = false;
                    newUrl += paramName + "=" + encodeURIComponent(allQueryParams[paramName]);
                }
            }
            // write modified querystring without reloading the page
            if (history.pushState) {
                window.history.pushState({path:newUrl},'',newUrl);
            }
        };

        function insertConferenceIdIntoUrl(oldUrl, newId) {
            if (oldUrl.indexOf(newId) >= 0) {
                return oldUrl;
            }
            return oldUrl.replace(/[^\/]+[\/]?$/g, newId);
        }

        function setUrls(newUrl, allowOverride) {
             data.jsonUrl = newUrl;
             if (allowOverride && getUrlVar("conference") != undefined) {
                 data.jsonUrl = insertConferenceIdIntoUrl(data.jsonUrl, getUrlVar("conference"));
                 console.log('detected conference id from url parameter: ' + getUrlVar("conference"));
             }
             data.bookingsUrl = data.jsonUrl.replace("conferences", "eventsBooking");
             data.customCssUrl = data.jsonUrl.replace(".json", "") + cssFile;
         }

        function loadInitData(callback) {
            console.log("initializing via " + currentBaseUrl + '/rest/init.json');
            $.ajax({
                url: currentBaseUrl + '/rest/init.json',
                dataType: 'json',
                success: function (result) {
                    if (result.id != undefined) {
                        setUrls(insertConferenceIdIntoUrl(data.jsonUrl, result.id), false);
                        data.homepageName = result.name;
                        data.homepageUrl = result.homeUrl;
                        document.title = result.name;
                        console.log('detected conference id from init call: ' + result.id)
                    }
                    if (callback) {
                        callback(data);
                    }
                    initialized = true;
                },
                error: function(err) {
                    console.log("could not initialize: " + JSON.stringify(err));
                    initialized = false;
                }
            });
        }

        setUrls("${dukecon.server.jsonUrl}", true);
        loadInitData();

        var emtpyFunc = function() {};

        return {
            imageBaseUrl: currentBaseUrl + '/rest/speaker/images/',
            getData: function(callback) {
                callback = callback || emptyFunc;
                if (!initialized) {
                    loadInitData(function(data) {
                        callback(data);
                    });
                }
                else {
                    callback(data);
                }
            },
            getUrlParam: getUrlVar,
            setUrlParam: setUrlVar
        };
    }
); 
