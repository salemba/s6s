import { Injectable } from '@nestjs/common';
import { CreateWorkflowDto, UpdateWorkflowDto } from './workflow.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WorkflowService {
  constructor(
    private prisma: PrismaService
  ) {}

  async findAll() {
    return this.prisma.workflow.findMany();
  }

  async findOne(id: string) {
    return this.prisma.workflow.findUnique({ where: { id } });
  }

  async create(data: CreateWorkflowDto) {
    return this.prisma.workflow.create({ data: data as any });
  }

  async update(id: string, data: UpdateWorkflowDto) {
    return this.prisma.workflow.update({ where: { id }, data: data as any });
  }

  async delete(id: string) {
    return this.prisma.workflow.delete({ where: { id } });
  }
}
