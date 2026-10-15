import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "STUDENT") {
    return NextResponse.json({ error: "Only logged-in students can book rooms." }, { status: 401 });
  }

  const { propertyId } = await req.json();
  const studentId = (session.user as any).id;

  // Prevent duplicate booking requests from the same student for the same property
  const existing = await prisma.booking.findFirst({
    where: { propertyId, studentId }
  });

  if (existing) {
    return NextResponse.json(
      { error: "You have already submitted a booking request for this property." },
      { status: 400 }
    );
  }

  const booking = await prisma.booking.create({
    data: {
      propertyId,
      studentId,
      status: "Pending"
    }
  });

  return NextResponse.json(booking);
}
