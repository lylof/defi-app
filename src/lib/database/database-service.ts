import { PrismaClient } from '@prisma/client';
import { toast } from 'sonner';

export class DatabaseService {
  private static instance: DatabaseService;
  private prisma: PrismaClient;
  private retryAttempts: number = 3;
  private retryDelay: number = 1000; // 1 seconde

  private constructor() {
    this.prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      errorFormat: 'minimal',
    });

    // Gestion des événements de connexion
    this.prisma.$on('query', (e) => {
      console.log('Query: ' + e.query);
    });

    this.prisma.$on('error', (e) => {
      console.error('Database error:', e);
    });
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  public async connect() {
    try {
      await this.prisma.$connect();
      console.log('Successfully connected to database');
    } catch (error) {
      console.error('Failed to connect to database:', error);
      throw error;
    }
  }

  public async disconnect() {
    await this.prisma.$disconnect();
  }

  public getPrisma(): PrismaClient {
    return this.prisma;
  }

  public async executeWithRetry<T>(
    operation: () => Promise<T>,
    context: string = 'database operation'
  ): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        return await operation();
      } catch (error: any) {
        lastError = error;
        console.error(`Attempt ${attempt} failed for ${context}:`, error);

        if (this.isConnectionError(error)) {
          if (attempt < this.retryAttempts) {
            console.log(`Retrying in ${this.retryDelay}ms...`);
            await this.wait(this.retryDelay);
            await this.reconnect();
          }
        } else {
          // Si ce n'est pas une erreur de connexion, ne pas réessayer
          break;
        }
      }
    }

    // Si on arrive ici, toutes les tentatives ont échoué
    throw new Error(`Failed ${context} after ${this.retryAttempts} attempts: ${lastError?.message}`);
  }

  private async reconnect() {
    try {
      await this.prisma.$disconnect();
      await this.prisma.$connect();
      console.log('Successfully reconnected to database');
    } catch (error) {
      console.error('Failed to reconnect:', error);
      throw error;
    }
  }

  private isConnectionError(error: any): boolean {
    return (
      error.code === 'P1001' || // Error connecting to database
      error.code === 'P1002' || // Database connection timed out
      error.message?.includes('Can\'t reach database server') ||
      error.kind === 'Closed'
    );
  }

  private wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
} 