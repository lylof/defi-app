import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AdminService } from "@/lib/admin/admin-service";
import { z } from "zod";

const updateUserSchema = z.object({
  userId: z.string().min(1, "ID utilisateur requis"),
  role: z.enum(["USER", "ADMIN"]).optional(),
  isActive: z.boolean().optional(),
});

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const result = await AdminService.getUsers();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = updateUserSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Données invalides", details: validatedData.error.format() },
        { status: 400 }
      );
    }

    const { userId, ...updateData } = validatedData.data;
    
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "Aucune donnée à mettre à jour" },
        { status: 400 }
      );
    }

    const user = await AdminService.updateUser(
      userId,
      session.user.id,
      updateData
    );

    return NextResponse.json(user);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'utilisateur:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    );
  }
} 