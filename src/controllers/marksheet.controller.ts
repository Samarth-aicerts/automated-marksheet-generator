import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";
import nodemailer from "nodemailer";
import TemplateMapping from "../models/TemplateMapping";
import Spreadsheet from "../models/Spreadsheet";

export const processRow = async (req: Request, res: Response) => {
  try {
    const { spreadsheetId, studentData } = req.body;

    if (!spreadsheetId || !studentData) {
      return res.status(400).json({
        success: false,
        data: null,
        error: "Invalid payload",
      });
    }

    // 1️ Find spreadsheet config
    const spreadsheet = await Spreadsheet.findOne({ spreadsheetId });
    if (!spreadsheet) {
      return res.status(404).json({
        success: false,
        data: null,
        error: "Spreadsheet not configured",
      });
    }

    // 2️ Load TemplateMapping
    const templateMapping = await TemplateMapping.findOne({
      spreadsheetId: spreadsheet._id,
    });
    if (!templateMapping) {
      return res.status(404).json({
        success: false,
        data: null,
        error: "Template mapping not found",
      });
    }

    // 3️ Read HTML template
    const templatePath = path.join(
      __dirname,
      "../templates/marksheetTemplate.html"
    );
    let html = fs.readFileSync(templatePath, "utf-8");

    // 4️ Replace placeholders with actual data of student
    for (const key in templateMapping.mappings) {
      const placeholder = templateMapping.mappings[key];
      const value = studentData[placeholder] || "";
      html = html.replace(new RegExp(`{{${key}}}`, "g"), value);// replace all occurrences of the placeholder with the actual value 
    }

    // 5️ Generate PDF
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "domcontentloaded" });
    const pdfBuffer = await page.pdf({ format: "A4" });
    await browser.close();

    // 6️ Send Email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "samarthpatel8596@gmail.com", // your Gmail
        pass: "vepytfshfxroihze", // App Password
      },
    });

    await transporter.sendMail({
      from: '"Marksheet System" <samarthpatel8596@gmail.com>',
      to: studentData[templateMapping.mappings.email],
      subject: "Your Marksheet",
      text: "Please find attached your marksheet PDF.",
      attachments: [{ filename: "marksheet.pdf", content: Buffer.from(pdfBuffer) }],
    });

    return res.json({
      success: true,
      data: { message: "Marksheet processed and emailed successfully" },
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