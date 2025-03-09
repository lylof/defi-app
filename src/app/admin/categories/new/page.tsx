import React from "react";
import { CategoryForm } from "@/components/admin/category-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Nouvelle Catégorie | LPT Défis",
};

export default function NewCategoryPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold">Nouvelle Catégorie</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Créer une nouvelle catégorie</CardTitle>
        </CardHeader>
        <CardContent>
          <CategoryForm />
        </CardContent>
      </Card>
    </div>
  );
} 