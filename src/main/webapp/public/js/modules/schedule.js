define(['jquery', 'knockout', 'js/modules/talklist', 'js/modules/dukeconsettings', 'js/modules/offline',
		'js/modules/dukecon', 'js/modules/languageutils', 'js/modules/scheduleHelper', 'moment', 'vis'],
	function ($, ko, talklist, dukeconSettings, dukeconTalkUtils,
			  dukecon, languageUtils, scheduleHelper) {
		"use strict";
		
		// helper for debug output
		var log = function (obj, extraText) {
			console.log((extraText || "") + JSON.stringify(obj, null, " "));
		};
		
		var sortTalksByStart = function (t1, t2) {
			if (t1.startSortable < t2.startSortable) {
				return -1;
			}
			return t1.startSortable > t2.startSortable ? 1 : 0;
		};
		
		var generateFromTemplate = function (talk, callback) {
			var tempNode = $('<talk-widget params="value: talk"></talk-widget>');
			ko.applyBindings({talk: talk}, tempNode[0]);
			setTimeout(function () {
				// applyBindings takes time, unfortunately. UGH
				callback(tempNode.html(), talk);
			}, 20);
		};
		
		var getFirstStartAsMoment = function (data) {
			if (data.length > 0) {
				data.sort(sortTalksByStart);
				return moment(data[0].startSortable);
			}
			return moment("2016-01-01T8:00:00");
		};
		
		var getLastEndAsMoment = function (data) {
			if (data.length > 0) {
				data.sort(sortTalksByStart);
				var lastTalk = data[data.length - 1];
				return moment(lastTalk.startSortable).add(moment.duration(lastTalk.duration || 0, 'minutes'));
			}
			return moment("2016-01-01T20:00:00");
		};
		
		var getTimeTableStart = function (startTimeAsMoment, endTimeAsMoment) {
			var currentTime = moment("2016-03-08T10:00:00"); // for testing, remove string arg later!
			return currentTime.isBetween(startTimeAsMoment, endTimeAsMoment) ? currentTime : startTimeAsMoment;
		};
		
		var getTimeTableEnd = function (startAsMoment, offsetHours) {
			var endTime = moment(startAsMoment);  // make a copy, because "add" function modifies original value!
			var offset = offsetHours || 4;
			if (screen.width <= 360) {
				offset = offset / 2;
			}
			return endTime.add(offset, 'hours');
		};
		
		var getOptions = function (allTalks) {
			var firstStart = getFirstStartAsMoment(allTalks);
			var lastEnd = getLastEndAsMoment(allTalks);
			var timetableStart = getTimeTableStart(firstStart, lastEnd);
			var timetableEnd = getTimeTableEnd(timetableStart);
			return {
				locale: languageUtils.selectedLanguage(),
				stack: true,
				min: firstStart.format(),
				start: timetableStart.format(),
				end: timetableEnd.format(),
				max: lastEnd.format(),
				moveable: true,
				zoomable: false,
				hiddenDates: [
					// these don't normally need to change because of the "repeat", so leave it hard-coded
					{
						start: "2016-01-01T20:00:00",
						end: "2016-01-02T07:59:59",
						repeat: "daily"
					}
				],
				editable: false,
				margin: {
					item: 1, // minimal margin between items
					axis: 1   // minimal margin between items and the axis
				},
				orientation: 'top'
			};
		};
		
		var generateLocations = function (data, visGroup) {
			// sort the rooms by their "order" field
			data.sort(function (a, b) {
				return a.order - b.order;
			});
			for (var g = 0; g < data.length; g++) {
				visGroup.add({id: data[g].id, content: data[g].names[languageUtils.selectedLanguage()]});
			}
		};
		
		var generateTableItems = function (data, callback) {
//            log(data);
			var tableItems = [];
			for (var i = 0; i < data.length; i++) {
				generateFromTemplate(data[i], function (markup, talk) {
					var tableItem = {
						id: talk.id,
						group: talk.location,
						content: markup,
						start: talk.startSortable,
						end: moment(talk.startSortable).add(moment.duration(talk.duration || 0, 'minutes')).format()
					};
					tableItems.push(tableItem);
					if (tableItems.length === data.length) {
						callback(tableItems);
					}
				});
			}
		};
		
		function drawTimeTable(scheduleTalksModel) {
			var groups = new vis.DataSet();
			generateLocations(scheduleTalksModel.metaData.locations, groups);
			
			// create a dataset with items
			// create visualization
			var container = document.getElementById('visualization');
			var options = getOptions(scheduleTalksModel.allTalks);
			var timeline = new vis.Timeline(container);
			timeline.setOptions(options);
			timeline.setGroups(groups);
			
			generateTableItems(scheduleTalksModel.allTalks, function (itemArray) {
				timeline.setItems(new vis.DataSet(itemArray));
			});
			
			function move(percentage) {
				var range = timeline.getWindow();
				var interval = range.end - range.start;
				
				timeline.setWindow({
					start: range.start.valueOf() - interval * percentage,
					end: range.end.valueOf() - interval * percentage
				});
			}
			
			function zoom(percentage) {
				var range = timeline.getWindow();
				var interval = range.end - range.start;
				
				timeline.setWindow({
					start: range.start.valueOf() - interval * percentage,
					end: range.end.valueOf() + interval * percentage
				});
			}
			
			function reset() {
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
					zoom(0.2);
				}
			);
			$('#moveLeft').on(
				"click",
				function () {
					move(0.4);
				}
			);
			$('#moveRight').on(
				"click",
				function () {
					move(-0.4);
				}
			);
			$('#reset').on(
				"click",
				function () {
					reset();
				}
			);
		}
		
		function initializeSchedule() {
			var dukeconTalkscheduleModel = new talklist.TalkListViewModel();
			
			dukeconTalkscheduleModel.initializeForSchedule = function (allData) {
				console.log("TODO: re-insert filters, foldable like for mobile");
				dukeconTalkscheduleModel.commonInitializations(allData);
				drawTimeTable(dukeconTalkscheduleModel);
				hideLoading(200, "dukeConSchedule");
			};
			
			
			dukeconTalkUtils.reloadInPrivateMode.subscribe(function (value) {
				if (value) {
					dukeconTalkUtils.getData(dukeconTalkUtils.jsonUrl, dukeconTalkscheduleModel.initializeForSchedule);
				}
			});
			
			dukeconTalkUtils.getData(dukeconTalkUtils.jsonUrl, dukeconTalkscheduleModel.initializeForSchedule);
			ko.applyBindings(dukeconTalkscheduleModel);
			
		}
		
		return {
			initialize: initializeSchedule
		};
	});
