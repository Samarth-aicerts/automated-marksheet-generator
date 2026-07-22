import { Router } from "express";
import { processRow } from "../controllers/marksheet.controller";

const router = Router();

router.post(
  "/process-row",
  processRow
);

export default router;  