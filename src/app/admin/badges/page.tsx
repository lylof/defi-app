import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BadgeList } from "@/components/admin/badge-list";

export const metadata = {
  title: "Gestion des Badges | LPT Défis",
};

async function getBadges() {
  return await prisma.badge.findMany({
    orderBy: {
      points: "desc",
    },
  });
}

export default async function BadgesAdminPage() {
  const badges = await getBadges();

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestion des Badges</h1>
        <Link href="/admin/badges/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau Badge
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des Badges</CardTitle>
        </CardHeader>
        <CardContent>
          <BadgeList badges={badges} />
        </CardContent>
      </Card>
    </div>
  );
} 