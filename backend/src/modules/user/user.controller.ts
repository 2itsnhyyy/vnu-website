import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { GetUsersParamDto } from './dto/get-users-param.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  getSchemaPath,
} from '@nestjs/swagger';
import { RoleGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorators/role.decorator';
import { Role } from 'src/common/constants/role.constant';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('jwt')
  @ApiOperation({
    summary: 'Create user',
    description: 'Only admin can access this endpoint',
  })
  @ApiExtraModels(UserResponseDto)
  @ApiCreatedResponse({
    description: 'User created successfully',
    schema: {
      type: 'object',
      properties: {
        user: {
          $ref: getSchemaPath(UserResponseDto),
        },
      },
    },
  })
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('jwt')
  @ApiOperation({
    summary: 'Get users',
    description: 'Only admin can access this endpoint',
  })
  @ApiOkResponse({
    description: 'Users fetched successfully',
    schema: {
      example: {
        pagination: {
          totalItems: 10,
          totalPages: 1,
          currentPage: 1,
          hasNextPage: false,
          hasPreviousPage: false,
          limit: 10,
        },
        users: [],
      },
    },
  })
  async getUsers(@Query() getUsersParamDto: GetUsersParamDto) {
    return this.userService.getUsers(getUsersParamDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt')
  @ApiOperation({
    summary: 'Get current user',
    description: 'Get current user',
  })
  @ApiExtraModels(UserResponseDto)
  @ApiOkResponse({
    description: 'User fetched successfully',
    schema: {
      type: 'object',
      properties: {
        user: {
          $ref: getSchemaPath(UserResponseDto),
        },
      },
    },
  })
  async getCurrentUser(@Req() req: any) {
    return this.userService.getUser(req.user.userId);
  }

  @Get(':userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt')
  @ApiOperation({
    summary: 'Get user',
    description: 'Get user by userId',
  })
  @ApiOkResponse({
    description: 'User fetched successfully',
    schema: {
      type: 'object',
      properties: {
        user: {
          $ref: getSchemaPath(UserResponseDto),
        },
      },
    },
  })
  async getUser(@Param('userId') userId: number) {
    return this.userService.getUser(userId);
  }
}
