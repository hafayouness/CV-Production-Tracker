import { Router } from "express";
import multer from "multer";
import crypto from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as ctrl from "../controllers/excelController.js";
import { httpError } from "../utils/excelUtils.js";

const dest = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "uploads",
);
const upload = multer({
  storage: multer.diskStorage({
    destination: dest,
    filename: (_r, _f, cb) =>
      cb(null, `${crypto.randomBytes(16).toString("hex")}.xlsx`),
  }),
  limits: {
    fileSize: (Number(process.env.MAX_FILE_SIZE_MB) || 15) * 1024 * 1024,
  },
  fileFilter: (_r, file, cb) =>
    path.extname(file.originalname).toLowerCase() === ".xlsx"
      ? cb(null, true)
      : cb(httpError(400, "Seuls les fichiers .xlsx sont acceptés.")),
});

const router = Router();
router.post("/upload", upload.single("file"), ctrl.upload);
router.post("/analyze", ctrl.analyze);
router.post("/transform", ctrl.transform);
router.post("/generate", ctrl.generate);
router.get("/download/:filename", ctrl.download);
export default router;
