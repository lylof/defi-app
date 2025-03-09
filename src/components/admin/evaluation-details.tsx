"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { 
  ArrowLeft, 
  Check, 
  X, 
  FileText, 
  Clock, 
  Tag, 
  Trophy,
  User,
  AlertTriangle,
  ExternalLink
} from "lucide-react";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SubmissionStatus } from "@prisma/client";

interface EvaluationDetailsProps {
  data: {
    submission: any;
    totalScore: number;
    maxPossibleScore: number;
    scorePercentage: number;
  };
}

/**
 * Composant pour afficher les détails d'une évaluation de soumission
 * Affiche les informations du défi, de l'utilisateur, la soumission et les évaluations
 */
export function EvaluationDetails({ data }: EvaluationDetailsProps) {
  const { submission, totalScore, maxPossibleScore, scorePercentage } = data;
  const [activeTab, setActiveTab] = useState("overview");
  
  // Formatage de la date
  const formatDate = (date: Date) => {
    return format(new Date(date), "dd MMMM yyyy 'à' HH:mm", { locale: fr });
  };
  
  // Couleur en fonction du statut
  const getStatusColor = (status: SubmissionStatus) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "REJECTED":
        return "bg-red-100 text-red-800 hover:bg-red-200";
      default:
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
    }
  };
  
  // Traduction du statut
  const getStatusText = (status: SubmissionStatus) => {
    switch (status) {
      case "APPROVED":
        return "Approuvé";
      case "REJECTED":
        return "Refusé";
      default:
        return "En attente";
    }
  };
  
  // Obtenir les initiales d'un nom
  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };
  
  // Parsage de la soumission
  const submissionData = JSON.parse(submission.content);
  
  // Vérifier si la soumission a été évaluée
  const hasEvaluations = submission.evaluations.length > 0;
  
  return (
    <div className="space-y-6">
      {/* En-tête avec statut et navigation */}
      <div className="flex justify-between items-center">
        <Link 
          href="/admin/submissions" 
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour aux soumissions
        </Link>
        
        <Badge variant="outline" className={getStatusColor(submission.status)}>
          {getStatusText(submission.status)}
        </Badge>
      </div>
      
      {/* Onglets */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Aperçu</TabsTrigger>
          <TabsTrigger value="submission">Soumission</TabsTrigger>
          <TabsTrigger value="evaluations">Évaluations</TabsTrigger>
        </TabsList>
        
        {/* Onglet Aperçu */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Info Défi */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="h-5 w-5 mr-2 text-amber-500" />
                  Défi
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <h3 className="text-xl font-semibold">{submission.challenge.title}</h3>
                <div className="flex flex-wrap gap-2 text-sm">
                  <div className="flex items-center">
                    <Tag className="h-4 w-4 mr-1 text-gray-500" />
                    <span>{submission.challenge.category.name}</span>
                  </div>
                  <div className="flex items-center ml-3">
                    <Trophy className="h-4 w-4 mr-1 text-amber-500" />
                    <span>{submission.challenge.points} points</span>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 inline mr-1" /> 
                  Fin du défi le {formatDate(submission.challenge.endDate)}
                </div>
              </CardContent>
            </Card>
            
            {/* Info Participant */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2 text-blue-500" />
                  Participant
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={submission.user.image || ""} />
                    <AvatarFallback>{getInitials(submission.user.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{submission.user.name}</p>
                    <p className="text-sm text-muted-foreground">{submission.user.email}</p>
                  </div>
                </div>
                <div className="mt-4 text-sm text-muted-foreground">
                  Soumission le {formatDate(submission.createdAt)}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Résumé de l'évaluation */}
          {hasEvaluations ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-purple-500" />
                  Résumé de l'évaluation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Score total:</span>
                      <span className="text-sm font-semibold">{scorePercentage}%</span>
                    </div>
                    <Progress 
                      value={scorePercentage} 
                      className="h-2"
                      indicatorClassName={
                        scorePercentage >= 80 ? "bg-green-500" :
                        scorePercentage >= 60 ? "bg-blue-500" :
                        scorePercentage >= 40 ? "bg-amber-500" :
                        "bg-red-500"
                      }
                    />
                    <p className="mt-1 text-sm text-muted-foreground">
                      {totalScore} points sur un maximum de {maxPossibleScore}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="border rounded-md p-3">
                      <p className="font-medium">Évalué par</p>
                      <p className="text-muted-foreground">
                        {submission.evaluations[0]?.evaluator.name || "Système"}
                      </p>
                    </div>
                    <div className="border rounded-md p-3">
                      <p className="font-medium">Date d'évaluation</p>
                      <p className="text-muted-foreground">
                        {submission.evaluations[0]?.createdAt 
                          ? formatDate(submission.evaluations[0].createdAt) 
                          : "N/A"
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center p-6">
                <div className="text-center">
                  <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold">Non évalué</h3>
                  <p className="text-muted-foreground mt-2">
                    Cette soumission n'a pas encore été évaluée.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        {/* Onglet Soumission */}
        <TabsContent value="submission" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Contenu de la soumission</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Description</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {submissionData.description}
                </p>
              </div>
              
              {submissionData.repositoryUrl && (
                <div>
                  <h3 className="font-medium mb-2">Dépôt de code</h3>
                  <Link
                    href={submissionData.repositoryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-600 hover:text-blue-800"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    {submissionData.repositoryUrl}
                  </Link>
                </div>
              )}
              
              {submissionData.files && submissionData.files.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">Fichiers joints</h3>
                  <ul className="space-y-2">
                    {submissionData.files.map((file: any, index: number) => (
                      <li key={index} className="flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-gray-500" />
                        <span>{file}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {submissionData.notes && (
                <div>
                  <h3 className="font-medium mb-2">Notes supplémentaires</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {submissionData.notes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Onglet Évaluations */}
        <TabsContent value="evaluations" className="space-y-6 mt-6">
          {hasEvaluations ? (
            <Card>
              <CardHeader>
                <CardTitle>Évaluations détaillées</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {submission.evaluations.map((evaluation: any) => (
                    <AccordionItem 
                      key={evaluation.id} 
                      value={evaluation.id}
                      className="border p-4 rounded-lg mb-4"
                    >
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex justify-between items-center w-full pr-4">
                          <div className="font-medium">{evaluation.criterion.name}</div>
                          <div className="flex items-center">
                            <span className={
                              evaluation.score >= 8 ? "text-green-600" :
                              evaluation.score >= 5 ? "text-blue-600" :
                              "text-red-600"
                            }>
                              {evaluation.score}/10
                            </span>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-4">
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-sm font-medium">Description du critère</h4>
                            <p className="text-sm text-muted-foreground">
                              {evaluation.criterion.description}
                            </p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium">Pondération</h4>
                            <p className="text-sm text-muted-foreground">
                              Ce critère a un poids de {evaluation.criterion.weight} dans l'évaluation
                            </p>
                          </div>
                          {evaluation.comment && (
                            <div>
                              <h4 className="text-sm font-medium">Commentaire de l'évaluateur</h4>
                              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                {evaluation.comment}
                              </p>
                            </div>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center p-6">
                <div className="text-center">
                  <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold">Aucune évaluation</h3>
                  <p className="text-muted-foreground mt-2">
                    Cette soumission n'a pas encore reçu d'évaluations détaillées.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
} 