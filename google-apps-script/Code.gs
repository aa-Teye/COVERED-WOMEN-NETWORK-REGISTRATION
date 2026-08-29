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

    // Check Admin Authentication (Accepts admin credentials or Master Admin PIN 2500)
    if (user !== ADMIN_USER && user !== "2500" && (user !== ADMIN_USER || pass !== ADMIN_PASS)) {
      return responseJSON({ status: 'ERROR', message: 'Invalid admin credentials' });
    }

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
