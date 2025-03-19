"use client";

import { useState } from "react";
import { User, UserRole } from "@prisma/client";
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
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Ban, CheckCircle, MoreHorizontal, Shield, User as UserIcon, Search, UserPlus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AdminService } from "@/lib/admin/admin-service";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

interface UserListProps {
  users: User[];
}

export default function UserList({ users }: UserListProps) {
  const [userList, setUserList] = useState(users);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = userList.filter(user => 
    (user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())) ?? false
  );

  const updateUserRole = async (userId: string, role: UserRole) => {
    try {
      setIsLoading(true);
      const response = await AdminService.updateUserRole(userId, role);
      if (response) {
        setUserList(
          userList.map((user) =>
            user.id === userId ? { ...user, role: role } : user
          )
        );
        toast.success(`Rôle mis à jour avec succès`);
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du rôle:", error);
      toast.error("Erreur lors de la mise à jour du rôle");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleUserBan = async (userId: string, isCurrentlyActive: boolean) => {
    try {
      setIsLoading(true);
      const response = await AdminService.toggleUserBan(userId);
      if (response) {
        setUserList(
          userList.map((user) =>
            user.id === userId ? { ...user, isActive: !isCurrentlyActive } : user
          )
        );
        toast.success(
          !isCurrentlyActive
            ? `L'utilisateur a été réactivé`
            : `L'utilisateur a été suspendu`
        );
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut:", error);
      toast.error("Erreur lors de la mise à jour du statut");
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    const names = name.split(" ");
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.3, staggerChildren: 0.05 }
    }
  };
  
  const rowVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { type: "spring", stiffness: 100, damping: 15 }
    }
  };

  return (
    <motion.div 
      className="admin-user-list-enhanced space-y-4"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher un utilisateur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 admin-input-enhanced"
          />
        </div>
        <Button className="admin-btn-enhanced primary w-full sm:w-auto">
          <UserPlus className="h-4 w-4 mr-2" />
          Ajouter un utilisateur
        </Button>
      </div>

      <div className="admin-card-enhanced p-0 overflow-hidden">
        <Table className="admin-table-enhanced">
        <TableHeader>
          <TableRow>
              <TableHead className="w-[300px]">Utilisateur</TableHead>
            <TableHead>Rôle</TableHead>
              <TableHead>Email vérifié</TableHead>
            <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user, index) => (
                <motion.tr 
                  key={user.id}
                  className="admin-table-row-enhanced"
                  variants={rowVariants}
                  custom={index}
                  initial="hidden"
                  animate="visible"
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border border-border">
                        <AvatarImage src={user.image || ""} alt={user.name || "Utilisateur"} />
                        <AvatarFallback className="bg-primary/10 text-primary font-medium">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.name || "Sans nom"}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                        <div className="text-xs text-muted-foreground">
                          Inscrit le {format(new Date(user.createdAt), "dd MMM yyyy", { locale: fr })}
                        </div>
                      </div>
                </div>
              </TableCell>
              <TableCell>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div>
                <Select
                            value={user.role}
                            onValueChange={(value: UserRole) => updateUserRole(user.id, value)}
                  disabled={isLoading}
                >
                            <SelectTrigger className="w-28 admin-select-enhanced">
                    <SelectValue />
                  </SelectTrigger>
                      <SelectContent className="admin-dropdown-enhanced">
                                <SelectItem value="USER" className="flex items-center gap-2 admin-dropdown-item-enhanced">
                                  <UserIcon className="h-4 w-4 text-blue-500" />
                                  <span>Utilisateur</span>
                                </SelectItem>
                                <SelectItem value="ADMIN" className="flex items-center gap-2 admin-dropdown-item-enhanced">
                                  <Shield className="h-4 w-4 text-purple-500" />
                                  <span>Admin</span>
                                </SelectItem>
                  </SelectContent>
                </Select>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Changer le rôle de l'utilisateur</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
              </TableCell>
              <TableCell>
                    {user.emailVerified ? (
                      <Badge className="admin-badge-enhanced success">
                        <CheckCircle className="h-3 w-3 mr-1" /> Vérifié
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="admin-badge-enhanced warning">
                        Non vérifié
                </Badge>
                    )}
              </TableCell>
              <TableCell>
                    {!user.isActive ? (
                      <Badge variant="destructive" className="admin-badge-enhanced danger">
                        <Ban className="h-3 w-3 mr-1" /> 
                        Suspendu
                      </Badge>
                    ) : (
                      <Badge className="admin-badge-enhanced success">
                        <CheckCircle className="h-3 w-3 mr-1" /> 
                        Actif
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 admin-btn-enhanced">
                          <span className="sr-only">Menu d'actions</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="admin-dropdown-enhanced">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => updateUserRole(user.id, user.role === "ADMIN" ? "USER" : "ADMIN")}
                          className="admin-dropdown-item-enhanced"
                        >
                          <Shield className="h-4 w-4 mr-2" />
                          {user.role === "ADMIN" ? "Définir comme utilisateur" : "Définir comme admin"}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => toggleUserBan(user.id, user.isActive)}
                          className="admin-dropdown-item-enhanced"
                        >
                          {!user.isActive ? (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                              Réactiver l'utilisateur
                            </>
                          ) : (
                            <>
                              <Ban className="h-4 w-4 mr-2 text-red-500" />
                              Suspendre l'utilisateur
                            </>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
              </TableCell>
                </motion.tr>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground py-8">
                    <UserIcon className="h-10 w-10 mb-2 opacity-20" />
                    {searchTerm ? (
                      <>
                        <p>Aucun utilisateur ne correspond à votre recherche</p>
                <Button
                          variant="link" 
                          onClick={() => setSearchTerm("")}
                          className="mt-2"
                        >
                          Effacer la recherche
                </Button>
                      </>
                    ) : (
                      <p>Aucun utilisateur trouvé</p>
                    )}
                  </div>
              </TableCell>
            </TableRow>
            )}
        </TableBody>
      </Table>
      </div>
      
      <div className="flex justify-between items-center pt-4 text-sm text-muted-foreground">
        <div>
          {filteredUsers.length > 0 && (
            <p>{filteredUsers.length} utilisateur{filteredUsers.length > 1 ? 's' : ''} trouvé{filteredUsers.length > 1 ? 's' : ''}</p>
          )}
        </div>
        <div>
          <p>
            {userList.filter(user => user.role === "ADMIN").length} administrateur{userList.filter(user => user.role === "ADMIN").length > 1 ? 's' : ''} • 
            {userList.filter(user => !user.isActive).length} compte{userList.filter(user => !user.isActive).length > 1 ? 's' : ''} suspendu{userList.filter(user => !user.isActive).length > 1 ? 's' : ''}
          </p>
        </div>
    </div>
    </motion.div>
  );
} 