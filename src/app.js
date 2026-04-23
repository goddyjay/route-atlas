import express from "express";
import cors from "cors";
import helmet from "helmet";
import recommendationsRoutes from "./routes/recommendations.js";
import atlasRoutes from "./routes/atlas.js";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "Route Atlas API" });
});

app.use("/api/recommendations", recommendationsRoutes);
app.use("/api/atlas", atlasRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Internal server error" });
});

export default app;
