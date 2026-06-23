import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDictDto } from './dto/create-dict.dto';
import { UpdateDictDto } from './dto/update-dict.dto';

@Injectable()
export class BearingTypesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.bearingType.findMany({ orderBy: { name: 'asc' } });
  }

  async findOne(id: number) {
    const item = await this.prisma.bearingType.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Бренд не найден');
    return item;
  }

  async create(dto: CreateDictDto) {
    return this.prisma.bearingType.create({ data: dto });
  }

  async update(id: number, dto: UpdateDictDto) {
    await this.findOne(id);
    return this.prisma.bearingType.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.bearingType.delete({ where: { id } });
  }
}
