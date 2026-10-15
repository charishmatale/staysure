import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { name, email, password, role } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Please fill in all required fields (Name, Email, Password)." }, { status: 400 });
    }

    if (password.length < 4) {
      return NextResponse.json({ error: "Password must be at least 4 characters long." }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedRole = role === "OWNER" ? "OWNER" : "STUDENT";

    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (existing) {
      if (existing.role !== normalizedRole) {
        return NextResponse.json({
          error: `This email is already registered as a ${existing.role === "STUDENT" ? "Student" : "PG Owner"}. A single email cannot be registered as both roles.`
        }, { status: 400 });
      }
      return NextResponse.json({
        error: "An account with this email already exists. Please switch to 'Sign In' to log in."
      }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role: normalizedRole
      }
    });

    return NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Failed to create account. Please try again." }, { status: 500 });
  }
}
