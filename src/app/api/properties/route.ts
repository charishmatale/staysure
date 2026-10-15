import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "OWNER") {
      return NextResponse.json({ error: "Unauthorized. Only PG owners can add listings." }, { status: 401 });
    }

    const ownerId = (session.user as any).id;
    const body = await req.json();

    if (body.action === "seed_samples") {
      // Create 3 realistic sample listings assigned specifically to this owner
      const sampleListings = [
        {
          name: `${session.user?.name || "Comfort"} Executive PG`,
          address: "Yendada",
          city: "Visakhapatnam",
          monthlyRent: 7500,
          genderPreference: "COED",
          roomType: "DOUBLE",
          facilities: JSON.stringify(["WiFi", "AC", "Meals", "Laundry", "Power Backup"]),
          foodAvailable: true,
          distance: 1.2,
          rating: 4.8,
          isVerified: "VERIFIED",
          ownerId,
          images: JSON.stringify(["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800"])
        },
        {
          name: `${session.user?.name || "Sunrise"} Boys Hostel`,
          address: "MVP Colony",
          city: "Visakhapatnam",
          monthlyRent: 6200,
          genderPreference: "BOYS",
          roomType: "TRIPLE",
          facilities: JSON.stringify(["WiFi", "Meals", "Security", "Parking"]),
          foodAvailable: true,
          distance: 0.8,
          rating: 4.6,
          isVerified: "VERIFIED",
          ownerId,
          images: JSON.stringify(["https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800"])
        },
        {
          name: `${session.user?.name || "Shree"} Luxury Girls PG`,
          address: "Ram Nagar",
          city: "Visakhapatnam",
          monthlyRent: 8500,
          genderPreference: "GIRLS",
          roomType: "SINGLE",
          facilities: JSON.stringify(["WiFi", "AC", "Meals", "Laundry", "Power Backup", "Security"]),
          foodAvailable: true,
          distance: 1.5,
          rating: 4.9,
          isVerified: "VERIFIED",
          ownerId,
          images: JSON.stringify(["https://images.unsplash.com/photo-1598928506311-c55dd1b31120?w=800"])
        }
      ];

      for (const item of sampleListings) {
        await prisma.property.create({ data: item });
      }

      return NextResponse.json({ success: true, message: "Sample properties created successfully!" });
    }

    // Normal property creation
    const {
      name,
      address,
      city = "Visakhapatnam",
      monthlyRent,
      genderPreference = "COED",
      roomType = "DOUBLE",
      facilities = [],
      foodAvailable = false,
      distance = 1.0,
      imageUrl
    } = body;

    if (!name || !address || !monthlyRent) {
      return NextResponse.json({ error: "Property name, location/address, and rent are required." }, { status: 400 });
    }

    const defaultImages = [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
      "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800",
      "https://images.unsplash.com/photo-1598928506311-c55dd1b31120?w=800"
    ];

    const property = await prisma.property.create({
      data: {
        name: name.trim(),
        address: address.trim(),
        city: city.trim(),
        monthlyRent: parseFloat(monthlyRent),
        genderPreference,
        roomType,
        facilities: JSON.stringify(Array.isArray(facilities) ? facilities : [facilities]),
        foodAvailable: Boolean(foodAvailable),
        distance: parseFloat(distance) || 1.0,
        rating: 5.0,
        isVerified: "VERIFIED",
        ownerId,
        images: JSON.stringify(imageUrl ? [imageUrl] : [defaultImages[Math.floor(Math.random() * defaultImages.length)]])
      }
    });

    return NextResponse.json({ success: true, property });
  } catch (error: any) {
    console.error("Error creating property:", error);
    return NextResponse.json({ error: "Failed to create property listing." }, { status: 500 });
  }
}
