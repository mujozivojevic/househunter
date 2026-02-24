import prisma from '../db/prisma';
import { logger } from '../utils/logger';

export interface CreateFilterInput {
  userId: number;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  type?: string;
}

export class UserFilterService {
  /**
   * Create a new filter for a user
   */
  async createFilter(input: CreateFilterInput) {
    try {
      const filter = await prisma.userFilter.create({
        data: {
          userId: input.userId,
          minPrice: input.minPrice || null,
          maxPrice: input.maxPrice || null,
          location: input.location || null,
          type: input.type || null,
        },
      });
      return filter;
    } catch (error: any) {
      logger.error('Error creating filter:', error.message);
      throw error;
    }
  }

  /**
   * Get all filters for a user
   */
  async getFiltersByUserId(userId: number) {
    return prisma.userFilter.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get filter by ID
   */
  async getFilterById(id: number) {
    return prisma.userFilter.findUnique({
      where: { id },
    });
  }

  /**
   * Delete a filter
   */
  async deleteFilter(id: number) {
    return prisma.userFilter.delete({
      where: { id },
    });
  }

  /**
   * Get all active filters (for checking new listings)
   */
  async getAllActiveFilters() {
    return prisma.userFilter.findMany({
      include: {
        user: true,
      },
    });
  }
}

export const userFilterService = new UserFilterService();

