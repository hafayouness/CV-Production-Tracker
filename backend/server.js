import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import excelRoutes from "./routes/excelRoutes.js";

const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:5173" }));
app.use(morgan("dev"));
app.use(express.json());

app.get("/api/health", (_req, res) =>
  res.json({
    success: true,
    message: "CV Declaration Generator API opérationnelle",
  }),
);
app.use("/api/excel", excelRoutes);

app.use((err, _req, res, _next) => {
  const status = err.status || (err.code === "LIMIT_FILE_SIZE" ? 413 : 500);
  res.status(status).json({
    success: false,
    message: err.message || "Erreur interne du serveur",
  });
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`API sur http://localhost:${port}`));
