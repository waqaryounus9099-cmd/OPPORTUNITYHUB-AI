import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();
router.use(requireAuth);

router.get("/", asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id }, include: { profile: true } });
  res.json({ id: user.id, name: user.name, email: user.email, plan: user.plan, role: user.role, profile: user.profile });
}));

router.patch("/profile", asyncHandler(async (req, res) => {
  const schema = z.object({
    name: z.string().min(2).max(80).optional(),
    country: z.string().max(100).optional(),
    headline: z.string().max(160).optional(),
    educationLevel: z.string().max(80).optional(),
    degree: z.string().max(120).optional(),
    fieldOfStudy: z.string().max(120).optional(),
    gpa: z.string().max(30).optional(),
    skills: z.array(z.string().max(50)).max(40).optional(),
    experienceYears: z.number().int().min(0).max(60).optional(),
    preferredCountries: z.array(z.string()).max(30).optional(),
    interests: z.array(z.string()).max(30).optional()
  });
  const input = schema.parse(req.body);
  const { name, ...profile } = input;
  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: {
      ...(name ? { name } : {}),
      profile: { upsert: { create: profile, update: profile } }
    },
    include: { profile: true }
  });
  res.json({ id: user.id, name: user.name, email: user.email, profile: user.profile });
}));

router.get("/saved", asyncHandler(async (req, res) => {
  const items = await prisma.savedOpportunity.findMany({
    where: { userId: req.user.id }, include: { opportunity: true }, orderBy: { createdAt: "desc" }
  });
  res.json(items);
}));

router.get("/notifications", asyncHandler(async (req, res) => {
  const items = await prisma.notification.findMany({ where: { userId: req.user.id }, orderBy: { createdAt: "desc" }, take: 50 });
  res.json(items);
}));

router.patch("/notifications/:id/read", asyncHandler(async (req, res) => {
  const result = await prisma.notification.updateMany({ where: { id: req.params.id, userId: req.user.id }, data: { readAt: new Date() } });
  res.json({ success: result.count > 0 });
}));

export default router;
