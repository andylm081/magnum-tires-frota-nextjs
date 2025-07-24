import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const { token, senha } = await req.json();
  const invite = await prisma.invite.findUnique({ where: { token }});
  if (!invite) {
    return new Response(JSON.stringify({ error: "Token inválido" }), { status: 404 });
  }
  await prisma.user.create({
    data: {
      email:        invite.email,
      passwordHash: await hash(senha, 10),
      role:         invite.role,
    },
  });
  await prisma.invite.delete({ where: { id: invite.id }});
  return new Response(null, { status: 201 });
}
