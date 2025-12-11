import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GetUsersParamDto } from './dto/get-users-param.dto';
import {
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
} from 'src/common/constants/pagination.constant';
import { CreateUserDto } from './dto/create-user.dto';
import { hashPassword } from 'src/common/utils/hash.utils';
import { UserResponseDto } from './dto/user-response.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async createUser(createUserDto: CreateUserDto) {
    const { email, password, name, birthday, role, avatar } = createUserDto;

    const persistedEmail = await this.prisma.user.findUnique({
      where: { email },
    });
    if (persistedEmail) {
      throw new BadRequestException('Email already exists');
    }

    const hashedPassword = await hashPassword(password);
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        birthday: new Date(birthday),
        role: role ?? 0,
        avatar: avatar ?? null,
      },
    });
    return {
      user: new UserResponseDto(user),
    };
  }

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
      users: users.map((user) => new UserResponseDto(user)),
    };
  }
}
