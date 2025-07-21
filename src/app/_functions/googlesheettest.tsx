import { google } from "googleapis";
import path from "path";

const GOOGLESHEETSCOPES = [
  "https://www.googleapis.com/auth/spreadsheets.readonly",
];
const auth = new google.auth.GoogleAuth({
  keyFile: path.join(process.cwd(), "intense-context-420720-de314f38336a.json"),
  scopes: GOOGLESHEETSCOPES,
});

export async function getGoogleSheetData(range: string) {
  /* const client = await auth.getClient(); */
  const sheets = google.sheets({ version: "v4", auth: auth });

  const data = await sheets.spreadsheets.values.get({
    spreadsheetId: "SPREADSHEETID",
    range: range,
  });

  return data.data.values;
}
