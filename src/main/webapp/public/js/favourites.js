function FavouriteViewModel() {
    // Data
    var self = this;
    self.favourites = ko.observableArray([]);

    dukeconStorageUtils.getData(function(allData) {
        self.initializeData(allData);
    });

    self.initializeData = function(allData) {
        var favIds = ["491354", "491635"];
        var grouped = _.groupBy(allData, function(t) { return t.id; });
        var talks = _.map(favIds, function(id) { return new Talk(grouped[id][0]); });
        self.favourites(talks);
    };
}

ko.applyBindings(new FavouriteViewModel());

