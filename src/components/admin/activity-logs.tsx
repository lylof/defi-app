"use client";

import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ActivityLog {
  id: string;
  action: string;
  details: string;
  createdAt: Date | string;
  adminId: string;
  targetId: string;
  admin: {
    name: string | null;
  };
}

interface ActivityLogsProps {
  initialLogs: ActivityLog[];
  totalLogs: number;
}

export function ActivityLogs({ initialLogs, totalLogs }: ActivityLogsProps) {
  const [logs, setLogs] = useState(initialLogs);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const loadMore = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/logs?page=${page + 1}`);
      if (!response.ok) throw new Error("Erreur lors du chargement");

      const { logs: newLogs } = await response.json();
      setLogs(prev => [...prev, ...newLogs]);
      setPage(prev => prev + 1);
    } catch (error) {
      toast.error("Erreur lors du chargement des logs");
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
            <TableHead>Date</TableHead>
            <TableHead>Admin</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Détails</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell>
                {format(new Date(log.createdAt), "dd MMM yyyy HH:mm", {
                  locale: fr,
                })}
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">
                    {log.admin.name || "Sans nom"}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <span className="font-medium">{log.action}</span>
              </TableCell>
              <TableCell>
                <span className="text-sm">{log.details}</span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {logs.length < totalLogs && (
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