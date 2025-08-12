// Google Apps Script for Bug/Request Reporting
//
// --- SETUP INSTRUCTIONS ---
// 1. Create a new Google Sheet to store the reports.
// 2. Open the Sheet and go to Extensions > Apps Script.
// 3. Delete any boilerplate code in the editor and paste this entire script.
// 4. IMPORTANT: Replace 'YOUR_SPREADSHEET_ID_HERE' below with the actual ID of your Google Sheet.
//    You can find the ID in your Sheet's URL: https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
// 5. Save the script project (File > Save or Ctrl+S).
// 6. Click the 'Deploy' button > 'New deployment'.
// 7. In the 'Select type' dropdown (gear icon), choose 'Web app'.
// 8. For 'Who has access', select 'Anyone'. 
//    (NOTE: This makes your script endpoint public. If this is for internal company use, 'Anyone within [Your Organization]' is safer if available).
// 9. Click 'Deploy'.
// 10. Authorize the script when prompted.
// 11. Copy the 'Web app URL' provided.
// 12. Paste this URL into the `BUG_REPORT_SCRIPT_URL` constant in your application's `constants.ts` file.

const SPREADSHEET_ID = "1cobVuy6jLqtJl0pfbrOadLNXgOP_Nfq7TDHUPEyL0Ck"; // <-- IMPORTANT: REPLACE THIS
const SHEET_NAME = "シート1";

/**
 * Handles HTTP POST requests to the web app.
 * @param {Object} e - The event parameter containing the POST data.
 * @returns {ContentService.TextOutput} - A JSON response indicating success or failure.
 */
function doPost(e) {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = spreadsheet.getSheetByName(SHEET_NAME);
    
    // If the sheet doesn't exist, create it and add headers.
    if (!sheet) {
      sheet = spreadsheet.insertSheet(SHEET_NAME);
      sheet.appendRow(["タイムスタンプ", "報告者(AP名)", "報告内容", "入力データ(JSON)"]);
      // Optional: Freeze the header row and make it bold
      sheet.setFrozenRows(1);
      sheet.getRange("A1:D1").setFontWeight("bold");
    }

    // Parse the JSON data from the request body
    const data = JSON.parse(e.postData.contents);
    
    const timestamp = new Date();
    const apName = data.apName || 'N/A';
    const reportText = data.reportText || '';
    const formDataJson = data.currentFormData || '{}';
    
    // Append the data as a new row in the sheet
    sheet.appendRow([timestamp, apName, reportText, formDataJson]);
    
    // Return a success response
    return ContentService
      .createTextOutput(JSON.stringify({ "result": "success" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    // Log the error for debugging
    console.error("Error in doPost:", error);
    
    // Return an error response
    return ContentService
      .createTextOutput(JSON.stringify({ "result": "error", "message": error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}