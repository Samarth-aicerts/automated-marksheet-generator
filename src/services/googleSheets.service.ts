import { google } from "googleapis";
import oauth2Client from "../config/google";
import User from "../models/User";

const sheets = google.sheets({
  version: "v4",
  auth: oauth2Client,
});

export const readSheet = async () => {
  const user = await User.findOne();

  if (!user) {
    throw new Error("No user found");
  }

  oauth2Client.setCredentials({
    access_token: user.accessToken,
    refresh_token: user.refreshToken,
  });

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.SPREADSHEET_ID!,
    range: "Sheet1!A:D",
  });

  return response.data.values;
};  