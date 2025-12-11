import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GetUsersParamDto } from './dto/get-users-param.dto';
import {
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
} from 'src/common/constants/pagination.constant';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getUsers(getUsersParamDto: GetUsersParamDto) {
    const {
      limit = DEFAULT_LIMIT,
      page = DEFAULT_PAGE,
      search,
      role,
    } = getUsersParamDto;

    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {
      ...(search && { name: { contains: search } }),
      ...(role !== undefined && { role: Number(role) }),
    };

    const users = await this.prisma.user.findMany({
      skip,
      take: Number(limit),
      where,
      select: {
        userId: true,
        name: true,
        email: true,
        birthday: true,
        avatar: true,
        role: true,
      },
    });

    const totalItems = await this.prisma.user.count({ where });

    const totalPages = Math.ceil(totalItems / Number(limit));

    return {
      pagination: {
        totalItems,
        totalPages,
        currentPage: Number(page),
        hasNextPage: Number(page) < totalPages,
        hasPreviousPage: Number(page) > 1,
        limit: Number(limit),
      },
      users,
    };
  }
}
