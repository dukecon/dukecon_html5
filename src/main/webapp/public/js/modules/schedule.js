define(['jquery', 'knockout', 'js/modules/talklist', 'js/modules/dukeconsettings', 'js/modules/offline',
		'js/modules/dukecon', 'js/modules/languageutils', 'js/modules/scheduleHelper', 'moment', 'vis'],
	function ($, ko, talklist, dukeconSettings, dukeconTalkUtils,
			  dukecon, languageUtils, helper) {
		"use strict";
		
		var sortTalksByStart = function (t1, t2) {
			if (t1.startSortable < t2.startSortable) {
				return -1;
			}
			return t1.startSortable > t2.startSortable ? 1 : 0;
		};
		
		var generateContentFromTemplate = function (talk, callback) {
			var tempNode = $('<talk-widget params="value: talk"></talk-widget>');
			ko.applyBindings({talk: talk}, tempNode[0]);
			setTimeout(function () {
				// applyBindings takes time, unfortunately. UGH
				// TODO: toggling favorites does not work. No idea how to solve it, click events to not get registered
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
				generateContentFromTemplate(data[i], function (markup, talk) {
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

			var firstStart = getFirstStartAsMoment(scheduleTalksModel.allTalks);
			var lastEnd = getLastEndAsMoment(scheduleTalksModel.allTalks);
			var options = helper.getOptions(firstStart, lastEnd);

			var container = document.getElementById('visualization');
			var timeline = new vis.Timeline(container);
			timeline.setOptions(options);
			timeline.setGroups(groups);
			
			generateTableItems(scheduleTalksModel.allTalks, function (itemArray) {
				timeline.setItems(new vis.DataSet(itemArray));
			});
			
			helper.registerButtonEvents(timeline);
		}
		
		function initializeSchedule() {
			var dukeconTalkscheduleModel = new talklist.TalkListViewModel();
			
			dukeconTalkscheduleModel.initializeForSchedule = function (allData) {
				console.log("TODO: re-insert filters, foldable like for mobile");
				dukeconTalkscheduleModel.commonInitializations(allData);
				drawTimeTable(dukeconTalkscheduleModel);
				hideLoading(globalLoadTimeout, "dukeConSchedule");
			};
			
			
			dukeconTalkUtils.reloadInPrivateMode.subscribe(function (value) {
				if (value) {
					dukeconTalkUtils.getData(dukeconTalkscheduleModel.initializeForSchedule);
				}
			});
			
			dukeconTalkUtils.getData(dukeconTalkscheduleModel.initializeForSchedule);
			ko.applyBindings(dukeconTalkscheduleModel);
			
		}
		
		return {
			initialize: initializeSchedule
		};
	});
