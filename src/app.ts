import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import googleSheetsRoutes from "./routes/googleSheets.routes";
import marksheetRoutes from "./routes/marksheet.routes";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/sheets", googleSheetsRoutes);

app.use(
  "/api/marksheet",
  marksheetRoutes
);

// Test Route
app.get("/", (req, res) => {
  res.send("🚀 Automated Marksheet Generator API is running...");
});

export default app;