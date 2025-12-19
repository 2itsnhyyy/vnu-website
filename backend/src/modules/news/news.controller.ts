import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { NewsService } from './news.service';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { NewsResponseDto } from './dto/news-response.dto';
import { SearchNewsParamsDto } from './dto/search-news-params.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorators/role.decorator';
import { Role } from 'src/common/constants/role.constant';

@ApiTags('News')
@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('jwt')
  @ApiOperation({
    summary: 'Create a new news',
    description: 'Only admin can create news',
  })
  @ApiExtraModels(NewsResponseDto)
  @ApiCreatedResponse({
    description: 'News created successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'News created successfully' },
        news: { $ref: getSchemaPath(NewsResponseDto) },
      },
    },
  })
  async createNews(@Body() createNewsDto: CreateNewsDto) {
    return this.newsService.createNews(createNewsDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all news with pagination and search' })
  @ApiOkResponse({
    description: 'News fetched successfully',
    example: {
      pagination: {
        totalItems: 50,
        totalPages: 5,
        currentPage: 1,
        hasNextPage: true,
        hasPreviousPage: false,
        limit: 10,
      },
      news: [],
    },
  })
  async getAllNews(@Query() searchNewsParamsDto: SearchNewsParamsDto) {
    return this.newsService.getAllNews(searchNewsParamsDto);
  }

  @Get(':newsId')
  @ApiOperation({ summary: 'Get a news by id' })
  @ApiExtraModels(NewsResponseDto)
  @ApiOkResponse({
    description: 'News fetched successfully',
    schema: {
      type: 'object',
      properties: {
        news: { $ref: getSchemaPath(NewsResponseDto) },
      },
    },
  })
  async getNewsById(@Param('newsId') newsId: number) {
    return this.newsService.getNewsById(newsId);
  }

  @Patch(':newsId')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('jwt')
  @ApiOperation({
    summary: 'Update a news by id',
    description: 'Only admin can update news',
  })
  @ApiExtraModels(NewsResponseDto)
  @ApiOkResponse({
    description: 'News updated successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'News updated successfully' },
        news: { $ref: getSchemaPath(NewsResponseDto) },
      },
    },
  })
  async updateNews(
    @Param('newsId') newsId: number,
    @Body() updateNewsDto: UpdateNewsDto,
  ) {
    return this.newsService.updateNews(newsId, updateNewsDto);
  }

  @Delete(':newsId')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('jwt')
  @ApiOperation({
    summary: 'Delete a news by id',
    description: 'Only admin can delete news',
  })
  @ApiExtraModels(NewsResponseDto)
  @ApiOkResponse({
    description: 'News deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'News deleted successfully' },
        news: { $ref: getSchemaPath(NewsResponseDto) },
      },
    },
  })
  async deleteNews(@Param('newsId') newsId: number) {
    return this.newsService.deleteNews(newsId);
  }
}
