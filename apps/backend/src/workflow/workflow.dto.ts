import { IWorkflowDefinition, INode } from '../../../../packages/shared/src/interfaces/s6s.interface';

export class CreateWorkflowDto implements IWorkflowDefinition {
  id: string;
  name: string;
  description?: string;
  projectId?: string;
  nodes: INode[];
  edges?: any[];
  isActive: boolean;
}

export class UpdateWorkflowDto implements Partial<CreateWorkflowDto> {}
