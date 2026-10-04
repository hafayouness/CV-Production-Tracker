import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { analyzeWorkbook } from "../services/excelReader.js";
import { transformPlanningToDeclaration } from "../services/declarationServices.js";
import { generateDeclarationExcel } from "../services/excelGenerator.js";
import { httpError } from "../utils/excelUtils.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const uploadDir = path.join(root, "uploads"),
  generatedDir = path.join(root, "generated");
const SAFE_ID = /^[a-f0-9]{32}\.xlsx$/;

const resolveUpload = async (fileId) => {
  if (!SAFE_ID.test(fileId || ""))
    throw httpError(400, "Identifiant de fichier invalide.");
  const p = path.join(uploadDir, fileId);
  await fs.access(p).catch(() => {
    throw httpError(
      404,
      "Fichier importé introuvable, veuillez le ré-importer.",
    );
  });
  return p;
};
const wrap = (fn) => (req, res, next) => fn(req, res).catch(next);

export const upload = wrap(async (req, res) => {
  if (!req.file) throw httpError(400, "Aucun fichier reçu.");
  res.json({
    success: true,
    fileId: req.file.filename,
    originalName: req.file.originalname,
  });
});

export const analyze = wrap(async (req, res) => {
  const p = await resolveUpload(req.body.fileId);
  res.json({
    success: true,
    data: await analyzeWorkbook(p, req.body.originalName || "planning.xlsx"),
  });
});

export const transform = wrap(async (req, res) => {
  const p = await resolveUpload(req.body.fileId);
  res.json({
    success: true,
    data: await transformPlanningToDeclaration(p, req.body.originalName || ""),
  });
});

export const generate = wrap(async (req, res) => {
  const p = await resolveUpload(req.body.fileId);
  const data = await transformPlanningToDeclaration(
    p,
    req.body.originalName || "",
  );
  const name = `Declaration_CV_${data.week}_${crypto.randomBytes(4).toString("hex")}.xlsx`;
  await generateDeclarationExcel(data, generatedDir, name);
  res.json({ success: true, filename: name });
});

export const download = wrap(async (req, res) => {
  const name = path.basename(req.params.filename);
  if (!/^Declaration_CV_[\w-]+\.xlsx$/.test(name))
    throw httpError(400, "Nom de fichier invalide.");
  res.download(path.join(generatedDir, name), name);
});
