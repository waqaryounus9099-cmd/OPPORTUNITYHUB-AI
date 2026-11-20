import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();
const querySchema = z.object({
  type: z.enum(["JOB", "SCHOLARSHIP"]).optional(),
  q: z.string().optional(),
  country: z.string().optional(),
  sort: z.enum(["newest", "deadline"]).default("newest"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12)
});

router.get("/", asyncHandler(async (req, res) => {
  const p = querySchema.parse(req.query);
  const where = {
    ...(p.type ? { type: p.type } : {}),
    ...(p.country ? { country: { contains: p.country, mode: "insensitive" } } : {}),
    ...(p.q ? { OR: [
      { title: { contains: p.q, mode: "insensitive" } },
      { organization: { contains: p.q, mode: "insensitive" } },
      { description: { contains: p.q, mode: "insensitive" } },
      { tags: { has: p.q } }
    ] } : {})
  };
  const orderBy = p.sort === "deadline" ? { deadline: "asc" } : { publishedAt: "desc" };
  const [items, total] = await Promise.all([
    prisma.opportunity.findMany({ where, orderBy, skip: (p.page - 1) * p.limit, take: p.limit }),
    prisma.opportunity.count({ where })
  ]);
  res.json({ items, total, page: p.page, pages: Math.ceil(total / p.limit) });
}));

router.get("/:id", asyncHandler(async (req, res) => {
  const item = await prisma.opportunity.findUnique({ where: { id: req.params.id } });
  if (!item) return res.status(404).json({ error: "Opportunity not found." });
  res.json(item);
}));

router.post("/:id/save", requireAuth, asyncHandler(async (req, res) => {
  const opportunity = await prisma.opportunity.findUnique({ where: { id: req.params.id } });
  if (!opportunity) return res.status(404).json({ error: "Opportunity not found." });
  const saved = await prisma.savedOpportunity.upsert({
    where: { userId_opportunityId: { userId: req.user.id, opportunityId: req.params.id } },
    create: { userId: req.user.id, opportunityId: req.params.id },
    update: {}
  });
  res.status(201).json(saved);
}));

router.delete("/:id/save", requireAuth, asyncHandler(async (req, res) => {
  await prisma.savedOpportunity.deleteMany({ where: { userId: req.user.id, opportunityId: req.params.id } });
  res.json({ success: true });
}));

export default router;
