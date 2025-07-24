import { getSession } from "next-auth/react";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
import emailjs from "@emailjs/nodejs";

emailjs.init({
  publicKey: process.env.EMAILJS_PUBLIC_KEY,
  privateKey: process.env.EMAILJS_PRIVATE_KEY,
});

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const session = await getSession({ req });
  if (session?.user.role !== "admin") return res.status(403).json({ error: "Acesso negado" });

  const { email, role } = req.body;
  const token = crypto.randomUUID();
  await prisma.invite.create({ data: { email, role, token } });

  // envia e-mail com link de convite
  await emailjs.send("service_slh4yoh","template_yzdk3nq", {
    to_email:   email,
    invite_link: `${process.env.NEXTAUTH_URL}/signup?token=${token}`,
  });

  return res.status(200).json({ message: "Convite enviado" });
}
