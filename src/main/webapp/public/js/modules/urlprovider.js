define(
    ['jquery'],
    function() {
        var currentBaseUrl = window.location.href;

        var ConferenceUrls = (function () {
            function ConferenceUrls(jsonUrl) {
                this.setJsonUrl(jsonUrl);
            }
            ConferenceUrls.prototype.setJsonUrl = function (jsonUrl) {
                this.jsonUrl = jsonUrl;
                this.customCssUrl = this.jsonUrl + "/styles.css";
            };
            return ConferenceUrls;
        }());

        var result = new ConferenceUrls("${dukecon.server.jsonUrl}");

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

        // temporarily for retrieving conference id from url parameter for switching between conferences,
        // can be removed when conference switch is implemented in html5 client
        if (getUrlVar("conference") != undefined) {
            result.setJsonUrl(result.jsonUrl.replace(/\d+$/g, getUrlVar("conference")));
            console.log('detected conference id from url parameter: ' + getUrlVar("conference"))
        }

        $.ajax({
            url: currentBaseUrl + 'rest/init.json',
            dataType: 'json',
            success: function (data) {
                if (data.id != undefined) {
                    result.setJsonUrl(result.jsonUrl.replace(/\d+$/g, data.id));
                    console.log('detected conference id from init call: ' + data.id)
                }
            }
        });

        return result;
    }
); 
