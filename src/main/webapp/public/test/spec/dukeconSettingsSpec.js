describe("dukecon settings", function () {
    it("handle favourites", function () {
        spyOn(dukeconSynch, "push").and.returnValue(null);
        var talk = {
            talk: {
                id: "id1",
                toggleFavourite: function () {}
            }
        };

        expect(dukeconSettings.getFavourites()).toEqual([]);
        dukeconSettings.toggleFavourite(talk);
        expect(dukeconSettings.getFavourites()).toEqual(["id1"]);
        expect(dukeconSettings.isFavourite("id1")).toBe(true);
        dukeconSettings.toggleFavourite(talk);
        expect(dukeconSettings.getFavourites()).toEqual([]);
    });

    var createFilterValue = function(id, selected) {
        return {id : id, selected : function() { return selected; }};
    };
    var createFilter = function(filterKey, filterValues) {
        return { filterKey: filterKey, filtervalues : function () { return filterValues; }};
    };

    it("handle filters", function () {
        var filter1Unselected = createFilter('filter1', [createFilterValue("1", false), createFilterValue("2", false)]);
        var filter1 = createFilter('filter1', [createFilterValue("1", false), createFilterValue("2", true)]);
        var filter2 = createFilter('filter2', [createFilterValue("1", false), createFilterValue("2", false)]);
        dukeconSettings.saveSelectedFilters([filter1Unselected, filter2]);

        var filters = [filter1, filter2];
        expect(dukeconSettings.getSavedFilters(filters)).toEqual({"filter1" : [], "filter2" : []});
        dukeconSettings.saveSelectedFilters(filters);
        expect(dukeconSettings.getSavedFilters(filters)).toEqual({"filter1" : ["2"], "filter2" : []});
    });

    it("handle selected day", function() {
        expect(dukeconSettings.getSelectedDay()).toEqual("0");
        dukeconSettings.saveSelectedDay(2);
        expect(dukeconSettings.getSelectedDay()).toEqual(2);
        dukeconSettings.saveSelectedDay(0);
        expect(dukeconSettings.getSelectedDay()).toEqual("0");
    });

    it("handle filters active", function() {
        expect(dukeconSettings.filtersActive()).toEqual(true);
        dukeconSettings.saveSetting(dukeconSettings.filter_active_key, false);
        expect(dukeconSettings.filtersActive()).toEqual(false);
        dukeconSettings.saveSetting(dukeconSettings.filter_active_key, true);
        expect(dukeconSettings.filtersActive()).toEqual(true);
    });
});
