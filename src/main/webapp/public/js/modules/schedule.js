define(['underscore', 'jquery', 'knockout', 'js/modules/talklist', 'js/modules/dukeconsettings', 'js/modules/offline', 'js/modules/dukecon', 'js/modules/languageutils', 'moment', 'vis'],
    function(_, $, ko, talklist, dukeconSettings, dukeconTalkUtils, dukecon, languageUtils) {
        "use strict";

        var getTimeTableStart = function(data) {
            return "2016-03-08T8:00:00";
        };

        var getTimeTableEnd = function(data) {
            return "2016-03-09T20:00:00";
        };

        var generateLocations = function(data) {
            return ['Room1', 'Room2', 'Room3', 'Broom cabinet'];
        };

        var generateTableItems = function(data) {
            return [
                {
                    id: 1,
                    group: 1,
                    content: '<div class="title">Talk 1</div><div>Speaker 1</div><div>additional info</div>',
                    start: "2016-03-08T14:00:00",
                    end: "2016-03-08T15:30:00"
                },
                {
                    id: 2,
                    group: 0,
                    content: '<div class="title">Talk 2</div><div>Speaker 2</div><div>additional info</div>',
                    start: "2016-03-08T15:00:00",
                    end: "2016-03-08T17:00:00"
                },
                {
                    id: 3,
                    group: 1,
                    content: '<div class="title">Talk 3</div><div>Speaker 1</div><div>additional info</div>',
                    start: "2016-03-08T18:00:00",
                    end: "2016-03-08T20:00:00"
                },
                {
                    id: 4,
                    group: 0,
                    content: '<div class="title">Talk 4</div><div>Speaker 1</div><div>additional info</div>',
                    start: "2016-03-08T17:00:00",
                    end: "2016-03-08T19:00:00"
                },
                {
                    id: 5,
                    group: 2,
                    content: '<div class="title">Talk 5</div><div>Speaker 3</div><div>additional info</div>',
                    start: "2016-03-08T17:00:00",
                    end: "2016-03-08T19:00:00"
                },

                {
                    id: 6,
                    group: 1,
                    content: '<div class="title">Talk 1</div><div>Speaker 1</div><div>additional info</div>',
                    start: "2016-03-09T14:00:00",
                    end: "2016-03-09T15:30:00"
                },
                {
                    id: 7,
                    group: 0,
                    content: '<div class="title">Talk 2</div><div>Speaker 2</div><div>additional info</div>',
                    start: "2016-03-09T15:00:00",
                    end: "2016-03-09T17:00:00"
                },
                {
                    id: 8,
                    group: 1,
                    content: '<div class="title">Talk 3</div><div>Speaker 1</div><div>additional info</div>',
                    start: "2016-03-09T18:00:00",
                    end: "2016-03-09T20:00:00"
                },
                {
                    id: 9,
                    group: 0,
                    content: '<div class="title">Talk 4</div><div>Speaker 1</div><div>additional info</div>',
                    start: "2016-03-09T17:00:00",
                    end: "2016-03-09T19:00:00"
                },
                {
                    id: 10,
                    group: 2,
                    content: '<div class="title">Talk 5</div><div>Speaker 3</div><div>additional info</div>',
                    start: "2016-03-09T08:00:00",
                    end: "2016-03-09T19:00:00"
                }
            ];
        };

        var scheduleTalksModel;

        function initializeSchedule() {
            scheduleTalksModel = new talklist.TalkListViewModel();
            dukeconTalkUtils.reloadInPrivateMode.subscribe(function(value) {
                if (value) {
                    dukeconTalkUtils.getData(dukeconTalkUtils.jsonUrl, scheduleTalksModel.initialize);
                }
            });
            dukeconTalkUtils.getData(dukeconTalkUtils.jsonUrl, scheduleTalksModel.initialize);
            ko.applyBindings(scheduleTalksModel);

            console.log("initializing schedule");

            // create a data set with groups
            var locations = generateLocations(scheduleTalksModel);
            var groups = new vis.DataSet();
            for (var g = 0; g < locations.length; g++) {
                groups.add({id: g, content: locations[g]});
            }

            // create a dataset with items
            var items = new vis.DataSet(generateTableItems(scheduleTalksModel));

            // create visualization
            var container = document.getElementById('visualization');
            var options = {
                locale: languageUtils.selectedLanguage(),
                stack: false,
                start: getTimeTableStart(scheduleTalksModel),
                end: getTimeTableEnd(scheduleTalksModel),
                hiddenDates: [
                    {
                        start: "2016-01-01T00:00:01",
                        end: "2016-01-01T08:00:00",
                        repeat: "daily"
                    },
                    {
                        start: "2016-01-01T21:00:00",
                        end: "2016-01-01T00:00:00",
                        repeat: "daily"
                    }
                ],
                editable: false,
                margin: {
                    item: 5, // minimal margin between items
                    axis: 5   // minimal margin between items and the axis
                },
                orientation: 'top'
            };

            var timeline = new vis.Timeline(container);
            timeline.setOptions(options);
            timeline.setGroups(groups);
            timeline.setItems(items);

            function move (percentage) {
                var range = timeline.getWindow();
                var interval = range.end - range.start;

                timeline.setWindow({
                    start: range.start.valueOf() - interval * percentage,
                    end:   range.end.valueOf()   - interval * percentage
                });
            }

            function zoom (percentage) {
                var range = timeline.getWindow();
                var interval = range.end - range.start;

                timeline.setWindow({
                    start: range.start.valueOf() - interval * percentage,
                    end:   range.end.valueOf()   + interval * percentage
                });
            }

            function reset () {
                timeline.setWindow({
                    start: options.start,
                    end: options.end
                });
            }

            // attach events to the navigation buttons
            $('#zoomIn').on(
                "click",
                function () {
                    zoom(-0.2);
                }
            );
            $('#zoomOut').on(
                "click",
                function () {
                    zoom( 0.2);
                }
            );
            $('#moveLeft').on(
                "click",
                function () {
                    move( 0.2);
                }
            );
            $('#moveRight').on(
                "click",
                function () {
                    move(-0.2);
                }
            );
            $('#reset').on(
                "click",
                function () {
                    reset();
                }
            );

            hideLoading(500, 'dukeConSchedule');
        }

        return {
            initialize : initializeSchedule
        };
    });
