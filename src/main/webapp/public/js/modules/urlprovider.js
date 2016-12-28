define(
    ['jquery'],
    function($) {
        var cssFile = "/styles.css";
        var currentBaseUrl = window.location.href.replace(/\/[^\/]+\.html/ig, "").replace(/\/$/ig, "");
        console.log('Using currentBaseUrl: "' + currentBaseUrl + '"');
        var jsonUrl, customCssUrl, initialized = false;
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
             jsonUrl = newUrl;
             if (allowOverride && getUrlVar("conference") != undefined) {
                 jsonUrl = insertConferenceIdIntoUrl(jsonUrl, getUrlVar("conference"));
                 console.log('detected conference id from url parameter: ' + getUrlVar("conference"));
             }
             customCssUrl = jsonUrl + cssFile;
         }

        function loadInitData(callback) {
            $.ajax({
                url: currentBaseUrl + '/rest/init.json',
                dataType: 'json',
                success: function (data) {
                    if (data.id != undefined) {
                        setUrls(insertConferenceIdIntoUrl(jsonUrl, data.id), false);
                        console.log('detected conference id from init call: ' + data.id)
                    }
                    if (callback) {
                        callback(jsonUrl, customCssUrl);
                    }
                    initialized = true;
                },
                error: function() {
                    initialized = true;
                }
            });
        }

        setUrls("${dukecon.server.jsonUrl}", true);
        loadInitData();

        var emtpyFunc = function() {};

        return {
            getJsonUrl: function(callback) {
                callback = callback || emptyFunc;
                if (!initialized) {
                    loadInitData(function(jsonUrl, unused) {
                        callback(jsonUrl);
                    });
                }
                else {
                    callback(jsonUrl);
                }
            },
            getCustomCssUrl: function(callback) {
                callback = callback || emptyFunc;
                if (!initialized) {
                    loadInitData(function(unused, customCssUrl) {
                        callback(customCssUrl);
                    });
                }
                else {
                    callback(customCssUrl);
                }
            },
            getUrlParam: getUrlVar,
            setUrlParam: setUrlVar
        };
    }
); 
