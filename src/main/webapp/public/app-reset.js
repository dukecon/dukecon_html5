require.config({
    paths: {
        "jquery": "js/jquery-2.1.4.min",
        "underscore": "js/underscore-min",
        "knockout": "js/knockout-min-3.3.0"
    }
});

require(['jquery', 'js/modules/dukecondb', 'js/modules/dukeconsettings'], function($, db, settings) {
    console.log("Clearing DB");
    db.purge();
    console.log("Clearing DB done; resetting localstore");
    settings.purge();
    console.log("Resetting localstore done!");
    $('#loading').hide();
    $('#layout').show();
});
