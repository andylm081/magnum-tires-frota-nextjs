import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { token, senha } = req.body;
  const invite = await prisma.invite.findUnique({ where: { token }});
  if (!invite) return res.status(404).json({ error: "Token inválido" });

  await prisma.user.create({
    data: {
      email: invite.email,
      passwordHash: await hash(senha, 10),
      role: invite.role,
    }
  });
  await prisma.invite.delete({ where: { id: invite.id }});
  res.status(201).end();
}
