/**
 * ==============================================================================
 * GOOGLE APPS SCRIPT FOR WOMEN'S PROPHETIC GATHERING (THE PROPHETIC WIFE 2026)
 * ==============================================================================
 */

var ADMIN_USER = "admin";
var ADMIN_PASS = "admin123";

function doGet(e) {
  try {
    var params = e.parameter || {};
    var user = params.username;
    var pass = params.password;
    var action = params.action;

    // Check Admin Authentication (Accepts admin credentials or Master Admin PIN 2500)
    if (user !== ADMIN_USER && user !== "2500" && (user !== ADMIN_USER || pass !== ADMIN_PASS)) {
      return responseJSON({ status: 'ERROR', message: 'Invalid admin credentials' });
    }

    // 1. Attendance Records Fetch
    if (action === "getAttendance" || action === "getWomensAttendance") {
      var attSheet = getOrCreateSheet("Attendance");
      var attData = attSheet.getDataRange().getValues();
      if (attData.length <= 1) {
        return responseJSON({ status: 'SUCCESS', attendance: [] });
      }

      var attRows = [];
      for (var a = 1; a < attData.length; a++) {
        var aRow = attData[a];
        attRows.push({
          id:             aRow[0] ? aRow[0].toString() : "",
          registrationId: aRow[1] ? aRow[1].toString() : "",
          name:           aRow[2] ? aRow[2].toString() : "",
          phone:          aRow[3] ? aRow[3].toString() : "",
          sessionDate:    aRow[4] ? aRow[4].toString() : "",
          isWalkin:       aRow[5] ? aRow[5].toString().toLowerCase() === "yes" : false,
          checkedInAt:    aRow[6] ? aRow[6].toString() : ""
        });
      }
      return responseJSON({ status: 'SUCCESS', attendance: attRows.reverse() });
    }

    // 2. Pre-Registrations Fetch (Default)
    var sheet = getOrCreateSheet("Registrations");
    var data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return responseJSON({ status: 'SUCCESS', registrations: [] });
    }

    var headers = data[0];
    var registrations = [];

    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var record = {};
      for (var j = 0; j < headers.length; j++) {
        record[headers[j]] = row[j];
      }
      registrations.push(record);
    }

    return responseJSON({ status: 'SUCCESS', registrations: registrations.reverse() });

  } catch (err) {
    return responseJSON({ status: 'ERROR', message: err.toString() });
  }
}

function doPost(e) {
  try {
    var contents = JSON.parse(e.postData.contents);

    // ── Handle Attendance Marking ──
    if (contents.action === "attendance" || contents.action === "womensAttendance") {
      var attSheet = getOrCreateSheet("Attendance");

      if (attSheet.getLastRow() === 0) {
        attSheet.appendRow([
          "id",
          "registrationId",
          "name",
          "phone",
          "sessionDate",
          "isWalkin",
          "checkedInAt"
        ]);
        attSheet.getRange("A1:G1").setFontWeight("bold");
      }

      var attRange = attSheet.getDataRange();
      var attValues = attRange.getValues();
      var targetRegId = (contents.registrationId || "").toString().trim();
      var targetName = (contents.name || "").toString().trim().toLowerCase();
      var targetDate = (contents.sessionDate || contents.day || "26th September, 2026").toString().trim();

      for (var ai = 1; ai < attValues.length; ai++) {
        var rowDate = attValues[ai][4] ? attValues[ai][4].toString().trim() : "";
        if (rowDate && targetDate && rowDate !== targetDate) continue;

        var rowRegId = attValues[ai][1] ? attValues[ai][1].toString().trim() : "";
        var rowName  = attValues[ai][2] ? attValues[ai][2].toString().trim().toLowerCase() : "";
        var isMatch = targetRegId ? (rowRegId === targetRegId) : (rowName === targetName);

        if (isMatch) {
          return responseJSON({ status: 'SUCCESS', message: 'Attendance already recorded', id: contents.id });
        }
      }

      attSheet.appendRow([
        contents.id || ("WATT-" + Math.floor(100000 + Math.random() * 900000)),
        contents.registrationId || "",
        contents.name || "",
        contents.phone || "",
        targetDate,
        contents.isWalkin ? "Yes" : "No",
        contents.checkedInAt || new Date().toISOString()
      ]);

      return responseJSON({ status: 'SUCCESS', message: 'Attendance recorded', id: contents.id });
    }

    // ── Handle Delete Attendance ──
    if (contents.action === "deleteAttendance" && contents.id) {
      var attSheet = getOrCreateSheet("Attendance");
      var dAttValues = attSheet.getDataRange().getValues();
      for (var dai = 1; dai < dAttValues.length; dai++) {
        if (dAttValues[dai][0].toString().trim() === contents.id.toString().trim()) {
          attSheet.deleteRow(dai + 1);
          return responseJSON({ status: 'SUCCESS', message: 'Attendance deleted' });
        }
      }
      return responseJSON({ status: 'ERROR', message: 'Attendance ID not found' });
    }

    // ── Pre-Registrations Sheet ──
    var sheet = getOrCreateSheet("Registrations");

    // Ensure headers exist
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "id",
        "registeredAt",
        "title",
        "fullName",
        "displayName",
        "phone",
        "email",
        "age",
        "memberStatus",
        "firstTimer",
        "attendanceMode",
        "location",
        "invitedBy",
        "referral",
        "prayerRequest"
      ]);
      sheet.getRange("A1:O1").setFontWeight("bold");
    }

    // Delete action
    if (contents.action === "delete" && contents.id) {
      var dValues = sheet.getDataRange().getValues();
      for (var dri = 1; dri < dValues.length; dri++) {
        if (dValues[dri][0].toString().trim() === contents.id.toString().trim()) {
          sheet.deleteRow(dri + 1);
          return responseJSON({ status: 'SUCCESS', message: 'Registration deleted' });
        }
      }
      return responseJSON({ status: 'ERROR', message: 'ID not found' });
    }

    // Prevent duplicate entries
    var regId = contents.id;
    if (regId) {
      var values = sheet.getDataRange().getValues();
      for (var i = 1; i < values.length; i++) {
        if (values[i][0].toString().trim() === regId.toString().trim()) {
          return responseJSON({ status: 'SUCCESS', message: 'Already synced' });
        }
      }
    }

    // Append new registration
    sheet.appendRow([
      contents.id || "",
      contents.registeredAt || new Date().toISOString(),
      contents.title || "",
      contents.fullName || "",
      contents.displayName || "",
      contents.phone || "",
      contents.email || "",
      contents.age || "",
      contents.memberStatus || "",
      contents.firstTimer || "",
      contents.attendanceMode || "",
      contents.location || "",
      contents.invitedBy || "",
      contents.referral || "",
      contents.prayerRequest || ""
    ]);

    return responseJSON({ status: 'SUCCESS', id: contents.id });

  } catch (err) {
    return responseJSON({ status: 'ERROR', message: err.toString() });
  }
}

function getOrCreateSheet(sheetName) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  return sheet;
}

function responseJSON(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
