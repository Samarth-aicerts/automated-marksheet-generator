import { Router } from "express";
import { 
  getSpreadsheetList,
  getWorksheets,
  configureSpreadsheet
} from "../controllers/googleSheets.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.get(
  "/list",
  authenticate,
  getSpreadsheetList
);

router.get(
  "/:spreadsheetId/worksheets",
  authenticate,
  getWorksheets
);

router.post(
  "/configure",
  authenticate,
  configureSpreadsheet
);

export default router;