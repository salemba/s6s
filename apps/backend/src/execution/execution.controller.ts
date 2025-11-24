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
    // return this.executionService.getExecution(id);
    // Temporary: Redirect to getExecutionLog as we are using ExecutionLog table for now
    const log = await this.executionService.getExecutionLog(id);
    if (!log) return null;

    return {
      id: log.id,
      workflowId: log.workflowId,
      status: log.status,
      startTime: log.startTime,
      endTime: log.endTime,
      nodeResults: log.summary
    };
  }

  /**
   * Manually trigger a workflow execution directly (bypassing queue).
   * Useful for testing.
   * 
   * @param workflowId The ID of the workflow to run.
   */
  @Post(':workflowId/run-direct')
  async runWorkflowDirect(@Param('workflowId') workflowId: string) {
    return this.executionService.runDirectly(workflowId);
  }

  /**
   * Execute a comprehensive, multi-node workflow directly.
   * 
   * @param workflowId The ID of the workflow to run.
   */
  @Post(':workflowId/test-run')
  async runWorkflowTest(@Param('workflowId') workflowId: string) {
    return this.executionService.runDirectly(workflowId);
  }

  /**
   * Get all execution logs.
   */
  @Get('logs/history')
  async getExecutionLogs() {
    return this.executionService.getExecutionLogs();
  }

  /**
   * Get a specific execution log.
   */
  @Get('logs/:id')
  async getExecutionLog(@Param('id') id: string) {
    return this.executionService.getExecutionLog(id);
  }
}
