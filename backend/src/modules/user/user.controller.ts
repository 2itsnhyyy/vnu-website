import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
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
import { UpdateUserDtoAdmin, UpdateUserDtoMe } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

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

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt')
  @ApiOperation({
    summary: 'Update current user',
    description: 'Update current user',
  })
  @ApiExtraModels(UserResponseDto)
  @ApiOkResponse({
    description: 'User updated successfully',
    schema: {
      type: 'object',
      properties: { user: { $ref: getSchemaPath(UserResponseDto) } },
    },
  })
  async updateCurrentUser(
    @Body() updateUserDto: UpdateUserDtoMe,
    @Req() req: any,
  ) {
    return this.userService.updateProfile(req.user.userId, updateUserDto);
  }

  @Patch('me/password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt')
  @ApiOperation({
    summary: 'Change password',
    description: 'Change password for current user',
  })
  @ApiOkResponse({
    description: 'Password changed successfully',
  })
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Req() req: any,
  ) {
    return this.userService.changePassword(req.user.userId, changePasswordDto);
  }

  @Patch(':userId')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('jwt')
  @ApiOperation({
    summary: 'Update user. Only admin can access this endpoint',
    description: 'Update user by userId',
  })
  @ApiExtraModels(UserResponseDto)
  @ApiOkResponse({
    description: 'User updated successfully',
    schema: {
      type: 'object',
      properties: { user: { $ref: getSchemaPath(UserResponseDto) } },
    },
  })
  async updateUser(
    @Param('userId') userId: number,
    @Body() updateUserDto: UpdateUserDtoAdmin,
  ) {
    return this.userService.updateUser(userId, updateUserDto);
  }
}
