define(['underscore'], function() {
    var keys = {
        fav_key: "dukeconfavs",
        filter_key_prefix: "dukeconfilters_",
        filter_active_key: "dukeconfilters_active",
        favs_active: "dukeconfavs_active",
        selected_language_key: "dukecon_language",
        day_key: "dukeconday",
        last_updated_hash: "dukecon_last_updated_hash",
        offline: "dukecon_offline",
        previously_offline: "dukecon_previously_offline"
    };

    // strip the file name from the URL to get the context (i.e. '/latest/speakers.html' -> '/latest')
    // so that all pages of the app use the same context
    var context = window.location.pathname.substring(0, window.location.pathname.lastIndexOf("/"));

    var getFavourites = function() {
        return getSettingOrEmptyArray(keys.fav_key);
    };

    var getSavedFilters = function(filters) {
        var savedFilters = {};
        _.each(filters, function(filter) {
            savedFilters[filter.filterKey] = getSettingOrEmptyArray(keys.filter_key_prefix + filter.filterKey);
        });
        return savedFilters;
    };

    var getSelectedDay = function() {
        var day = getSetting(keys.day_key);
        return day ? day : "0";
    };

    var getSelectedLanguage = function() {
        var language = getSetting(keys.selected_language_key);
        return language ? language : "de";
    };

    var isFavourite = function(id) {
        return getFavourites().indexOf(id) != -1;
    };

    var filtersActive = function() {
        var result = getSetting(keys.filter_active_key);
        return result == null ? true : result;
    };

    var favoritesActive = function() {
        var result = getSetting(keys.favs_active);
        return result == null ? false : result;
    };

    toggleFavourite = function(id) {
        var favourites = getFavourites();
        var pos = favourites.indexOf(id);
        if (pos === -1) {
            favourites.push(id);
        }
        else {
            favourites.splice(pos, 1);
        }
        saveSetting(keys.fav_key, favourites);
    };

    var saveSelectedFilters = function(filters) {
        _.each(filters, function(filter) {
            var selected = _.map(
                _.filter(filter.filtervalues(), function(val) { return val.selected(); }),
                function(filterValue) { return filterValue.id; });
            saveSetting(keys.filter_key_prefix + filter.filterKey, selected);
        });
    };

    var saveSelectedDay = function(day_index) {
        saveSetting(keys.day_key, day_index);
    };

    var saveSelectedLanguage = function(language) {
        saveSetting(keys.selected_language_key, language);
    };

    var getSettingOrEmptyArray = function(settingKey) {
        var setting = getSetting(settingKey);
        return setting ? setting : [];
    };

    var getSetting = function(settingKey) {
        if (localStorage) {
            var setting = localStorage.getItem(context + settingKey);
            //console.log("Load: " + settingKey + " -> " + setting);
            return setting ? JSON.parse(setting) : null;
        }
        return null;
    };

    var saveSetting = function(settingKey, value) {
        if (localStorage) {
            //console.log("Save: " + settingKey + " -> " + JSON.stringify(value));
            localStorage.setItem(context + settingKey, JSON.stringify(value));
        }
    };

    var clearSetting = function(settingKey) {
        if (localStorage) {
            //console.log("Clear: " + settingKey));
            localStorage.removeItem(context + settingKey);
        }
    };

    return {
        keys : keys,
        getFavourites : getFavourites,
        getSavedFilters : getSavedFilters,
        getSelectedDay : getSelectedDay,
        getSelectedLanguage : getSelectedLanguage,
        isFavourite : isFavourite,
        filtersActive : filtersActive,
        favoritesActive : favoritesActive,
        toggleFavourite : toggleFavourite,
        saveSelectedFilters : saveSelectedFilters,
        saveSelectedDay : saveSelectedDay,
        saveSelectedLanguage : saveSelectedLanguage,
        getSettingOrEmptyArray : getSettingOrEmptyArray,
        getSetting : getSetting,
        saveSetting : saveSetting,
        clearSetting : clearSetting
    };
});