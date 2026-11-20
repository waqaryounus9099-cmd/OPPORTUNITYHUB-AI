import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/auth.js";
import opportunityRoutes from "./routes/opportunities.js";
import meRoutes from "./routes/me.js";
import applicationRoutes from "./routes/applications.js";
import alertRoutes from "./routes/alerts.js";
import aiRoutes from "./routes/ai.js";
import adminRoutes from "./routes/admin.js";

const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173" }));
app.use(express.json({ limit: "1mb" }));
app.use("/api", rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: true, legacyHeaders: false }));

app.get("/api/health", (req, res) => res.json({ status: "ok", service: "OpportunityHub AI API", timestamp: new Date().toISOString() }));
app.use("/api/auth", authRoutes);
app.use("/api/opportunities", opportunityRoutes);
app.use("/api/me", meRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/admin", adminRoutes);

app.use((req, res) => res.status(404).json({ error: "Route not found." }));
app.use((err, req, res, next) => {
  if (err.name === "ZodError") return res.status(400).json({ error: "Validation failed.", details: err.issues });
  console.error(err);
  res.status(500).json({ error: process.env.NODE_ENV === "production" ? "Something went wrong." : err.message });
});

export default app;
