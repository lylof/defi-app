"use client";

import React, { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Challenge, Category } from "@prisma/client";
import { ChallengeFilters } from "./challenge-filters";
import { ChallengeCard } from "./challenge-card";
import { Button } from "@/components/ui/button";

// Nombre de défis par page
const ITEMS_PER_PAGE = 5;

interface ChallengeWithDetails extends Challenge {
  category: Category;
  _count: {
    participations: number;
  };
}

interface ChallengeListProps {
  challenges: ChallengeWithDetails[];
  categories: Category[];
}

export default function ChallengeList({ challenges, categories }: ChallengeListProps) {
  const [filters, setFilters] = useState<ChallengeFilters>({
    search: "",
    categories: [],
    sortBy: "newest",
    status: "all",
  });
  
  // État pour la pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Filtrage et tri des défis en fonction des filtres
  const filteredChallenges = useMemo(() => {
    return challenges
      .filter((challenge) => {
        // Filtrage par recherche
        const matchesSearch = filters.search
          ? challenge.title.toLowerCase().includes(filters.search.toLowerCase()) ||
            challenge.description.toLowerCase().includes(filters.search.toLowerCase())
          : true;

        // Filtrage par catégories
        const matchesCategory =
          filters.categories.length > 0
            ? filters.categories.includes(challenge.categoryId)
            : true;

        // Filtrage par statut
        const now = new Date();
        const isActive = new Date(challenge.endDate) > now;
        const matchesStatus =
          filters.status === "all"
            ? true
            : filters.status === "active"
            ? isActive
            : !isActive;

        return matchesSearch && matchesCategory && matchesStatus;
      })
      .sort((a, b) => {
        // Tri des défis
        switch (filters.sortBy) {
          case "oldest":
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          case "points":
            return b.points - a.points;
          case "popularity":
            return b._count.participations - a._count.participations;
          case "newest":
          default:
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
      });
  }, [challenges, filters]);

  // Calculer le nombre total de pages
  const totalPages = Math.ceil(filteredChallenges.length / ITEMS_PER_PAGE);
  
  // Obtenir les défis pour la page actuelle
  const paginatedChallenges = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredChallenges.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredChallenges, currentPage]);

  // Gestionnaire de changement de filtres
  const handleFiltersChange = (newFilters: ChallengeFilters) => {
    setFilters(newFilters);
    // Réinitialiser à la première page lors d'un changement de filtres
    setCurrentPage(1);
  };
  
  // Gestionnaire de changement de page
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Faire défiler vers le haut de la liste
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-8">
      {/* Filtres */}
      <ChallengeFilters
        categories={categories}
        initialFilters={filters}
        onFiltersChange={handleFiltersChange}
      />

      {/* Liste des défis */}
      <div className="space-y-4">
        {filteredChallenges.length === 0 ? (
          <div className="text-center py-12 border rounded-lg bg-muted/20">
            <p className="text-muted-foreground">
              Aucun défi ne correspond à vos critères
            </p>
          </div>
        ) : (
          paginatedChallenges.map((challenge) => (
            <ChallengeCard key={challenge.id} challenge={challenge} />
          ))
        )}
      </div>

      {/* Pagination */}
      {filteredChallenges.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
          <div className="text-sm text-muted-foreground">
            Affichage de {(currentPage - 1) * ITEMS_PER_PAGE + 1} à{" "}
            {Math.min(currentPage * ITEMS_PER_PAGE, filteredChallenges.length)} sur{" "}
            {filteredChallenges.length} défi{filteredChallenges.length > 1 ? "s" : ""}
          </div>
          
          {totalPages > 1 && (
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Page précédente</span>
              </Button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    className="w-8 h-8 p-0"
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </Button>
                ))}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Page suivante</span>
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 