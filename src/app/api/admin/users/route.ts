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

/**
 * Convertit les dates d'un objet en chaînes ISO
 * @param obj Objet contenant des dates
 * @returns Le même objet avec les dates converties en chaînes ISO
 */
function convertDatesToISOString(obj: any): any {
  if (!obj) return obj;
  
  const result = { ...obj };
  for (const key in result) {
    if (result[key] instanceof Date) {
      result[key] = result[key].toISOString();
    }
  }
  return result;
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");

    const result = await AdminService.getUsers();
    
    // Convertir les dates en chaînes ISO
    const users = result.users.map(user => convertDatesToISOString(user));

    return NextResponse.json({
      users,
      total: result.total
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const body = await req.json();
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

    // Convertir les dates en chaînes ISO
    const formattedUser = convertDatesToISOString(user);

    return NextResponse.json(formattedUser);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Erreur lors de la mise à jour de l'utilisateur:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    );
  }
} 