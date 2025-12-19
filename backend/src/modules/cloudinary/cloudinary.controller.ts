import {
  Body,
  Controller,
  Delete,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  MAX_FILE_SIZE,
  MAX_FILES,
} from '../../common/constants/cloudinary.constant';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

@Controller('cloudinary')
export class CloudinaryController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: { type: 'array', items: { type: 'string', format: 'binary' } },
      },
    },
  })
  @ApiOperation({
    summary: 'Upload files to Cloudinary',
    description: 'Upload files to Cloudinary',
  })
  @ApiOkResponse({
    description: 'Files uploaded successfully',
    example: [
      {
        url: 'https://res.cloudinary.com/dfaq5hbmx/image/upload/v1765524881/vnu/mouh9ghfgduxnt7heizq.jpg',
        publicId: 'vnu/mouh9ghfgduxnt7heizq',
        height: 2128,
        width: 977,
        format: 'jpg',
        resourceType: 'image',
      },
    ],
  })
  @UseInterceptors(
    FilesInterceptor('files', MAX_FILES, {
      limits: {
        fileSize: MAX_FILE_SIZE,
      },
    }),
  )
  async upload(@UploadedFiles() files: any[]) {
    return this.cloudinaryService.uploadFiles(files);
  }

  @Delete('delete')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt')
  @ApiOperation({
    summary: 'Delete files from Cloudinary',
    description: 'Delete files from Cloudinary',
  })
  @ApiOkResponse({
    description: 'Files deleted successfully',
    example: {
      deleted: [
        'https://res.cloudinary.com/dfaq5hbmx/image/upload/v1765524881/vnu/mouh9ghfgduxnt7heizq.jpg',
      ],
      count: 1,
    },
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        urls: {
          type: 'array',
          items: { type: 'string' },
          example: [
            'https://res.cloudinary.com/dfaq5hbmx/image/upload/v1765524881/vnu/mouh9ghfgduxnt7heizq.jpg',
          ],
        },
      },
    },
  })
  async delete(@Body('urls') urls: string[]) {
    return this.cloudinaryService.deleteFiles(urls);
  }
}
