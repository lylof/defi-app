import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SubmissionList } from "@/components/admin/submission-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SubmissionItem {
  id: string;
  user: {
    name: string | null;
    email: string | null;
  };
  challenge: {
    title: string;
    points: number;
    category: {
      name: string;
    };
    evaluationCriteria: any[];
  };
  submission: string;
  updatedAt: Date;
  status: "PENDING" | "APPROVED" | "REJECTED";
}

export default async function SubmissionsPage() {
  const session = await getServerSession();

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  // Récupérer toutes les soumissions (en attente et évaluées)
  const [pendingSubmissions, evaluatedSubmissions] = await Promise.all([
    // Soumissions en attente d'évaluation
    prisma.submission.findMany({
      where: {
        status: "PENDING",
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        challenge: {
          include: {
            category: true,
            evaluationCriteria: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    }),
    
    // Soumissions déjà évaluées
    prisma.submission.findMany({
      where: {
        OR: [
          { status: "APPROVED" },
          { status: "REJECTED" },
        ],
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        challenge: {
          include: {
            category: true,
            evaluationCriteria: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 20, // Limiter pour des raisons de performance
    })
  ]);

  // Transformer les données pour s'adapter à l'interface Submission
  const mapSubmissions = (submissions: any[]): SubmissionItem[] => {
    return submissions.map(sub => ({
      id: sub.id,
      user: sub.user,
      challenge: sub.challenge,
      submission: sub.content,
      updatedAt: sub.updatedAt,
      status: sub.status,
    }));
  };

  const pendingItems = mapSubmissions(pendingSubmissions);
  const evaluatedItems = mapSubmissions(evaluatedSubmissions);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Gestion des soumissions
        </h1>
        <p className="text-muted-foreground">
          Évaluez et consultez les soumissions des participants
        </p>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">
            En attente ({pendingItems.length})
          </TabsTrigger>
          <TabsTrigger value="evaluated">
            Évaluées ({evaluatedItems.length})
          </TabsTrigger>
          <TabsTrigger value="all">
            Toutes ({pendingItems.length + evaluatedItems.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending" className="mt-6">
          <SubmissionList submissions={pendingItems} />
        </TabsContent>
        
        <TabsContent value="evaluated" className="mt-6">
          <SubmissionList submissions={evaluatedItems} />
        </TabsContent>
        
        <TabsContent value="all" className="mt-6">
          <SubmissionList 
            submissions={[...pendingItems, ...evaluatedItems].sort(
              (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
            )} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
} 