import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "STUDENT") {
      return NextResponse.json({ error: "Only logged-in students can submit reviews." }, { status: 401 });
    }

    const { propertyId, rating, comment } = await req.json();

    if (!propertyId || !rating || !comment) {
      return NextResponse.json({ error: "Property ID, rating (1-5), and comment are required." }, { status: 400 });
    }

    const numRating = Math.max(1, Math.min(5, Math.round(Number(rating))));
    const studentId = (session.user as any).id;

    // Create the review
    const review = await prisma.review.create({
      data: {
        propertyId,
        studentId,
        rating: numRating,
        comment: comment.trim()
      },
      include: {
        student: {
          select: { name: true, email: true }
        }
      }
    });

    // Update property rating average
    const allReviews = await prisma.review.findMany({
      where: { propertyId },
      select: { rating: true }
    });

    const averageRating = (
      allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
    ).toFixed(1);

    await prisma.property.update({
      where: { id: propertyId },
      data: { rating: parseFloat(averageRating) }
    });

    return NextResponse.json({ success: true, review, newAverageRating: parseFloat(averageRating) });
  } catch (error: any) {
    console.error("Error creating review:", error);
    return NextResponse.json({ error: "Failed to submit review." }, { status: 500 });
  }
}
