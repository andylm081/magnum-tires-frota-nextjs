import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const profile = await prisma.profile.findUnique({ where: { id: userId }});
  return NextResponse.json({ profile });
}

export async function POST(req: Request) {
  const data = await req.json();
  await prisma.profile.upsert({
    where: { id: data.id },
    create: data,
    update: data,
  });
  return NextResponse.json({});
}
