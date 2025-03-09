import { prisma } from "@/lib/prisma";
import { AdminStats, AdminLog, UpdateUserDto } from "@/types/admin";
import { UserRole } from "@prisma/client";

export class AdminService {
  static async getUsers() {
    try {
      const [total, active] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ 
          where: { isActive: true } 
        })
      ]);

      const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' }
      });

      return { 
        users, 
        total 
      };
    } catch (error) {
      console.error('Error fetching users:', error);
      return { 
        users: [],
        total: 0
      };
    }
  }

  static async getChallenges() {
    try {
      // Vérifier si la table Challenge existe et a la colonne createdById
      const hasCreatedById = await this.checkIfColumnExists('Challenge', 'createdById');
      
      let whereClause = {};
      if (!hasCreatedById) {
        // Si la colonne n'existe pas, on ne l'inclut pas dans la requête
        whereClause = {};
      }

      const [total, active] = await Promise.all([
        prisma.challenge.count(),
        prisma.challenge.count({ 
          where: { endDate: { gt: new Date() } } 
        })
      ]);
      
      const challenges = await prisma.challenge.findMany({
        include: {
          category: true,
          participations: true
        },
        orderBy: { createdAt: 'desc' }
      });
      
      return { 
        total: total || 0, 
        active: active || 0,
        challenges: challenges?.map(c => ({
          ...c,
          submissionCount: c.participations?.length || 0
        })) || []
      };
    } catch (error) {
      console.error('Error fetching challenges:', error);
      return {
        total: 0,
        active: 0,
        challenges: []
      };
    }
  }

  static async getLogs(page: number = 1, limit: number = 10) {
    try {
      const skip = (page - 1) * limit;
      const [logs, total] = await Promise.all([
        prisma.adminLog.findMany({
          take: limit,
          skip,
          include: {
            admin: {
              select: {
                name: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.adminLog.count()
      ]);

      return { logs, total };
    } catch (error) {
      console.error('Error fetching logs:', error);
      return { logs: [], total: 0 };
    }
  }

  static async getCategories() {
    try {
      const categories = await prisma.category.findMany({
        include: {
          challenges: true,
        },
        orderBy: {
          name: 'asc',
        },
      });

      const total = categories.length;
      const withChallenges = categories.filter(cat => cat.challenges.length > 0).length;
      const mostUsed = categories.sort((a, b) => b.challenges.length - a.challenges.length)[0];

      return {
        total,
        withChallenges,
        mostUsed: mostUsed ? {
          name: mostUsed.name,
          count: mostUsed.challenges.length
        } : null,
        categories
      };
    } catch (error) {
      console.error('Error fetching categories:', error);
      return {
        total: 0,
        withChallenges: 0,
        mostUsed: null,
        categories: []
      };
    }
  }

  static async getStats(): Promise<AdminStats> {
    try {
      const [usersData, challengesData, participationCount, categoriesData] = await Promise.all([
        this.getUsers(),
        this.getChallenges(),
        prisma.challengeParticipation.count(),
        this.getCategories()
      ]);

      const participationRate = usersData.total > 0 
        ? Math.round((participationCount / usersData.total) * 100)
        : 0;

      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      const newChallenges = await prisma.challenge.count({
        where: {
          createdAt: {
            gte: monthStart
          }
        }
      });

      return {
        users: {
          total: usersData.total,
          active: usersData.total > 0 ? usersData.users.filter(u => u.isActive).length : 0
        },
        challenges: challengesData,
        categories: categoriesData,
        participationRate,
        monthlyStats: {
          challenges: newChallenges,
          change: `+${newChallenges}`
        }
      };
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      return {
        users: { total: 0, active: 0 },
        challenges: { total: 0, active: 0, challenges: [] },
        categories: { total: 0, withChallenges: 0, mostUsed: null, categories: [] },
        participationRate: 0,
        monthlyStats: { challenges: 0, change: "+0" }
      };
    }
  }

  static async updateUser(userId: string, adminId: string, data: UpdateUserDto) {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          role: data.role,
          isActive: data.isActive
        }
      });

      await prisma.adminLog.create({
        data: {
          action: data.isActive === false ? "BAN" : data.role ? "UPDATE_ROLE" : "UNBAN",
          details: JSON.stringify(data),
          adminId,
          targetId: userId
        }
      });

      return user;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  // Méthode utilitaire pour vérifier si une colonne existe dans une table
  private static async checkIfColumnExists(table: string, column: string): Promise<boolean> {
    try {
      // Cette requête est spécifique à PostgreSQL
      const result: any = await prisma.$queryRaw`
        SELECT EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_name = ${table}
          AND column_name = ${column}
        );
      `;
      
      return result[0]?.exists || false;
    } catch (error) {
      console.error(`Error checking if column ${column} exists in table ${table}:`, error);
      return false;
    }
  }
}