/**
 * ==============================================================================
 * GOOGLE APPS SCRIPT FOR WOMEN'S PROPHETIC GATHERING (THE PROPHETIC WIFE 2026)
 * ==============================================================================
 * 
 * INSTRUCTIONS TO DEPLOY:
 * 1. Open Google Sheets (create a new blank spreadsheet named "Women's Prophetic Gathering Registrations").
 * 2. Click Extensions > Apps Script.
 * 3. Delete any code in Code.gs and paste this entire file.
 * 4. Click Save (disk icon).
 * 5. Click Deploy > New deployment.
 * 6. Select type: "Web app".
 * 7. Set:
 *    - Description: "WPG Database API"
 *    - Execute as: "Me"
 *    - Who has access: "Anyone" (CRITICAL: Must be "Anyone" so the app can post registrations without login)
 * 8. Click Deploy, authorize access, and COPY the Web App URL.
 * 9. Paste the Web App URL into `src/data/eventData.js` for GOOGLE_SHEET_SCRIPT_URL.
 */

var ADMIN_USER = "admin";
var ADMIN_PASS = "admin123"; // You can change your admin password here

function doGet(e) {
  try {
    var params = e.parameter || {};
    var action = params.action;
    var user = params.username;
    var pass = params.password;

    // Check Admin Authentication
    if (user !== ADMIN_USER || pass !== ADMIN_PASS) {
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
