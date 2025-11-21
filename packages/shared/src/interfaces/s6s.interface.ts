export enum NodeType {
  TRIGGER_WEBHOOK = 'TRIGGER_WEBHOOK',
  TRIGGER_CRON = 'TRIGGER_CRON',
  TRIGGER_POLLING = 'TRIGGER_POLLING',
  ACTION_HTTP = 'ACTION_HTTP',
  ACTION_DB_QUERY = 'ACTION_DB_QUERY',
  ACTION_SLACK = 'ACTION_SLACK',
  ACTION_AWS = 'ACTION_AWS',
  LOGIC_IF = 'LOGIC_IF',
  LOGIC_MERGE = 'LOGIC_MERGE',
  LOGIC_WAIT = 'LOGIC_WAIT',
  CODE_CUSTOM = 'CODE_CUSTOM',
}

export enum ExecutionStatus {
  QUEUED = 'QUEUED',
  RUNNING = 'RUNNING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

/**
 * Represents a single step in the workflow.
 * Configuration supports dynamic linking syntax: {{ $node["StepName"].json.outputKey }}
 */
export interface INode {
  id: string;
  name: string; // Unique name within the workflow (e.g., "HttpRequest1")
  type: NodeType | string;
  
  /**
   * Configuration object for the node.
   * Values can be static strings/numbers or dynamic templates.
   * Example: { url: "https://api.example.com", method: "GET", header: "{{ $node['Auth'].json.token }}" }
   */
  config: Record<string, any>;

  /**
   * Input connections or schema definitions.
   * In a graph, this might be the IDs of incoming edges or nodes.
   */
  inputs: string[]; 

  /**
   * Output connections or schema definitions.
   * In a graph, this might be the IDs of outgoing edges or nodes.
   */
  outputs: string[];

  // Visual position for the canvas
  position?: { x: number; y: number };
}

/**
 * Defines the structure of a workflow.
 */
export interface IWorkflowDefinition {
  id: string;
  name: string;
  description?: string;
  
  /**
   * Reference to the owning project.
   * (Mapped from 'project_id' requirement)
   */
  projectId?: string;
  
  nodes: INode[];
  
  // Edges define the connections between nodes (React Flow style)
  edges?: any[];

  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Represents the output of a single node execution.
 */
export interface INodeExecutionResult {
  nodeId: string;
  nodeName: string;
  status: 'SUCCESS' | 'FAILED';
  outputData: any; // The JSON output produced by this node
  error?: any;
  startTime: Date | string;
  endTime: Date | string;
}

/**
 * Defines the output structure after a workflow run.
 */
export interface IExecutionResult {
  id: string;
  workflowId: string;
  
  status: ExecutionStatus;
  
  /**
   * Timestamp when execution started.
   * (Mapped from 'start_time' requirement)
   */
  startTime: Date | string;
  
  /**
   * Timestamp when execution finished.
   * (Mapped from 'end_time' requirement)
   */
  endTime?: Date | string;
  
  /**
   * List of results for each node executed.
   * (Mapped from 'node_results' requirement)
   */
  nodeResults: INodeExecutionResult[];
}
