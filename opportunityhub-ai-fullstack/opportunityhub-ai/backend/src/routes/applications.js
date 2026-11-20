import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();
router.use(requireAuth);

router.get("/", asyncHandler(async (req, res) => {
  const items = await prisma.application.findMany({
    where: { userId: req.user.id }, include: { opportunity: true }, orderBy: { updatedAt: "desc" }
  });
  res.json(items);
}));

router.post("/", asyncHandler(async (req, res) => {
  const input = z.object({ opportunityId: z.string(), status: z.enum(["INTERESTED","PREPARING","APPLIED","ASSESSMENT","INTERVIEW","SHORTLISTED","ACCEPTED","REJECTED"]).optional() }).parse(req.body);
  const opportunity = await prisma.opportunity.findUnique({ where: { id: input.opportunityId } });
  if (!opportunity) return res.status(404).json({ error: "Opportunity not found." });
  const item = await prisma.application.upsert({
    where: { userId_opportunityId: { userId: req.user.id, opportunityId: input.opportunityId } },
    create: { userId: req.user.id, opportunityId: input.opportunityId, status: input.status || "INTERESTED" },
    update: { status: input.status || "INTERESTED" },
    include: { opportunity: true }
  });
  res.status(201).json(item);
}));

router.patch("/:id", asyncHandler(async (req, res) => {
  const input = z.object({
    status: z.enum(["INTERESTED","PREPARING","APPLIED","ASSESSMENT","INTERVIEW","SHORTLISTED","ACCEPTED","REJECTED"]).optional(),
    notes: z.string().max(3000).optional()
  }).parse(req.body);
  const item = await prisma.application.updateMany({ where: { id: req.params.id, userId: req.user.id }, data: input });
  if (!item.count) return res.status(404).json({ error: "Application not found." });
  res.json({ success: true });
}));

router.delete("/:id", asyncHandler(async (req, res) => {
  const item = await prisma.application.deleteMany({ where: { id: req.params.id, userId: req.user.id } });
  res.json({ success: item.count > 0 });
}));

export default router;
