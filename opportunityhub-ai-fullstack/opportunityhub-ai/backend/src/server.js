import "dotenv/config";
import app from "./app.js";

const port = Number(process.env.PORT || 4000);
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 24) {
  console.warn("WARNING: Set a strong JWT_SECRET (at least 24 characters) in your .env file.");
}
app.listen(port, () => console.log(`OpportunityHub AI API running at http://localhost:${port}`));
