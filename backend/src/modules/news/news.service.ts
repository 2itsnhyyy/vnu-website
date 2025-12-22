import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { NewsResponseDto } from './dto/news-response.dto';
import { SearchNewsParamsDto } from './dto/search-news-params.dto';

@Injectable()
export class NewsService {
  constructor(private readonly prisma: PrismaService) {}

  async createNews(createNewsDto: CreateNewsDto) {
    const { title, contentMarkdown } = createNewsDto;

    const news = await this.prisma.news.create({
      data: {
        title,
        contentMarkdown,
      },
    });

    return {
      message: 'News created successfully',
      news: new NewsResponseDto(news),
    };
  }

  async getAllNews(searchNewsParamsDto: SearchNewsParamsDto) {
    const { limit, page, search } = searchNewsParamsDto;
    const take = Number(limit);
    const skip = (Number(page) - 1) * take;

    const where: any = {
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { contentMarkdown: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const totalItems = await this.prisma.news.count({ where });
    const totalPages = Math.ceil(totalItems / take);

    const newsList = await this.prisma.news.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });

    return {
      pagination: {
        totalItems,
        totalPages,
        currentPage: Number(page),
        hasNextPage: Number(page) < totalPages,
        hasPreviousPage: Number(page) > 1,
        limit: take,
      },
      news: newsList.map((news) => new NewsResponseDto(news)),
    };
  }

  async getNewsById(newsId: number) {
    const news = await this.prisma.news.findUnique({
      where: { newsId: Number(newsId) },
    });

    if (!news) {
      throw new NotFoundException('News not found');
    }

    return {
      news: new NewsResponseDto(news),
    };
  }

  async updateNews(newsId: number, updateNewsDto: UpdateNewsDto) {
    const news = await this.prisma.news.findUnique({
      where: { newsId: Number(newsId) },
    });

    if (!news) {
      throw new NotFoundException('News not found');
    }

    const updatedNews = await this.prisma.news.update({
      where: { newsId: Number(newsId) },
      data: {
        ...(updateNewsDto.title && { title: updateNewsDto.title }),
        ...(updateNewsDto.contentMarkdown && {
          contentMarkdown: updateNewsDto.contentMarkdown,
        }),
      },
    });

    return {
      message: 'News updated successfully',
      news: new NewsResponseDto(updatedNews),
    };
  }

  async deleteNews(newsId: number) {
    const news = await this.prisma.news.findUnique({
      where: { newsId: Number(newsId) },
    });

    if (!news) {
      throw new NotFoundException('News not found');
    }

    const deletedNews = await this.prisma.news.delete({
      where: { newsId: Number(newsId) },
    });

    return {
      message: 'News deleted successfully',
      news: new NewsResponseDto(deletedNews),
    };
  }
}
