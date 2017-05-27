define(
    ['jquery', 'js/modules/urlprovider'],
    function($, urlprovider) {
        var defaultImage = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"; // 1px transparent
        var currentBaseUrl = urlprovider.getCurrentBaseUrl();
        var imageResourceUrl = "/rest/image-resources.json";
        console.log('Image provider Using currentBaseUrl: "' + currentBaseUrl + '"');

        var imageResources = {};

        function loadResources(name, callback) {
            console.log("Getting images from " + currentBaseUrl + imageResourceUrl);
            $.ajax({
                url: currentBaseUrl + imageResourceUrl,
                dataType: 'json',
                success: function (result) {
                    imageResources = result;
                    imageResources.loaded = true;
                    console.log(imageResources);
                    if (callback) {
                        callback(imageResources[name] || defaultImage);
                    }
                },
                error: function(err) {
                    console.log("could not get resources: " + JSON.stringify(err));
                }
            });
        }

        function getByName(name, callback) {
            if (!imageResources.loaded) {
                loadResources(name, callback);
            }
            else {
                callback(imageResources[name] || defaultImage);
            }
        }

        loadResources();

        var emtpyFunc = function() {};

        return {
            getByName: getByName,
            defaultImage: defaultImage
        };
    }
); 
