import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AdminService } from "@/lib/admin/admin-service";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const result = await AdminService.getLogs(page, limit);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Erreur lors de la récupération des logs:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    );
  }
} 