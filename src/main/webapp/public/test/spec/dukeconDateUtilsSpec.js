define(['js/modules/dukecondateutils'], function(dukeconDateUtils) {
    describe("dukecon - Date Utils", function () {
        it("weekdays", function () {
            expect(dukeconDateUtils.weekDays.de).toEqual(["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"]);
            expect(dukeconDateUtils.weekDays.en).toEqual(["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]);
        });
        it("sortDays", function () {
            expect(dukeconDateUtils.sortDays("Montag", "Dienstag")).toBe(-1);
            expect(dukeconDateUtils.sortDays("Montag", "Mittwoch")).toBe(-1);
            expect(dukeconDateUtils.sortDays("Montag", "Donnerstag")).toBe(-1);
            expect(dukeconDateUtils.sortDays("Montag", "Freitag")).toBe(-1);
            expect(dukeconDateUtils.sortDays("Dienstag", "Mittwoch")).toBe(-1);
            expect(dukeconDateUtils.sortDays("Dienstag", "Donnerstag")).toBe(-1);
            expect(dukeconDateUtils.sortDays("Dienstag", "Freitag")).toBe(-1);
            expect(dukeconDateUtils.sortDays("Dienstag", "Montag")).toBe(1);
            expect(dukeconDateUtils.sortDays("Mittwoch", "Donnerstag")).toBe(-1);
            expect(dukeconDateUtils.sortDays("Mittwoch", "Freitag")).toBe(-1);
            expect(dukeconDateUtils.sortDays("Mittwoch", "Montag")).toBe(1);
            expect(dukeconDateUtils.sortDays("Mittwoch", "Dienstag")).toBe(1);
            expect(dukeconDateUtils.sortDays("Donnerstag", "Freitag")).toBe(-1);
            expect(dukeconDateUtils.sortDays("Donnerstag", "Montag")).toBe(1);
            expect(dukeconDateUtils.sortDays("Donnerstag", "Dienstag")).toBe(1);
            expect(dukeconDateUtils.sortDays("Donnerstag", "Mittwoch")).toBe(1);
            expect(dukeconDateUtils.sortDays("Freitag", "Montag")).toBe(1);
            expect(dukeconDateUtils.sortDays("Freitag", "Dienstag")).toBe(1);
            expect(dukeconDateUtils.sortDays("Freitag", "Mittwoch")).toBe(1);
            expect(dukeconDateUtils.sortDays("Freitag", "Donnerstag")).toBe(1);
        });
        it("getDisplayDate", function () {
            expect(dukeconDateUtils.getDisplayDate("2016-03-07T09:30")).toEqual("Montag, 07.03.");
            expect(dukeconDateUtils.getDisplayDate("2016-03-08T10:30")).toEqual("Dienstag, 08.03.");
            expect(dukeconDateUtils.getDisplayDate("2016-03-09T10:30")).toEqual("Mittwoch, 09.03.");
            expect(dukeconDateUtils.getDisplayDate("2016-03-10T10:30")).toEqual("Donnerstag, 10.03.");
            expect(dukeconDateUtils.getDisplayDate("2016-03-11T10:30")).toEqual("Freitag, 11.03.");
        });
        it("getDisplayTime", function () {
            expect(dukeconDateUtils.getDisplayTime("2016-03-07T09:00")).toEqual("09:00");
            expect(dukeconDateUtils.getDisplayTime("2016-03-07T09:30")).toEqual("09:30");
            expect(dukeconDateUtils.getDisplayTime("2016-03-07T10:00")).toEqual("10:00");
        });
        it("getDurationInMinutes", function () {
            expect(dukeconDateUtils.getDurationInMinutes("2016-03-07T09:00", "2016-03-07T09:20")).toBe(20);
            expect(dukeconDateUtils.getDurationInMinutes("2016-03-07T09:00", "2016-03-07T09:30")).toBe(30);
            expect(dukeconDateUtils.getDurationInMinutes("2016-03-07T09:00", "2016-03-07T09:40")).toBe(40);
            expect(dukeconDateUtils.getDurationInMinutes("2016-03-07T09:00", "2016-03-07T09:45")).toBe(45);
            expect(dukeconDateUtils.getDurationInMinutes("2016-03-07T09:00", "2016-03-07T10:10")).toBe(70);
        });
        it("getTimeCategory", function () {
            expect(dukeconDateUtils.getTimeCategory()).toEqual("regular");
            expect(dukeconDateUtils.getTimeCategory(0)).toEqual("short");
            expect(dukeconDateUtils.getTimeCategory(1)).toEqual("short");
            expect(dukeconDateUtils.getTimeCategory(30)).toEqual("short");
            expect(dukeconDateUtils.getTimeCategory(31)).toEqual("regular");
            expect(dukeconDateUtils.getTimeCategory(60)).toEqual("regular");
            expect(dukeconDateUtils.getTimeCategory(61)).toEqual("long");
        });
        it("addLeadingZero", function () {
            expect(dukeconDateUtils.addLeadingZero("00")).toEqual("00");
            expect(dukeconDateUtils.addLeadingZero("05")).toEqual("05");
            expect(dukeconDateUtils.addLeadingZero("10")).toEqual("10");
            expect(dukeconDateUtils.addLeadingZero(0)).toEqual("00");
            expect(dukeconDateUtils.addLeadingZero(5)).toEqual("05");
            expect(dukeconDateUtils.addLeadingZero(10)).toEqual("10");
        });
    });
});

