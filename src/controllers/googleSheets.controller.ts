import { Request, Response } from "express";
import { google } from "googleapis";
import User from "../models/User";
import Spreadsheet from "../models/Spreadsheet";
import TemplateMapping from "../models/TemplateMapping";

interface AuthRequest extends Request {
  user?: {
    userId: string;
  };
}

export const getSpreadsheetList = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.userId;// validate if userId is present in the request object

    if (!userId) {
      return res.status(401).json({
        success: false,
        data: null,
        error: "Unauthorized",
      });
    }

    const user = await User.findById(userId);// fetch the user from the database using the userId

    if (!user) {
      return res.status(404).json({
        success: false,
        data: null,
        error: "User not found",
      });
    }

    const oauth2Client = new google.auth.OAuth2(  // create new auth2 clinent
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({ // set the credentials for the oauth2Client
  access_token: user.accessToken,
  refresh_token: user.refreshToken,
});

oauth2Client.on("tokens", async (tokens) => { // update the user's access and refresh tokens in the database
  if (tokens.access_token) {
    user.accessToken = tokens.access_token;
  }

  if (tokens.refresh_token) {
    user.refreshToken = tokens.refresh_token;
  }

  await user.save();
});

    const drive = google.drive({// create new drive client
      version: "v3",
      auth: oauth2Client,
    });


    const response = await drive.files.list({// list all the files in the user's Google Drive
      q: "mimeType='application/vnd.google-apps.spreadsheet'",
      fields: "files(id,name)",
    });


    return res.json({
      success: true,
      data: response.data.files,
      error: "",
    });

  } catch (error: any) {

    return res.status(500).json({
      success: false,
      data: null,
      error: error.message,
    });

  }
};


export const getWorksheets = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        data: null,
        error: "Unauthorized",
      });
    }

    const rawSpreadsheetId = req.params.spreadsheetId;// validate if spreadsheetId is present in the request parameters
    const spreadsheetId = Array.isArray(rawSpreadsheetId)
      ? rawSpreadsheetId[0]
      : rawSpreadsheetId;

    if (!spreadsheetId) {
      return res.status(400).json({
        success: false,
        data: null,
        error: "Spreadsheet ID is required",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        data: null,
        error: "User not found",
      });
    }


    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );


    oauth2Client.setCredentials({
      access_token: user.accessToken,
      refresh_token: user.refreshToken,
    });


    const sheets = google.sheets({
      version: "v4",
      auth: oauth2Client,
    });


    const response = await sheets.spreadsheets.get({// get the spreadsheet details using the spreadsheetId
      spreadsheetId,
    });


    const worksheets = response.data.sheets?.map((sheet) => ({// map the worksheets to an array of objects containing the sheetId and title
      id: sheet.properties?.sheetId,
      name: sheet.properties?.title,
    }));


    return res.json({
      success: true,
      data: worksheets,
      error: "",
    });


  } catch (error: any) {

    return res.status(500).json({
      success: false,
      data: null,
      error: error.message,
    });

  }
};


export const configureSpreadsheet = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        data: null,
        error: "Unauthorized",
      });
    }

    const {// destructure the request body to get the spreadsheetId, worksheetName and mappings
      spreadsheetId,
      worksheetName,
      mappings,
    } = req.body;


    if (!spreadsheetId || !worksheetName) {
      return res.status(400).json({
        success: false,
        data: null,
        error: "Spreadsheet ID and worksheet name are required",
      });
    }


    if (!mappings || !mappings.email) {
      return res.status(400).json({
        success: false,
        data: null,
        error: "Email mapping is required",
      });
    }


    const spreadsheet = await Spreadsheet.create({// create a new spreadsheet document in the database
      userId,
      spreadsheetId,
      worksheetName,
      status: "ACTIVE",
    });

    await TemplateMapping.create({// create a new template mapping document in the database
  spreadsheetId: spreadsheet._id,
  mappings,
});


    return res.status(201).json({
      success: true,
      data: spreadsheet,
      error: "",
    });


  } catch (error: any) {

    return res.status(500).json({
      success: false,
      data: null,
      error: error.message,
    });

  }
};