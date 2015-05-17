function Talk(data) {
    this.title = data.title;
    this.shortAbstract = data.abstractText.substring(0, 100) + "...";
    this.fullAbstract = data.abstractText;
    this.abstract = ko.observable(this.shortAbstract);
    this.shortAbstractShown = true;
    this.toggleText = ko.observable("Show More");

    self.toggleAbstract = function() {
        if (this.shortAbstractShown) {
            this.abstract(this.fullAbstract);
            this.toggleText("Show Less");
        }
        else {
            this.abstract(this.shortAbstract);
            this.toggleText("Show More");
        }
        this.shortAbstractShown = !this.shortAbstractShown;
    };
}

function TalkListViewModel() {
    // Data
    var self = this;
    self.talks = ko.observableArray([]);

    $.getJSON("demotalks.json", function(allData) {
        var mappedTalks = $.map(allData, function(item) { return new Talk(item) });
        self.talks(mappedTalks);
    });
}

ko.applyBindings(new TalkListViewModel());