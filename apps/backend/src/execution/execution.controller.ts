import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ExecutionService } from './execution.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('executions')
@UseGuards(JwtAuthGuard)
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
}
