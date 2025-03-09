import React from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BadgeForm } from "@/components/admin/badge-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Modifier un badge | LPT Défis",
};

async function getBadge(id: string) {
  const badge = await prisma.badge.findUnique({
    where: { id },
  });

  if (!badge) {
    notFound();
  }

  return badge;
}

export default async function EditBadgePage({
  params,
}: {
  params: { id: string };
}) {
  const badge = await getBadge(params.id);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold">Modifier un badge</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Modifier le badge: {badge.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <BadgeForm badge={badge} />
        </CardContent>
      </Card>
    </div>
  );
} 