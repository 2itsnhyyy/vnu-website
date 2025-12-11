import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { GetUsersParamDto } from './dto/get-users-param.dto';
import { ApiBearerAuth, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { RoleGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorators/role.decorator';
import { Role } from 'src/common/constants/role.constant';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}
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
}
