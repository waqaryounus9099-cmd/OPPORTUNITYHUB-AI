import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();
router.use(requireAuth);

router.get("/", asyncHandler(async (req, res) => {
  res.json(await prisma.alert.findMany({ where: { userId: req.user.id }, orderBy: { createdAt: "desc" } }));
}));

router.post("/", asyncHandler(async (req, res) => {
  const input = z.object({
    name: z.string().min(2).max(100),
    keywords: z.string().max(200).optional(),
    type: z.enum(["ALL","JOB","SCHOLARSHIP"]).default("ALL"),
    country: z.string().max(100).optional(),
    minMatch: z.number().int().min(0).max(100).default(70),
    frequency: z.enum(["INSTANT","DAILY","WEEKLY"]).default("DAILY"),
    emailEnabled: z.boolean().default(true),
    browserEnabled: z.boolean().default(false)
  }).parse(req.body);
  res.status(201).json(await prisma.alert.create({ data: { ...input, userId: req.user.id } }));
}));

router.patch("/:id", asyncHandler(async (req, res) => {
  const input = z.object({ active: z.boolean().optional(), emailEnabled: z.boolean().optional(), browserEnabled: z.boolean().optional() }).parse(req.body);
  const result = await prisma.alert.updateMany({ where: { id: req.params.id, userId: req.user.id }, data: input });
  res.json({ success: result.count > 0 });
}));

router.delete("/:id", asyncHandler(async (req, res) => {
  const result = await prisma.alert.deleteMany({ where: { id: req.params.id, userId: req.user.id } });
  res.json({ success: result.count > 0 });
}));

export default router;
