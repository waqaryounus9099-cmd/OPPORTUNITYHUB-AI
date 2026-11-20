import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateAssistantReply } from "../services/aiService.js";
import { prisma } from "../lib/prisma.js";

const router = Router();
router.use(requireAuth);

router.post("/chat", asyncHandler(async (req, res) => {
  const input = z.object({ message: z.string().min(2).max(5000), context: z.record(z.any()).optional() }).parse(req.body);
  const user = await prisma.user.findUnique({ where: { id: req.user.id }, include: { profile: true } });
  const reply = await generateAssistantReply({ message: input.message, context: { profile: user.profile, ...input.context } });
  res.json({ reply, provider: process.env.AI_PROVIDER || "mock" });
}));

router.post("/resume-review", asyncHandler(async (req, res) => {
  const input = z.object({ resumeText: z.string().min(30).max(15000), targetRole: z.string().max(120).optional() }).parse(req.body);
  const reply = await generateAssistantReply({
    message: `Review this resume for ${input.targetRole || "general roles"}. Give strengths, gaps, and concrete truthful improvements. Resume: ${input.resumeText}`,
    context: { task: "resume_review" }
  });
  res.json({ reply });
}));

router.post("/essay-outline", asyncHandler(async (req, res) => {
  const input = z.object({ prompt: z.string().min(10).max(3000), background: z.string().min(10).max(5000), wordLimit: z.number().int().min(100).max(5000).optional() }).parse(req.body);
  const reply = await generateAssistantReply({
    message: `Create an essay outline, not fabricated personal claims. Prompt: ${input.prompt}. Applicant background: ${input.background}. Word limit: ${input.wordLimit || "not specified"}.`,
    context: { task: "scholarship_essay" }
  });
  res.json({ reply });
}));

export default router;
