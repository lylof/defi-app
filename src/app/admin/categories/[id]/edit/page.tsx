import React from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CategoryForm } from "@/components/admin/category-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Modifier une Catégorie | LPT Défis",
};

async function getCategory(id: string) {
  const category = await prisma.category.findUnique({
    where: { id },
  });

  if (!category) {
    notFound();
  }

  return category;
}

export default async function EditCategoryPage({
  params,
}: {
  params: { id: string };
}) {
  const category = await getCategory(params.id);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold">Modifier une Catégorie</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Modifier la catégorie: {category.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <CategoryForm category={category} />
        </CardContent>
      </Card>
    </div>
  );
} 