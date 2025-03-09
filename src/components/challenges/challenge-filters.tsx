"use client";

import React, { useState, useEffect } from "react";
import { Category } from "@prisma/client";
import { Search, Filter, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export interface ChallengeFilters {
  search: string;
  categories: string[];
  sortBy: "newest" | "oldest" | "points" | "popularity";
  status: "all" | "active" | "ended";
}

interface ChallengeFiltersProps {
  categories: Category[];
  initialFilters?: Partial<ChallengeFilters>;
  onFiltersChange: (filters: ChallengeFilters) => void;
}

export function ChallengeFilters({
  categories,
  initialFilters,
  onFiltersChange,
}: ChallengeFiltersProps) {
  const [filters, setFilters] = useState<ChallengeFilters>({
    search: initialFilters?.search || "",
    categories: initialFilters?.categories || [],
    sortBy: initialFilters?.sortBy || "newest",
    status: initialFilters?.status || "all",
  });

  // Mettre à jour les filtres et informer le parent
  const updateFilters = (newFilters: Partial<ChallengeFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  // Gérer le changement de catégorie
  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    const updatedCategories = checked
      ? [...filters.categories, categoryId]
      : filters.categories.filter((id) => id !== categoryId);
    
    updateFilters({ categories: updatedCategories });
  };

  // Réinitialiser les filtres
  const resetFilters = () => {
    const defaultFilters: ChallengeFilters = {
      search: "",
      categories: [],
      sortBy: "newest",
      status: "all",
    };
    setFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  };

  // Générer le compteur de filtres actifs
  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.categories.length > 0) count++;
    if (filters.sortBy !== "newest") count++;
    if (filters.status !== "all") count++;
    return count;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Recherche */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Rechercher un défi..."
            className="w-full rounded-md border pl-9 pr-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            value={filters.search}
            onChange={(e) => updateFilters({ search: e.target.value })}
          />
        </div>

        {/* Filtre par catégorie */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="flex gap-1">
              <Filter className="h-4 w-4" />
              Catégories
              {filters.categories.length > 0 && (
                <Badge variant="secondary" className="ml-1 px-1 rounded-full">
                  {filters.categories.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-4">
            <div className="space-y-4">
              <h4 className="font-medium">Filtrer par catégorie</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category.id}`}
                      checked={filters.categories.includes(category.id)}
                      onCheckedChange={(checked) =>
                        handleCategoryChange(category.id, checked === true)
                      }
                    />
                    <Label
                      htmlFor={`category-${category.id}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {category.name}
                    </Label>
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t flex justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => updateFilters({ categories: [] })}
                  disabled={filters.categories.length === 0}
                >
                  Effacer
                </Button>
                <Button
                  size="sm"
                  onClick={() => document.dispatchEvent(new Event("pointerdown"))}
                >
                  Appliquer
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Options avancées */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="flex gap-1">
              <SlidersHorizontal className="h-4 w-4" />
              Options
              {getActiveFiltersCount() > 0 && filters.categories.length === 0 && (
                <Badge variant="secondary" className="ml-1 px-1 rounded-full">
                  {getActiveFiltersCount()}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-4">
            <div className="space-y-4">
              <h4 className="font-medium">Trier par</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="sort-newest"
                    name="sortBy"
                    value="newest"
                    checked={filters.sortBy === "newest"}
                    onChange={() => updateFilters({ sortBy: "newest" })}
                    className="text-primary"
                  />
                  <Label htmlFor="sort-newest" className="text-sm font-normal">
                    Plus récents
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="sort-oldest"
                    name="sortBy"
                    value="oldest"
                    checked={filters.sortBy === "oldest"}
                    onChange={() => updateFilters({ sortBy: "oldest" })}
                    className="text-primary"
                  />
                  <Label htmlFor="sort-oldest" className="text-sm font-normal">
                    Plus anciens
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="sort-points"
                    name="sortBy"
                    value="points"
                    checked={filters.sortBy === "points"}
                    onChange={() => updateFilters({ sortBy: "points" })}
                    className="text-primary"
                  />
                  <Label htmlFor="sort-points" className="text-sm font-normal">
                    Points (décroissant)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="sort-popularity"
                    name="sortBy"
                    value="popularity"
                    checked={filters.sortBy === "popularity"}
                    onChange={() => updateFilters({ sortBy: "popularity" })}
                    className="text-primary"
                  />
                  <Label htmlFor="sort-popularity" className="text-sm font-normal">
                    Popularité
                  </Label>
                </div>
              </div>

              <div className="border-t pt-2">
                <h4 className="font-medium mb-2">Statut</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="status-all"
                      name="status"
                      value="all"
                      checked={filters.status === "all"}
                      onChange={() => updateFilters({ status: "all" })}
                      className="text-primary"
                    />
                    <Label htmlFor="status-all" className="text-sm font-normal">
                      Tous
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="status-active"
                      name="status"
                      value="active"
                      checked={filters.status === "active"}
                      onChange={() => updateFilters({ status: "active" })}
                      className="text-primary"
                    />
                    <Label htmlFor="status-active" className="text-sm font-normal">
                      Actifs
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="status-ended"
                      name="status"
                      value="ended"
                      checked={filters.status === "ended"}
                      onChange={() => updateFilters({ status: "ended" })}
                      className="text-primary"
                    />
                    <Label htmlFor="status-ended" className="text-sm font-normal">
                      Terminés
                    </Label>
                  </div>
                </div>
              </div>

              <div className="border-t pt-2 flex justify-between">
                <Button variant="ghost" size="sm" onClick={resetFilters}>
                  Réinitialiser
                </Button>
                <Button
                  size="sm"
                  onClick={() => document.dispatchEvent(new Event("pointerdown"))}
                >
                  Appliquer
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Filtres actifs */}
      {getActiveFiltersCount() > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {filters.search && (
            <Badge variant="outline" className="flex gap-1 items-center">
              Recherche: {filters.search}
              <button
                className="ml-1 hover:text-destructive"
                onClick={() => updateFilters({ search: "" })}
              >
                ×
              </button>
            </Badge>
          )}
          
          {filters.categories.length > 0 && categories.map((category) => 
            filters.categories.includes(category.id) && (
              <Badge key={category.id} variant="outline" className="flex gap-1 items-center">
                {category.name}
                <button
                  className="ml-1 hover:text-destructive"
                  onClick={() => handleCategoryChange(category.id, false)}
                >
                  ×
                </button>
              </Badge>
            )
          )}
          
          {filters.status !== "all" && (
            <Badge variant="outline" className="flex gap-1 items-center">
              Statut: {filters.status === "active" ? "Actifs" : "Terminés"}
              <button
                className="ml-1 hover:text-destructive"
                onClick={() => updateFilters({ status: "all" })}
              >
                ×
              </button>
            </Badge>
          )}
          
          {filters.sortBy !== "newest" && (
            <Badge variant="outline" className="flex gap-1 items-center">
              Tri: {
                filters.sortBy === "oldest" ? "Plus anciens" : 
                filters.sortBy === "points" ? "Points" : "Popularité"
              }
              <button
                className="ml-1 hover:text-destructive"
                onClick={() => updateFilters({ sortBy: "newest" })}
              >
                ×
              </button>
            </Badge>
          )}
          
          {getActiveFiltersCount() > 1 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs h-6 px-2" 
              onClick={resetFilters}
            >
              Effacer tout
            </Button>
          )}
        </div>
      )}
    </div>
  );
} 