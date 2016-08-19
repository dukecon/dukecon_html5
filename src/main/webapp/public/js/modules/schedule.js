define(['underscore', 'jquery', 'knockout', 'js/modules/talklist', 'js/modules/dukeconsettings', 'js/modules/offline', 'js/modules/dukecon', 'js/modules/languageutils', 'moment', 'vis'],
    function(_, $, ko, talklist, dukeconSettings, dukeconTalkUtils, dukecon, languageUtils) {
        "use strict";

        var itemsToAdd = [
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
            var locations = ['Room1', 'Room2', 'Room3', 'Broom cabinet'];
            var groups = new vis.DataSet();
            for (var g = 0; g < locations.length; g++) {
                groups.add({id: g, content: locations[g]});
            }

            // create a dataset with items
            var items = new vis.DataSet(itemsToAdd);

            // create visualization
            var container = document.getElementById('visualization');
            var options = {
                locale: languageUtils.selectedLanguage(),
                stack: false,
                start: "2016-03-08T8:00:00",
                end: "2016-03-09T20:00:00",
                hiddenDates: [
                    {
                        start: "2016-03-08T00:00:01",
                        end: "2016-03-08T08:00:00",
                        repeat: "daily"
                    },
                    {
                        start: "2016-03-08T21:00:01",
                        end: "2016-03-09T00:00:00",
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
                    start: "2016-03-08T14:00:00",
                    end: "2016-03-09T21:00:00"
                });
            }

            // attach events to the navigation buttons
            document.getElementById('zoomIn').onclick    = function () { zoom(-0.2); };
            document.getElementById('zoomOut').onclick   = function () { zoom( 0.2); };
            document.getElementById('moveLeft').onclick  = function () { move( 0.2); };
            document.getElementById('moveRight').onclick = function () { move(-0.2); };
            document.getElementById('reset').onclick = function () { reset(); };

            hideLoading(500, 'dukeConSchedule');
        }

        return {
            initialize : initializeSchedule
        };
    });
