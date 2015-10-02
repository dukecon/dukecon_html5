describe("dukecon settings", function () {
    it("handle favourites", function () {
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

    it("handle filters", function () {
        var selected = true;
        var filter1 = {
            filterKey: 'filter1',
            selected: function () { return selected ? ["value1"] : [] }
        };
        var filter2 = {
            filterKey: 'filter2',
            selected: function () { return selected ? ["value2"] : []; }
        };
        var filters = [filter1, filter2];

        expect(dukeconSettings.getSavedFilters(filters)).toEqual({"filter1" : [], "filter2" : []});
        dukeconSettings.saveSelectedFilters(filters);
        expect(dukeconSettings.getSavedFilters(filters)).toEqual({"filter1" : ["value1"], "filter2" : ["value2"]});

        selected = false;
        dukeconSettings.saveSelectedFilters(filters);
        expect(dukeconSettings.getSavedFilters(filters)).toEqual({"filter1" : [], "filter2" : []});
    });

    it("handle selected day", function() {
        expect(dukeconSettings.getSelectedDay()).toEqual("0");
        dukeconSettings.saveSelectedDay(2);
        expect(dukeconSettings.getSelectedDay()).toEqual(2);
        dukeconSettings.saveSelectedDay(0);
        expect(dukeconSettings.getSelectedDay()).toEqual("0");
    });
});
