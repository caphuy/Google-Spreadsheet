'use strict';

const fs = require('fs'),
      readline = require('readline'),
      google = require('googleapis').google;
      
const OAuth2Client = google.auth.OAuth2,
      SCOPES = ['https://www.googleapis.com/auth/spreadsheets'],
      TOKEN_PATH = 'credentials.json',
      SPREADSHEET_ID = '1eH2lfZJDrjkJV9AJjsP_vLyEdpvtUmdfcEONtoYEUWE',
      DATA_TO_WRITE = [new Date().toISOString(), "Some value", "Another value"];

// readSpreadsheet();
// writeSpreadsheet();

/**
 * Read data from spreadsheet
 * 
 */
const readSpreadsheet = async function () {
  const content = fs.readFileSync('client_secret.json');
  const auth = await authorize(JSON.parse(content));
  const rows = await getData(auth);
  return rows;
}

/**
 * Write data to spreadsheet
 * 
 */
const writeSpreadsheet = async function () {
  const content = fs.readFileSync('client_secret.json');
  const auth = await authorize(JSON.parse(content));
  await writeData(auth);
}

/**
 * Get credentials
 * 
 * @param {*} credentials 
 * @param {*} callback 
 */
async function authorize(credentials) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new OAuth2Client(client_id, client_secret, redirect_uris[0]);
  const token = fs.readFileSync(TOKEN_PATH);
  if (token !== void(0) && token !== null) {
    oAuth2Client.setCredentials(JSON.parse(token));
  } else {
    return await getNewToken(oAuth2, callback);
  }
  return oAuth2Client;
}

/**
 * Get new token
 * 
 * @param {*} oAuth2Client 
 * @param {*} callback 
 */
async function getNewToken(oAuth2Client) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  const code = await rl.question('Enter the code from that page here: ');
  const token = await oAuth2Client.getToken(code, (err, token));
  oAuth2Client.setCredentials(token);
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
  console.log('Token stored to ', TOKEN_PATH);
  return oAuth2Client;
}

/**
 * Get data
 * 
 * @param {*} auth 
 */
function getData(auth) {
  return new Promise((resolve, reject) => {
    const sheets = google.sheets({version: 'v4', auth});
  
    sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Sheet1'
    }, (err, {data}) => {
      if (err) {
        reject(err);
      }
      const rows = data.values;
      resolve(rows);
      // if (rows.length) {
      //   rows.map((row) => {
      //     console.log(`${row[0]}, ${row[1]}, ${row[2]}`);
      //   });
      //   return rows;
      // } else {
      //   console.log('No data found');
      // }
    });
  })
  
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

module.exports = {
  readSpreadsheet: readSpreadsheet,
  writeSpreadsheet: writeSpreadsheet
}