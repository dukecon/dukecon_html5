var jsonUrl = "talks.json";

function Talk(data) {
    this.id = data.id;
    this.start = data.start;
    this.track = data.track;
    this.location = data.location;
    this.level = data.level;
    this.title = data.title;
    this.shortAbstract = data.abstractText.substring(0, 100) + "...";
    this.fullAbstract = data.abstractText;
    this.detailVisible = false;
    this.toggleText = ko.observable("more...");

    self.detailView = function() {
        alert("not implemented");
    }

    self.toggleDetail = function(element) {
        if (this.detailVisible) {
            this.toggleText("more...");
            $('#' + this.id).removeClass("visible");
            $('#' + this.id).addClass("hidden");
        }
        else {
            this.toggleText("less...");
            $('#' + this.id).addClass("visible");
            $('#' + this.id).removeClass("hidden");
        }
        this.detailVisible = !this.detailVisible;
    };
}

function TalkListViewModel() {
    // Data
    var self = this;
    self.talks = ko.observableArray([]);

    $.getJSON(jsonUrl, function(allData) {
        var mappedTalks = $.map(allData, function(item) { return new Talk(item) });
        self.talks(mappedTalks);
    });
}

ko.applyBindings(new TalkListViewModel());