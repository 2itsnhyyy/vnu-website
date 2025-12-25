import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StatsQueryDto } from './dto/stats-query.dto';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getOverviewStats() {
    const [totalBuildings, totalPlaces, totalUsers] = await Promise.all([
      this.prisma.building.count(),
      this.prisma.place.count(),
      this.prisma.user.count(),
    ]);

    return {
      message: 'Overview statistics retrieved successfully',
      data: {
        totalBuildings,
        totalPlaces,
        totalUsers,
      },
    };
  }

  async getNewItemsStats(query: StatsQueryDto) {
    const { startDate, endDate } = query;
    const dateFilter = this.buildDateFilter(startDate, endDate)!;

    const [newNews, newPosts, newIncidents] = await Promise.all([
      this.prisma.news.count({
        where: { createdAt: dateFilter },
      }),
      this.prisma.post.count({
        where: { createdAt: dateFilter },
      }),
      this.prisma.incident.count({
        where: { createdAt: dateFilter },
      }),
    ]);

    return {
      message: 'New items statistics retrieved successfully',
      data: {
        period: {
          startDate,
          endDate,
        },
        newNews,
        newPosts,
        newIncidents,
      },
    };
  }

  private buildDateFilter(startDate?: string, endDate?: string) {
    if (!startDate && !endDate) return null;

    const filter: any = {};

    if (startDate) {
      filter.gte = new Date(startDate);
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filter.lte = end;
    }

    return filter;
  }
}
