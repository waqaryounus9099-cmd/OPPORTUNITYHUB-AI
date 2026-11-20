import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();
const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(10).max(100)
});
const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });

function issueToken(user) {
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
}
function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role, plan: user.plan, profile: user.profile };
}

router.post("/register", asyncHandler(async (req, res) => {
  const input = registerSchema.parse(req.body);
  const email = input.email.toLowerCase();
  if (await prisma.user.findUnique({ where: { email } })) return res.status(409).json({ error: "An account with this email already exists." });
  const passwordHash = await bcrypt.hash(input.password, 12);
  const user = await prisma.user.create({
    data: { name: input.name, email, passwordHash, profile: { create: {} } },
    include: { profile: true }
  });
  res.status(201).json({ token: issueToken(user), user: publicUser(user) });
}));

router.post("/login", asyncHandler(async (req, res) => {
  const input = loginSchema.parse(req.body);
  const user = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() }, include: { profile: true } });
  if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) return res.status(401).json({ error: "Invalid email or password." });
  res.json({ token: issueToken(user), user: publicUser(user) });
}));

export default router;
