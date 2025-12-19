import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GetUsersParamDto } from './dto/get-users-param.dto';
import {
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
} from 'src/common/constants/pagination.constant';
import { CreateUserDto } from './dto/create-user.dto';
import { comparePassword, hashPassword } from 'src/common/utils/hash.utils';
import { UserResponseDto } from './dto/user-response.dto';
import { UpdateUserDtoAdmin, UpdateUserDtoMe } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

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

  async getUser(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { userId: Number(userId) },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return {
      user: new UserResponseDto(user),
    };
  }

  async updateProfile(userId: number, updateUserDto: UpdateUserDtoMe) {
    const { name, avatar, birthday } = updateUserDto;
    const data: any = {};
    if (name !== undefined) {
      data.name = name;
    }
    if (avatar !== undefined) {
      data.avatar = avatar;
    }
    if (birthday) {
      data.birthday = new Date(birthday);
    }
    const user = await this.prisma.user.update({
      where: { userId: Number(userId) },
      data,
    });

    return {
      user: new UserResponseDto(user),
    };
  }

  async updateUser(userId: number, updateUserDto: UpdateUserDtoAdmin) {
    const { email, name, avatar, birthday, role } = updateUserDto;

    const data: any = {};
    if (email) {
      data.email = email;
      const existingUser = await this.prisma.user.findFirst({
        where: { email: email, userId: { not: Number(userId) } },
      });
      if (existingUser) {
        throw new BadRequestException('Email already exists');
      }
    }

    if (name !== undefined) {
      data.name = name;
    }
    if (avatar !== undefined) {
      data.avatar = avatar;
    }
    if (birthday) {
      data.birthday = new Date(birthday);
    }
    if (role !== undefined) {
      data.role = Number(role);
    }
    const updatedUser = await this.prisma.user.update({
      where: { userId: Number(userId) },
      data,
    });

    return {
      user: new UserResponseDto(updatedUser),
    };
  }

  async changePassword(userId: number, changePasswordDto: ChangePasswordDto) {
    const { oldPassword, newPassword, confirmNewPassword } = changePasswordDto;
    const user = await this.prisma.user.findUnique({
      where: { userId: Number(userId) },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const isPasswordValid = await comparePassword(oldPassword, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Old password is incorrect');
    }
    if (newPassword !== confirmNewPassword) {
      throw new BadRequestException(
        'New password and confirm new password do not match',
      );
    }
    const hashedNewPassword = await hashPassword(newPassword);
    await this.prisma.user.update({
      where: { userId: Number(userId) },
      data: {
        password: hashedNewPassword,
      },
    });
    return {
      message: 'Password changed successfully',
    };
  }

  async deleteUser(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { userId: Number(userId) },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const deletedUser = await this.prisma.user.delete({
      where: { userId: Number(userId) },
    });

    return {
      user: new UserResponseDto(deletedUser),
    };
  }
}
