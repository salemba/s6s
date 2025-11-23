import { Injectable } from '@nestjs/common';
import * as vm from 'vm';
import * as _ from 'lodash';
import axios from 'axios';
// In a real monorepo setup, this would be imported from '@s6s/shared'
import { IExecutionResult, IWorkflowDefinition, INode, ExecutionStatus, NodeType } from '../../../../packages/shared/src/interfaces/s6s.interface';
import { resolveDynamicParameters } from '../../../../packages/shared/src/utils/dynamic-resolver';
import { VaultService } from '../vault/vault.service';
import { ActionRunnerService } from './node-runners/action-runner.service';
import { LoggerService } from '../common/logger/logger.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ExecutionService {
  constructor(
    private readonly vaultService: VaultService,
    private readonly actionRunnerService: ActionRunnerService,
    private readonly logger: LoggerService,
    private readonly prisma: PrismaService,
    // TODO: Inject BullMQ Queue
    // @InjectQueue('workflow-queue') private workflowQueue: Queue
  ) {
    this.logger.setContext(ExecutionService.name);
  }

  /**
   * Enqueues a workflow for execution.
   * 
   * @param workflowId The ID of the workflow to run.
   */
  async enqueueWorkflow(workflowId: string): Promise<any> {
    // 1. Retrieve the Workflow Definition from the database (Prisma).
    const workflow = await this.prisma.workflow.findUnique({ 
      where: { id: workflowId }, 
      include: { nodes: true } 
    });
    
    if (!workflow) throw new Error('Workflow not found');

    // 2. Validate that the workflow is active.
    //    if (!workflow.isActive) throw new Error('Workflow is inactive');

    // 3. Scheduling Logic (New)
    //    If the workflow has a SCHEDULE_TRIGGER node, we need to register it with a scheduler.
    //    const triggerNode = workflow.nodes.find(n => n.type === 'SCHEDULE_TRIGGER');
    //    if (triggerNode) {
    //      // Integration Note: Use 'node-cron' or 'bree' for job scheduling.
    //      // npm install node-cron @types/node-cron
    //      // import * as cron from 'node-cron';
    //
    //      const { mode, intervalValue, intervalUnit, cronExpression } = triggerNode.config;
    //      let schedule = '';
    //
    //      if (mode === 'interval') {
    //        // Convert interval to cron expression (simplified example)
    //        // e.g., 5 Minutes -> '*/5 * * * *'
    //        schedule = this.convertIntervalToCron(intervalValue, intervalUnit);
    //      } else {
    //        schedule = cronExpression;
    //      }
    //
    //      // Register the job
    //      // cron.schedule(schedule, () => {
    //      //   this.workflowQueue.add('execute-workflow', { workflowId: workflow.id, definition: workflow });
    //      // });
    //      this.logger.log(`Scheduled workflow ${workflowId} with cron: ${schedule}`);
    //      return; // Don't run immediately if it's a scheduled job, unless 'Run Now' was clicked.
    //    }

    // 4. Add a new job to the 'workflow-queue' via BullMQ (Immediate Execution).
    //    await this.workflowQueue.add('execute-workflow', { 
    //      workflowId: workflow.id, 
    //      definition: workflow 
    //    });
    
    this.logger.log(`Enqueued workflow: ${workflowId}`);
    
    // Direct Execution for Testing
    return this.processExecutionJob({ definition: workflow as any });
  }

  /**
   * Helper to convert interval to cron (Placeholder)
   */
  private convertIntervalToCron(value: number, unit: string): string {
    // Implementation logic to convert "5 Minutes" to "*/5 * * * *"
    return '* * * * *'; 
  }

  /**
   * Processes a workflow execution job.
   * This method acts as the worker consumer.
   * 
   * @param jobData The payload containing the workflow definition.
   * @returns The result of the execution.
   */
  async processExecutionJob(jobData: { definition: IWorkflowDefinition }): Promise<IExecutionResult> {
    const { definition } = jobData;
    const executionId = 'exec-' + Date.now();
    const startTime = new Date();
    const nodeResults: any[] = [];

    this.logger.log(`Starting execution ${executionId} for workflow ${definition.name}`, { workflowId: definition.id });

    // 1. Topologically Sort the Nodes (DAG).
    // TODO: Implement actual topological sort using definition.edges.
    // For now, we assume nodes are ordered or we just iterate them.
    const sortedNodes = definition.nodes; 

    // Initialize execution context
    const executionContext: IExecutionResult = {
      id: executionId,
      workflowId: definition.id,
      status: ExecutionStatus.RUNNING,
      startTime: startTime,
      nodeResults: nodeResults,
      // New optional fields for error handling and retry logic
      // retryOnFail: definition.config?.retryOnFail,
      // onError: definition.config?.onError
    };

    // 2. Iterate and Execute Nodes Sequentially.
    for (const node of sortedNodes) {
      try {
        this.logger.log(`Executing node: ${node.name} (${node.type})`, { nodeId: node.id, executionId });
        
        // 3. Handle Credential Injection.
        // Check if the node has linked credentials (assuming property exists from DB include)
        const credentialLinks = (node as any).credentialLinks || [];
        const injectedCredentials: Record<string, string> = {};

        for (const link of credentialLinks) {
          if (link.credential && link.credential.cipherText) {
             // Decrypt the secret using VaultService
             // We assume the credential object has the encrypted text format expected by VaultService
             // In a real app, we'd construct the string from iv/authTag/cipherText
             const encryptedString = link.credential.cipherText.toString(); // Placeholder conversion
             const decrypted = await this.vaultService.decryptSecret(encryptedString);
             injectedCredentials[link.credential.name] = decrypted;
          }
        }

        // 4. Dynamic Resolution
        // Resolve configuration parameters using the current execution context
        const resolvedConfig: Record<string, any> = {};
        // Map configJson to config for backward compatibility in logic
        const nodeConfig = (node as any).configJson || (node as any).config || {};

        for (const [key, value] of Object.entries(nodeConfig)) {
          if (typeof value === 'string') {
            resolvedConfig[key] = resolveDynamicParameters(value, executionContext);
          } else {
            resolvedConfig[key] = value;
          }
        }

        // Inject credentials into config if needed, or keep separate. 
        // For safety, we might pass them separately to the execution method.
        const executionData = {
          config: resolvedConfig,
          credentials: injectedCredentials,
          inputs: executionContext.nodeResults // Pass previous results
        };

        let outputData: any = {};

        // 5. Execute the Node Logic.
        switch (node.type) {
          case 'CODE_CUSTOM':
          case NodeType.LOGIC_CODE:
            // Extract code from config
            const code = resolvedConfig.code || '';
            outputData = await this._executeCodeInSandbox(code, executionData);
            break;
          
          case 'ACTION_HTTP':
          case 'TRIGGER_WEBHOOK':
          case 'EMAIL_SENDER':
          case 'LLM_QUERY':
            // outputData = await this._executeActionNode(node, executionData);
            // Replaced placeholder with actual service call
            outputData = await this.actionRunnerService.executeAction(node, injectedCredentials, executionContext);
            break;

          case 'LOGIC_IF':
            const conditionMet = this._executeLogicNode(node, executionContext);
            outputData = { result: conditionMet };
            
            // TODO: In a real graph traversal, we would determine the next node here.
            // For this linear implementation, we might just store the result.
            // If we were traversing edges, we'd pick the edge labeled 'true' or 'false'.
            this.logger.log(`Logic Node Result: ${conditionMet}`);
            break;
          
          default:
            // outputData = await this._executeActionNode(node, executionData);
            // Replaced placeholder with actual service call
            outputData = await this.actionRunnerService.executeAction(node, injectedCredentials, executionContext);
            break;
        }

        // 6. Store Result.
        const result = {
          nodeId: node.id,
          nodeName: node.name,
          status: 'SUCCESS',
          outputData: outputData,
          startTime: new Date(), // Approximation
          endTime: new Date()
        };
        
        nodeResults.push(result);
        
        // Update context for next nodes
        executionContext.nodeResults = nodeResults;

        // Clear credentials from memory
        for (const key in injectedCredentials) {
          delete injectedCredentials[key];
        }

      } catch (error: any) {
        this.logger.error(`Error executing node ${node.name}: ${error.message}`, error.stack, { nodeId: node.id, executionId });
        nodeResults.push({
          nodeId: node.id,
          nodeName: node.name,
          status: 'FAILED',
          error: error.message,
          startTime: new Date(),
          endTime: new Date()
        });
        
        // Stop execution on failure (unless continueOnFail is set)
        executionContext.status = ExecutionStatus.FAILED;
        executionContext.endTime = new Date();
        return executionContext;
      }
    }

    executionContext.status = ExecutionStatus.SUCCESS;
    executionContext.endTime = new Date();
    return executionContext;
  }

  /**
   * Retrieves an execution result by ID.
   * 
   * @param executionId The ID of the execution.
   */
  async getExecution(executionId: string): Promise<IExecutionResult | null> {
    const execution = await this.prisma.execution.findUnique({ where: { id: executionId } });
    return execution as any;
  }

  /**
   * Placeholder for executing non-code nodes (HTTP, DB, etc.)
   */
  private async _executeActionNode(node: INode, data: any): Promise<any> {
    // Simulate async work
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({ message: `Executed ${node.type}`, processedConfig: data.config });
      }, 100);
    });
  }

  /**
   * Executes custom user code in a secure sandbox.
   * 
   * @param code The JavaScript code to execute.
   * @param data The context data (e.g. previous node outputs) to inject.
   * @returns The result object from the code execution.
   */
  private async _executeCodeInSandbox(code: string, data: any): Promise<object> {
    // Prepare the sandbox context
    const sandbox = {
      input: data.inputs, // Pass previous node results
      axios: axios,
      _: _,
      console: {
        log: (...args: any[]) => this.logger.log(`[Code Node Log] ${args.join(' ')}`),
        error: (...args: any[]) => this.logger.error(`[Code Node Error] ${args.join(' ')}`),
        warn: (...args: any[]) => this.logger.warn(`[Code Node Warn] ${args.join(' ')}`),
      },
    };

    // Create the context
    const context = vm.createContext(sandbox);

    // Wrap the user's code in an async IIFE to allow top-level await
    // We don't use 'return' here because vm.runInNewContext returns the result of the last statement
    const scriptCode = "(async () => { " + code + " })();";
    
    try {
      this.logger.log('Executing sandboxed code...');
      
      // Execute with strict timeout
      // vm.runInNewContext returns the result of the last statement, which is our Promise
      const resultPromise = vm.runInNewContext(scriptCode, context, {
        timeout: 3000, // 3000ms timeout
        displayErrors: true,
      });

      const result = await resultPromise;
      return result || {};
    } catch (error: any) {
      this.logger.error(`Sandbox Error: ${error.message}`);
      throw new Error(`Sandbox Error: ${error.message}`);
    }
  }

  /**
   * Executes a Logic node (e.g., IF/ELSE).
   * 
   * @param node The logic node to execute.
   * @param context The current execution context.
   * @returns True if the condition is met, False otherwise.
   */
  private _executeLogicNode(node: INode, context: IExecutionResult): boolean {
    // Map configJson to config for backward compatibility in logic
    const nodeConfig = (node as any).configJson || (node as any).config || {};
    const { valueA, operator, valueB } = nodeConfig;

    // Resolve dynamic parameters for both values
    const resolvedA = typeof valueA === 'string' ? resolveDynamicParameters(valueA, context) : valueA;
    const resolvedB = typeof valueB === 'string' ? resolveDynamicParameters(valueB, context) : valueB;

    this.logger.log(`Logic Node Comparison: ${resolvedA} ${operator} ${resolvedB}`);

    switch (operator) {
      case 'EQUALS':
        return resolvedA == resolvedB; // Loose equality to handle string/number mismatches
      case 'NOT_EQUALS':
        return resolvedA != resolvedB;
      case 'GT':
        return (resolvedA as any) > (resolvedB as any);
      case 'LT':
        return (resolvedA as any) < (resolvedB as any);
      case 'GTE':
        return (resolvedA as any) >= (resolvedB as any);
      case 'LTE':
        return (resolvedA as any) <= (resolvedB as any);
      case 'CONTAINS':
        if (typeof resolvedA === 'string' && typeof resolvedB === 'string') {
          return resolvedA.includes(resolvedB);
        }
        return false;
      case 'IS_EMPTY':
        return resolvedA === null || resolvedA === undefined || resolvedA === '';
      case 'IS_NOT_EMPTY':
        return resolvedA !== null && resolvedA !== undefined && resolvedA !== '';
      default:
        this.logger.warn(`Unknown operator: ${operator}`);
        return false;
    }
  }
}
