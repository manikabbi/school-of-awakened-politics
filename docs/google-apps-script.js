/**
 * =========================================================================
 * SCHOOL OF AWAKENED POLITICS (SAP) — GOOGLE SHEETS CRM BACKEND SCRIPT
 * =========================================================================
 * 
 * HOW TO SET THIS UP (Takes 2 minutes):
 * 1. Open Google Sheets (https://sheets.new) and name it:
 *    "SAP Admissions & Community CRM"
 * 2. In the top menu, click Extensions > Apps Script.
 * 3. Delete any default code in Code.gs, paste this ENTIRE file, and click Save (💾).
 * 4. Click the blue "Deploy" button (top right) > "New deployment".
 * 5. Under "Select type" (gear icon), select "Web app".
 * 6. Set:
 *    - Description: "SAP CRM Webhook"
 *    - Execute as: "Me"
 *    - Who has access: "Anyone" (CRITICAL for receiving form submissions from your website)
 * 7. Click "Deploy", authorize access with your Google account, and COPY the Web App URL (ends with /exec).
 * 8. On your SAP website, open the Admin Ledger (press Ctrl + Shift + A or click "Admin Ledger" in the Application modal), paste your Web App URL, and click "Save Webhook"!
 * 
 * Future submissions from Apply, Contact, and Quiz will instantly appear here!
 * =========================================================================
 */

function doPost(e) {
  try {
    var raw = e.postData ? e.postData.contents : null;
    if (!raw) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "error",
        message: "No post data received"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var data = JSON.parse(raw);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var formType = data.formType || (data.program ? "application" : (data.subject ? "contact" : "general"));
    var now = new Date();
    var formattedDate = Utilities.formatDate(now, "Asia/Kolkata", "yyyy-MM-dd HH:mm:ss");

    if (formType === "application") {
      var sheet = getOrCreateSheet(ss, "Applications", [
        "Timestamp (IST)",
        "Ref ID",
        "Full Name",
        "Email",
        "Phone / WhatsApp",
        "Program Selected",
        "Civic Archetype (Quiz)",
        "Statement of Purpose",
        "Status"
      ]);

      sheet.appendRow([
        formattedDate,
        data.id || "SAP-" + Date.now().toString(36).toUpperCase(),
        data.fullName || "",
        data.email || "",
        data.phone || "",
        data.program || "",
        data.archetype || "Not taken",
        data.statement || "",
        "New Application"
      ]);
    } else if (formType === "contact") {
      var sheet = getOrCreateSheet(ss, "Contact Inquiries", [
        "Timestamp (IST)",
        "Full Name",
        "Email",
        "Phone",
        "Inquiry Area",
        "Message",
        "Status"
      ]);

      sheet.appendRow([
        formattedDate,
        data.fullName || "",
        data.email || "",
        data.phone || "",
        data.program || "General Inquiry",
        data.statement || data.message || "",
        "New Inquiry"
      ]);
    } else if (formType === "quiz") {
      var sheet = getOrCreateSheet(ss, "Civic Diagnostic Quiz", [
        "Timestamp (IST)",
        "Full Name / Email",
        "Dominant Archetype",
        "Recommended Pathway",
        "Status"
      ]);

      sheet.appendRow([
        formattedDate,
        data.email || data.fullName || "Anonymous Participant",
        data.archetype || "",
        data.program || "",
        "Completed"
      ]);
    } else if (formType === "newsletter") {
      var sheet = getOrCreateSheet(ss, "Gazette Subscribers", [
        "Timestamp (IST)",
        "Email Address",
        "Status"
      ]);

      sheet.appendRow([
        formattedDate,
        data.email || "",
        "Subscribed"
      ]);
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Data recorded successfully in SAP CRM!"
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "online",
    service: "School of Awakened Politics (SAP) CRM Webhook Endpoint",
    time: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

function getOrCreateSheet(ss, sheetName, headers) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(headers);
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground("#0b192c");
    headerRange.setFontColor("#f59e0b");
    headerRange.setFontWeight("bold");
    sheet.setFrozenRows(1);
    for (var i = 1; i <= headers.length; i++) {
      sheet.autoResizeColumn(i);
    }
  }
  return sheet;
}
