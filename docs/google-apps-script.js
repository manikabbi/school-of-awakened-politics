/**
 * =========================================================================
 * SCHOOL OF AWAKENED POLITICS (SAP) — GOOGLE SHEETS CRM & EMAIL SCRIPT
 * =========================================================================
 * 
 * SPREADSHEET: "SAP Submissions"
 * 
 * TABS AUTOMATICALLY MANAGED:
 * 1. "Applications"       — 1-Year Fellowship Applications
 * 2. "Manuscripts"        — Article Proposals, Essays & Whitepapers
 * 3. "Contact Inquiries"  — General & Institutional Inquiries
 * 4. "Civic Diagnostic Quiz" — Leadership Archetype Quiz Completions
 * 5. "Gazette Subscribers"— Newsletter Subscriptions
 * 
 * HOW TO UPDATE YOUR SCRIPT IN APPS SCRIPT:
 * 1. Open Google Sheets ("SAP Submissions")
 * 2. Click Extensions > Apps Script
 * 3. Replace all code with this file and click Save (💾).
 * 4. Click Deploy > Manage deployments > Click Edit (pencil icon) on active deployment.
 * 5. Under Version select "New version" and click Deploy!
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

    // ----------------------------------------------------
    // 1. FELLOWSHIP APPLICATIONS
    // ----------------------------------------------------
    if (formType === "application") {
      var sheet = getOrCreateSheet(ss, "Applications", [
        "Timestamp (IST)",
        "Ref ID",
        "Full Name",
        "Email",
        "Phone / WhatsApp",
        "Program Selected",
        "Civic Archetype (Quiz)",
        "Why Join & Vision of Politics",
        "Status"
      ]);

      sheet.appendRow([
        formattedDate,
        data.id || "SAP-" + Date.now().toString(36).toUpperCase(),
        data.fullName || "",
        data.email || "",
        (data.phone ? "'" + data.phone : ""),
        data.program || "",
        data.archetype || "Not taken",
        data.statement || "",
        "New Application"
      ]);

    // ----------------------------------------------------
    // 2. ARTICLE PROPOSALS & MANUSCRIPTS
    // ----------------------------------------------------
    } else if (formType === "article" || formType === "manuscript" || formType === "proposal") {
      var sheet = getOrCreateSheet(ss, "Manuscripts", [
        "Timestamp (IST)",
        "Ref ID",
        "Author Name",
        "Email",
        "Phone / WhatsApp",
        "Affiliation / Role",
        "Article Title",
        "Thematic Track",
        "Abstract / Synopsis",
        "Draft Link",
        "Status"
      ]);

      sheet.appendRow([
        formattedDate,
        data.id || data.refId || "SAP-PUB-" + Date.now().toString(36).toUpperCase(),
        data.fullName || data.name || "",
        data.email || "",
        (data.phone ? "'" + data.phone : ""),
        data.affiliation || data.role || "Independent",
        data.title || data.articleTitle || "",
        data.category || data.track || "General",
        data.abstract || data.statement || "",
        data.draftUrl || data.manuscriptUrl || "",
        "Under Editorial Review"
      ]);

    // ----------------------------------------------------
    // 3. CONTACT INQUIRIES
    // ----------------------------------------------------
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
        (data.phone ? "'" + data.phone : ""),
        data.program || "General Inquiry",
        data.statement || data.message || "",
        "New Inquiry"
      ]);

    // ----------------------------------------------------
    // 4. CIVIC DIAGNOSTIC QUIZ
    // ----------------------------------------------------
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

    // ----------------------------------------------------
    // 5. GAZETTE SUBSCRIBERS
    // ----------------------------------------------------
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

    // ----------------------------------------------------
    // EMAIL NOTIFICATION BACKUP VIA MAILAPP
    // ----------------------------------------------------
    try {
      var adminEmail = "info@schoolofawakenedpolitics.org";
      var mailSubject = "";
      var mailBody = "";

      if (formType === "application") {
        mailSubject = "New SAP Fellowship Application [" + (data.id || "NEW") + "]: " + (data.fullName || "Applicant") + (data.archetype ? " (" + data.archetype + ")" : "");
        mailBody = "New Fellowship Application Received\n\n" +
          "Reference ID: " + (data.id || "") + "\n" +
          "Timestamp (IST): " + formattedDate + "\n" +
          "Applicant Name: " + (data.fullName || "") + "\n" +
          "Email: " + (data.email || "") + "\n" +
          "Phone / WhatsApp: " + (data.phone || "") + "\n" +
          "Program: " + (data.program || "") + "\n" +
          "Civic Archetype: " + (data.archetype || "Not taken") + "\n\n" +
          "Why Join & Vision of Politics:\n" + (data.statement || "") + "\n\n" +
          "--\nRecorded in SAP Submissions Google Sheet (Applications tab).";
      } else if (formType === "article" || formType === "manuscript" || formType === "proposal") {
        mailSubject = "New Article Proposal [" + (data.id || data.refId || "SAP-PUB") + "]: " + (data.title || "Proposal") + " by " + (data.fullName || "Author");
        mailBody = "New Article / Manuscript Proposal Received\n\n" +
          "Reference ID: " + (data.id || data.refId || "") + "\n" +
          "Timestamp (IST): " + formattedDate + "\n" +
          "Author Name: " + (data.fullName || "") + "\n" +
          "Email: " + (data.email || "") + "\n" +
          "Phone / WhatsApp: " + (data.phone || "") + "\n" +
          "Affiliation / Role: " + (data.affiliation || "Independent") + "\n" +
          "Article Title: " + (data.title || "") + "\n" +
          "Thematic Track: " + (data.category || "") + "\n" +
          "Draft Link: " + (data.draftUrl || "None provided") + "\n\n" +
          "Abstract / Synopsis:\n" + (data.abstract || data.statement || "") + "\n\n" +
          "--\nRecorded in SAP Submissions Google Sheet (Manuscripts tab).";
      } else if (formType === "contact") {
        mailSubject = "New SAP Contact Inquiry: " + (data.fullName || "Visitor");
        mailBody = "New Contact Inquiry Received\n\n" +
          "Timestamp (IST): " + formattedDate + "\n" +
          "Name: " + (data.fullName || "") + "\n" +
          "Email: " + (data.email || "") + "\n" +
          "Phone: " + (data.phone || "") + "\n" +
          "Inquiry Area: " + (data.program || "General") + "\n\n" +
          "Message:\n" + (data.statement || data.message || "") + "\n\n" +
          "--\nRecorded in SAP Submissions Google Sheet (Contact Inquiries tab).";
      } else if (formType === "newsletter") {
        mailSubject = "New SAP Gazette Subscriber: " + (data.email || "");
        mailBody = "New subscriber registered for the SAP Gazette:\n\nEmail: " + (data.email || "") + "\nTimestamp: " + formattedDate + " (IST)\n\n--\nRecorded in SAP Submissions Google Sheet (Gazette Subscribers tab).";
      }

      if (mailSubject && mailBody) {
        MailApp.sendEmail({
          to: adminEmail,
          subject: mailSubject,
          body: mailBody,
          replyTo: data.email || undefined
        });
      }
    } catch (mailErr) {
      Logger.log("MailApp notice: " + mailErr.toString());
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
