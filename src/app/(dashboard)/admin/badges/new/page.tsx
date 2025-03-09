import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BadgeForm } from "@/components/admin/badge-form";

export const metadata = {
  title: "Ajouter un badge | LPT Défis",
};

export default function NewBadgePage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold">Ajouter un badge</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Créer un nouveau badge</CardTitle>
        </CardHeader>
        <CardContent>
          <BadgeForm />
        </CardContent>
      </Card>
    </div>
  );
} 