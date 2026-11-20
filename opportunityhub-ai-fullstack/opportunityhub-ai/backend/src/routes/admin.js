import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();
router.use(requireAuth, requireAdmin);

router.get("/overview", asyncHandler(async (req, res) => {
  const [users, jobs, scholarships, applications, alerts, unverified] = await Promise.all([
    prisma.user.count(), prisma.opportunity.count({ where: { type: "JOB" } }),
    prisma.opportunity.count({ where: { type: "SCHOLARSHIP" } }),
    prisma.application.count(), prisma.alert.count(),
    prisma.opportunity.count({ where: { verificationStatus: "UNVERIFIED" } })
  ]);
  res.json({ users, jobs, scholarships, applications, alerts, unverified });
}));

router.get("/opportunities", asyncHandler(async (req, res) => {
  res.json(await prisma.opportunity.findMany({ orderBy: { createdAt: "desc" }, take: 100 }));
}));

router.patch("/opportunities/:id/verification", asyncHandler(async (req, res) => {
  const status = req.body.status;
  if (!["PENDING","VERIFIED","EXPIRED","REJECTED","UNVERIFIED"].includes(status)) return res.status(400).json({ error: "Invalid verification status." });
  const item = await prisma.opportunity.update({ where: { id: req.params.id }, data: { verificationStatus: status, lastCheckedAt: new Date() } });
  res.json(item);
}));

export default router;
