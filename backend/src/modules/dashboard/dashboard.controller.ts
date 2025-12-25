import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { StatsQueryDto } from './dto/stats-query.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorators/role.decorator';
import { Role } from 'src/common/constants/role.constant';

@ApiTags('Dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard, RoleGuard)
@Roles(Role.ADMIN)
@ApiBearerAuth('jwt')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('overview')
  @ApiOperation({
    summary: 'Get overview statistics',
    description: 'Get total buildings, places, and users',
  })
  getOverview() {
    return this.dashboardService.getOverviewStats();
  }

  @Get('new-items')
  @ApiOperation({
    summary: 'Get new items statistics',
    description:
      'Get count of new users, news, posts, and incidents in a date range',
  })
  getNewItems(@Query() query: StatsQueryDto) {
    return this.dashboardService.getNewItemsStats(query);
  }
}
