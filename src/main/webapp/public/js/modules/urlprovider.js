define(
    ['jquery'],
    function($) {
        var cssFile = "/styles.css";
        var emtpyFunc = function() {};
        
        var currentBaseUrl = window.location.href.replace(/\/[^\/]+\.html/ig, "");
        var jsonUrl, customCssUrl;
    
        // temporarily for retrieving conference id from url parameter for switching between conferences,
        // can be removed when conference switch is implemented in html5 client
        var getUrlVar = function(name) {
            var vars = {};
            var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi,
                function(m,key,value) {
                    vars[key] = value;
                });
            return vars[name];
        };

        var setUrls = function(newUrl, allowOverride) {
             jsonUrl = newUrl;
             if (allowOverride && getUrlVar("conference") != undefined) {
                 jsonUrl = jsonUrl.replace(/\d+$/g, getUrlVar("conference"));
                 console.log('detected conference id from url parameter: ' + getUrlVar("conference"))
             }
             customCssUrl = jsonUrl + cssFile;
         };

        // temporarily for retrieving conference id from url parameter for switching between conferences,
        // can be removed when conference switch is implemented in html5 client

        var loadInitData = function(callback) {
            $.ajax({
                url: currentBaseUrl + '/rest/init.json',
                dataType: 'json',
                success: function (data) {
                    if (data.id != undefined) {
                        setUrls(jsonUrl.replace(/\d+$/g, data.id), false);
                        console.log('detected conference id from init call: ' + data.id)
                    }
                    if (callback) {
                        callback(jsonUrl, customCssUrl);
                    }
                },
                error: function() {
                }
            });
        };

        setUrls("${dukecon.server.jsonUrl}", true);
        loadInitData();
        
        return {
            getJsonUrl: function(callback) {
                callback = callback || emptyFunc;
                if (!jsonUrl) {
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
                if (!customCssUrl) {
                    loadInitData(function(unused, customCssUrl) {
                        callback(customCssUrl);
                    });
                }
                else {
                    callback(customCssUrl);
                }
            },
            getUrlParam: getUrlVar
        };
    }
); 
