import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';

@Injectable()
export class ArticlesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    throw new InternalServerErrorException();
    return this.prisma.article.findMany({ where: { published: true } });
  }
}
