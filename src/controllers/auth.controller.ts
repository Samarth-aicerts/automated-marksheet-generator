import { google } from "googleapis";
import { Request, Response } from "express";
import oauth2Client from "../config/google";
import User from "../models/User";

export const googleLogin = async (
    req: Request,
    res: Response
) => {

    const authUrl = oauth2Client.generateAuthUrl({
        access_type: "offline",
        scope: [
            "https://www.googleapis.com/auth/userinfo.email",
            "https://www.googleapis.com/auth/spreadsheets.readonly",
        ],
    });

    res.redirect(authUrl);

};

export const googleCallback = async (
    req: Request,
    res: Response
) => {

    const code = req.query.code as string;

    const { tokens } = await oauth2Client.getToken(code);

    oauth2Client.setCredentials(tokens);

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

    res.status(200).json({
        message: "Google Login Successful",
    });

};