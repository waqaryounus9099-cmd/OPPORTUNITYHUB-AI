import "dotenv/config";
import { Worker } from "bullmq";
import IORedis from "ioredis";
import { collectFromConfiguredSources } from "../services/collectorService.js";

const connection = new IORedis(process.env.REDIS_URL || "redis://localhost:6379", { maxRetriesPerRequest: null });

const worker = new Worker("opportunity-tasks", async (job) => {
  if (job.name === "collect-opportunities") return collectFromConfiguredSources();
  if (job.name === "send-alerts") return { processed: 0, message: "Configure email and browser push providers before enabling delivery." };
  return { skipped: true };
}, { connection });

worker.on("completed", job => console.log(`Completed task ${job.id}`));
worker.on("failed", (job, err) => console.error(`Task ${job?.id} failed`, err));
console.log("OpportunityHub background worker is ready.");
