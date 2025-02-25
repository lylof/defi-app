"use client";

import { useState } from "react";
import { AdminUserResponse, UpdateUserDto } from "@/types/admin";
import { UserRole } from "@prisma/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";

interface UserListProps {
  initialUsers: AdminUserResponse[];
  totalUsers: number;
}

export function UserList({ initialUsers, totalUsers }: UserListProps) {
  const [users, setUsers] = useState(initialUsers);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const updateUser = async (userId: string, data: UpdateUserDto) => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...data }),
      });

      if (!response.ok) throw new Error("Erreur lors de la mise à jour");

      const updatedUser = await response.json();
      setUsers(users.map(u => u.id === userId ? updatedUser : u));
      toast.success("Utilisateur mis à jour avec succès");
    } catch (error) {
      toast.error("Erreur lors de la mise à jour de l'utilisateur");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/users?page=${page + 1}`);
      if (!response.ok) throw new Error("Erreur lors du chargement");

      const { users: newUsers } = await response.json();
      setUsers(prev => [...prev, ...newUsers]);
      setPage(prev => prev + 1);
    } catch (error) {
      toast.error("Erreur lors du chargement des utilisateurs");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Utilisateur</TableHead>
            <TableHead>Rôle</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Dernière connexion</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">{user.name || "Sans nom"}</span>
                  <span className="text-sm text-gray-500">{user.email}</span>
                </div>
              </TableCell>
              <TableCell>
                <Select
                  defaultValue={user.role}
                  onValueChange={(value: UserRole) =>
                    updateUser(user.id, { role: value })
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">Utilisateur</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Badge
                  variant={user.isActive ? "success" : "destructive"}
                  className="cursor-pointer"
                  onClick={() => updateUser(user.id, { isActive: !user.isActive })}
                >
                  {user.isActive ? "Actif" : "Suspendu"}
                </Badge>
              </TableCell>
              <TableCell>
                {user.lastLogin
                  ? format(new Date(user.lastLogin), "dd MMM yyyy HH:mm", {
                      locale: fr,
                    })
                  : "Jamais"}
              </TableCell>
              <TableCell>
                <Button
                  variant={user.isActive ? "destructive" : "default"}
                  size="sm"
                  onClick={() => updateUser(user.id, { isActive: !user.isActive })}
                  disabled={isLoading}
                >
                  {user.isActive ? "Suspendre" : "Réactiver"}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {users.length < totalUsers && (
        <div className="flex justify-center">
          <Button
            onClick={loadMore}
            disabled={isLoading}
            variant="outline"
          >
            {isLoading ? "Chargement..." : "Charger plus"}
          </Button>
        </div>
      )}
    </div>
  );
} 