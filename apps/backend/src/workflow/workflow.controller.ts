import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { WorkflowService } from './workflow.service';
import { CreateWorkflowDto } from './workflow.dto';
import { ExecutionService } from '../execution/execution.service';

@Controller('workflows')
export class WorkflowController {
  constructor(
    private readonly workflowService: WorkflowService,
    private readonly executionService: ExecutionService
  ) {}

  /**
   * Create or Update a workflow.
   * 
   * @param createWorkflowDto The workflow definition payload.
   */
  @Post()
  async saveWorkflow(@Body() createWorkflowDto: CreateWorkflowDto) {
    return this.workflowService.saveWorkflow(createWorkflowDto);
  }

  /**
   * Get a workflow by ID.
   * 
   * @param id The workflow ID.
   */
  @Get(':id')
  async getWorkflow(@Param('id') id: string) {
    return this.workflowService.getWorkflow(id);
  }

  /**
   * Trigger a workflow execution.
   * 
   * @param id The workflow ID.
   */
  @Post(':id/run')
  async runWorkflow(@Param('id') id: string) {
    // In a real implementation, enqueueWorkflow would return the job ID or execution ID.
    // For now, we'll generate one here or assume the service handles it.
    // Since enqueueWorkflow is void, we simulate the ID.
    await this.executionService.enqueueWorkflow(id);
    
    // TODO: Retrieve the actual execution ID from the queue job
    const executionId = 'exec-' + Date.now(); 
    return { executionId };
  }

  /**
   * Get execution status.
   * 
   * @param id The execution ID.
   */
  @Get('execution/:id')
  async getExecution(@Param('id') id: string) {
    // The user requested 'getExecutionStatus', mapping to 'getExecution'
    return this.executionService.getExecution(id);
  }
}
