import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { UpdateIncidentDto } from './dto/update-incident.dto';
import { IncidentResponseDto } from './dto/incident-response.dto';
import { SearchIncidentParamsDto } from './dto/search-incident-params.dto';

@Injectable()
export class IncidentService {
  constructor(private readonly prisma: PrismaService) {}

  async createIncident(createIncidentDto: CreateIncidentDto) {
    const { title, content, placeId, status } = createIncidentDto;

    const place = await this.prisma.place.findUnique({
      where: { placeId: Number(placeId) },
    });

    if (!place) {
      throw new NotFoundException('Place not found');
    }

    const incident = await this.prisma.incident.create({
      data: {
        title,
        content,
        placeId,
        status,
      },
    });

    return {
      message: 'Incident created successfully',
      incident: new IncidentResponseDto(incident),
    };
  }

  async getAllIncidents(searchIncidentParamsDto: SearchIncidentParamsDto) {
    const { limit, page, search, placeId, status } = searchIncidentParamsDto;
    const take = Number(limit);
    const skip = (Number(page) - 1) * take;

    const where: any = {
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(placeId && { placeId: Number(placeId) }),
      ...(status !== undefined && { status: Number(status) }),
    };

    const totalItems = await this.prisma.incident.count({ where });
    const totalPages = Math.ceil(totalItems / take);

    const incidentList = await this.prisma.incident.findMany({
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
      incidents: incidentList.map(
        (incident) => new IncidentResponseDto(incident),
      ),
    };
  }

  async getIncidentById(incidentId: number) {
    const incident = await this.prisma.incident.findUnique({
      where: { incidentId: Number(incidentId) },
    });

    if (!incident) {
      throw new NotFoundException('Incident not found');
    }

    return {
      incident: new IncidentResponseDto(incident),
    };
  }

  async updateIncident(
    incidentId: number,
    updateIncidentDto: UpdateIncidentDto,
  ) {
    const incident = await this.prisma.incident.findUnique({
      where: { incidentId: Number(incidentId) },
    });

    if (!incident) {
      throw new NotFoundException('Incident not found');
    }

    if (updateIncidentDto.placeId) {
      const place = await this.prisma.place.findUnique({
        where: { placeId: Number(updateIncidentDto.placeId) },
      });
      if (!place) {
        throw new NotFoundException('Place not found');
      }
    }

    const updatedIncident = await this.prisma.incident.update({
      where: { incidentId: Number(incidentId) },
      data: {
        ...(updateIncidentDto.title && { title: updateIncidentDto.title }),
        ...(updateIncidentDto.content && {
          content: updateIncidentDto.content,
        }),
        ...(updateIncidentDto.placeId && {
          placeId: updateIncidentDto.placeId,
        }),
        ...(updateIncidentDto.status !== undefined && {
          status: updateIncidentDto.status,
        }),
      },
    });

    return {
      message: 'Incident updated successfully',
      incident: new IncidentResponseDto(updatedIncident),
    };
  }

  async deleteIncident(incidentId: number) {
    const incident = await this.prisma.incident.findUnique({
      where: { incidentId: Number(incidentId) },
    });

    if (!incident) {
      throw new NotFoundException('Incident not found');
    }

    const deletedIncident = await this.prisma.incident.delete({
      where: { incidentId: Number(incidentId) },
    });

    return {
      message: 'Incident deleted successfully',
      incident: new IncidentResponseDto(deletedIncident),
    };
  }
}
