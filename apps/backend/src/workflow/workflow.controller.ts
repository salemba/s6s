import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, Req } from '@nestjs/common';
import { WorkflowService } from './workflow.service';
import { CreateWorkflowDto, UpdateWorkflowDto } from './workflow.dto';
import { ExecutionService } from '../execution/execution.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('workflows')
@UseGuards(JwtAuthGuard)
export class WorkflowController {
  constructor(
    private readonly workflowService: WorkflowService,
    private readonly executionService: ExecutionService
  ) {}

  @Post()
  async create(@Body() createWorkflowDto: CreateWorkflowDto, @Req() req: any) {
    const userId = req.user.userId;
    return this.workflowService.create(createWorkflowDto, userId);
  }

  @Get()
  async findAll() {
    return this.workflowService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.workflowService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateWorkflowDto: UpdateWorkflowDto) {
    return this.workflowService.update(id, updateWorkflowDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.workflowService.delete(id);
  }

  /**
   * Trigger a workflow execution.
   * 
   * @param id The workflow ID.
   */
  @Post(':id/run')
  async runWorkflow(@Param('id') id: string) {
    const result = await this.executionService.enqueueWorkflow(id);
    return { executionId: result.executionId };
  }
}
