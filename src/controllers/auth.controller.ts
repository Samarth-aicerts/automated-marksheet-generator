import { google } from "googleapis";
import { Request, Response } from "express";
import oauth2Client from "../config/google";
import User from "../models/User";
import generateToken from "../utils/generateToken";

export const googleLogin = async (
    req: Request,
    res: Response
) => {

    const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: [
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/spreadsheets.readonly",
        "https://www.googleapis.com/auth/drive.readonly",
    ],
});

    res.redirect(authUrl);

};

export const googleCallback = async (
    req: Request,
    res: Response
) => {

    const code = req.query.code as string;

    const { tokens } = await oauth2Client.getToken(code);//exchange temporary code for access and refresh tokens
    console.log(tokens);

    oauth2Client.setCredentials(tokens);// set the credentials for the oauth2Client to use in subsequent requests

    const oauth2 = google.oauth2({
        auth: oauth2Client,
        version: "v2",
    });

    const { data } = await oauth2.userinfo.get();

    const existingUser = await User.findOne({
        email: data.email || "",
    });

    if (!existingUser) {
        await User.create({
            email: data.email || "",
            googleId: data.id!,
            accessToken: tokens.access_token!,
            refreshToken: tokens.refresh_token!,
        });
    }
    else {
        existingUser.accessToken = tokens.access_token!;
        existingUser.refreshToken = tokens.refresh_token!;
        await existingUser.save();  
    }

    const user = existingUser
  ? existingUser
  : await User.findOne({ email: data.email });

const token = generateToken(user!._id.toString());

res.status(200).json({
  success: true,
  message: "Google Login Successful",
  token,
  user: {
    id: user!._id,
    email: user!.email,
  },
});

};