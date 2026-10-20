/**
 * CAPTR creator application handler.
 * POST JSON -> append row to Google Sheet, save screenshots to Drive, email notification.
 */
var SHEET_ID = '1v5HMACkpo7L2VMHwHhOa1lwEx_a5c1Ge21pKVgTwA5g';
var FOLDER_ID = '1P40HCiZQ8-u_3wGGC_o6Sy2EMT10jAdo';
var NOTIFY_EMAIL = 'captrmarketingagency@gmail.com';

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) return out({ ok: false, error: 'empty body' });
    var data = JSON.parse(e.postData.contents);

    // spam: honeypot field filled -> pretend success, do nothing
    if (data.website) return out({ ok: true });
    // spam: impossibly fast fill (<4s) -> reject
    if (typeof data.elapsed_s === 'number' && data.elapsed_s < 4) return out({ ok: false, error: 'too fast' });

    var required = ['name', 'instagram', 'followers', 'content_type', 'city', 'whatsapp', 'email'];
    for (var i = 0; i < required.length; i++) {
      if (!data[required[i]] || !String(data[required[i]]).trim()) return out({ ok: false, error: 'missing ' + required[i] });
    }

    var insightsUrl = saveImage(data.insights_file, data.instagram + '-insights');
    if (data.insights_file && !insightsUrl) return out({ ok: false, error: 'insights upload failed' });
    var demoUrl = saveImage(data.demographics_file, data.instagram + '-demographics');

    var sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Sheet1');
    sheet.appendRow([
      new Date(),
      data.name || '',
      data.instagram || '',
      data.ig_link || '',
      data.other_platforms || '',
      data.followers || '',
      data.avg_views || '',
      data.engagement || '',
      data.content_type || '',
      data.city || '',
      data.languages || '',
      data.collabs || '',
      data.whatsapp || '',
      data.email || '',
      data.consent || '',
      insightsUrl || '',
      demoUrl || ''
    ]);

    MailApp.sendEmail(NOTIFY_EMAIL,
      'New creator application: ' + data.name + ' (' + data.instagram + ')',
      'New application on the CAPTR site:\n\n' +
      'Name: ' + data.name + '\nInstagram: ' + data.instagram + '\nFollowers: ' + data.followers +
      '\nContent type: ' + data.content_type + '\nCity: ' + data.city + '\nWhatsApp: ' + data.whatsapp +
      '\nEmail: ' + data.email + '\nInsights screenshot: ' + (insightsUrl || 'not attached') +
      '\nDemographics screenshot: ' + (demoUrl || 'not attached') +
      '\n\nAll applications: https://docs.google.com/spreadsheets/d/' + SHEET_ID);

    return out({ ok: true });
  } catch (err) {
    return out({ ok: false, error: String(err) });
  }
}

function saveImage(file, baseName) {
  if (!file || !file.data) return '';
  try {
    var parts = String(file.data).split(',');
    if (parts.length < 2) return '';
    var mime = (parts[0].match(/data:(.*?);/) || [])[1] || 'image/jpeg';
    var ext = mime.indexOf('png') >= 0 ? '.png' : '.jpg';
    var blob = Utilities.newBlob(Utilities.base64Decode(parts[1]), mime,
      baseName.replace(/[^a-z0-9@._-]/gi, '_') + '-' + Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyyyMMdd-HHmmss') + ext);
    var f = DriveApp.getFolderById(FOLDER_ID).createFile(blob);
    f.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return f.getUrl();
  } catch (err) {
    return '';
  }
}

function out(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
