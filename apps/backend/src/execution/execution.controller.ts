import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ExecutionService } from './execution.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('executions')
export class ExecutionController {
  constructor(private readonly executionService: ExecutionService) {}

  /**
   * Get execution status.
   * 
   * @param id The execution ID.
   */
  @Get(':id')
  async getExecution(@Param('id') id: string) {
    return this.executionService.getExecution(id);
  }

  /**
   * Manually trigger a workflow execution directly (bypassing queue).
   * Useful for testing.
   * 
   * @param workflowId The ID of the workflow to run.
   */
  @Post(':workflowId/run-direct')
  async runWorkflowDirect(@Param('workflowId') workflowId: string) {
    return this.executionService.enqueueWorkflow(workflowId);
  }
}
