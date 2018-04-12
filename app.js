'use strict';

const fs = require('fs'),
      readline = require('readline'),
      google = require('googleapis').google;
      
const OAuth2Client = google.auth.OAuth2,
      SCOPES = ['https://www.googleapis.com/auth/spreadsheets'],
      TOKEN_PATH = 'credentials.json',
      SPREADSHEET_ID = '1eH2lfZJDrjkJV9AJjsP_vLyEdpvtUmdfcEONtoYEUWE',
      DATA_TO_WRITE = [new Date().toISOString(), "Some value", "Another value"];

readSpreadsheet();
// writeSpreadsheet();

/**
 * Read data from spreadsheet
 * 
 */
function readSpreadsheet() {
  fs.readFile('client_secret.json', (err, content) => {
    if (err) {
      return console.log('Error loading client secret file: ', err);
    }
    authorize(JSON.parse(content), getData);
  });
}

/**
 * Write data to spreadsheet
 * 
 */
function writeSpreadsheet() {
  fs.readFile('client_secret.json', (err, content) => {
    if (err) {
      return console.log('Error loading client secret file: ', err);
    }
    authorize(JSON.parse(content), writeData);
  });
}

/**
 * Get credentials
 * 
 * @param {*} credentials 
 * @param {*} callback 
 */
function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new OAuth2Client(client_id, client_secret, redirect_uris[0]);
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err || token === void(0)) {
      return getNewToken(oAuth2, callback);
    }
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

/**
 * Get new token
 * 
 * @param {*} oAuth2Client 
 * @param {*} callback 
 */
function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) {
        return callback(err);
      }
      oAuth2Client.setCredentials(token);
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) {
          consolse.log(err);
        }
        console.log('Token stored to ', TOKEN_PATH);
      });
      callback(oAuth2Client);
    })
    
  });
}

/**
 * Get data
 * 
 * @param {*} auth 
 */
function getData(auth) {
  const sheets = google.sheets({version: 'v4', auth});
  sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: 'Sheet1'
  }, (err, {data}) => {
    if (err) {
      return console.log('The API returned an error: ' + err);
    }
    const rows = data.values;
    if (rows.length) {
      rows.map((row) => {
        console.log(`${row[0]}, ${row[1]}, ${row[2]}`);
      });
    } else {
      console.log('No data found');
    }
  });
}

/**
 * Write data
 * @param {*} auth 
 */
function writeData(auth) {
  const sheets = google.sheets({version: 'v4', auth});
  sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: 'Sheet1',
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    resource: {
      values: [
        DATA_TO_WRITE
      ],
    },
    auth: auth
  }, (err, response) => {
    if (err) {
      console.log(err);
    } else {
      console.log('Done');
    }
  })
}

