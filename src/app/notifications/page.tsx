import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import NotificationList from "@/components/notifications/NotificationList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const metadata: Metadata = {
  title: "Notifications | LPT Défis",
  description: "Gérez vos notifications sur la plateforme LPT Défis",
};

export default async function NotificationsPage() {
  // Vérifier l'authentification côté serveur
  const session = await getServerSession();
  
  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/notifications");
  }
  
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Notifications</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Gérer vos notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="all">Toutes</TabsTrigger>
              <TabsTrigger value="unread">Non lues</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              <NotificationList limit={20} showUnreadOnly={false} />
            </TabsContent>
            
            <TabsContent value="unread">
              <NotificationList limit={20} showUnreadOnly={true} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 