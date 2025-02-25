import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ChallengeForm } from "@/components/admin/challenge-form";

export const metadata: Metadata = {
  title: "Nouveau Défi",
  description: "Créer un nouveau défi",
};

export default async function NewChallengePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' }
  });

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Créer un nouveau défi</h1>
      <ChallengeForm categories={categories} />
    </div>
  );
} 