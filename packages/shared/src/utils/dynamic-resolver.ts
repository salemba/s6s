import { IExecutionResult } from '../interfaces/s6s.interface';

/**
 * Resolves dynamic parameters in a template string using the current execution context.
 * Supports syntax like: {{ $node["StepName"].json.outputKey }}
 * 
 * @param template The configuration string containing placeholders.
 * @param context The current state of the workflow execution, containing results from previous nodes.
 * @returns The resolved value. If the template is a single placeholder, returns the raw value (object/number/boolean). 
 *          If mixed with text, returns a string.
 */
export function resolveDynamicParameters(template: string, context: IExecutionResult): string | number | boolean | object | null {
  // 1. Identify all dynamic link placeholders.
  //    Regex pattern to match {{ ... }} blocks.
  //    Example regex: /\{\{\s*(.*?)\s*\}\}/g
  
  // Check if the template is a pure placeholder (e.g. "{{ $node['A'].json }}") to return raw objects.
  // if (isPurePlaceholder(template)) { ... }

  // 2. Iterate through matches to resolve each placeholder.
  //    const matches = template.matchAll(/\{\{\s*(.*?)\s*\}\}/g);
  
  //    for (const match of matches) {
  //      const expression = match[1]; // e.g., '$node["StepName"].json.outputKey'
          
          // 2a. Parse the node name.
          //     Extract 'StepName' from '$node["StepName"]' or '$node.StepName'.
          
          // 2b. Parse the JSON path.
          //     Extract the property path after the node reference (e.g., 'json.outputKey').

  //      // 3. Safely traverse the context.
  //      //    Find the node result in context.nodeResults where nodeName === 'StepName'.
  //      const nodeResult = context.nodeResults.find(n => n.nodeName === targetNodeName);
          
  //      if (!nodeResult) {
  //        // Handle case where node hasn't run yet or doesn't exist.
  //        throw new Error(`Referenced node '${targetNodeName}' not found in execution context.`);
  //      }

  //      //    Traverse nodeResult.outputData using the extracted path (e.g. lodash.get style).
  //      const value = getValueByPath(nodeResult.outputData, path);

  //      // 4. Replace the placeholder in the template.
  //      //    If it's a string interpolation, replace match[0] with String(value).
  //    }

  // 5. Return the fully resolved string (or raw value if it was a pure placeholder).
  
  return template; // Placeholder return
}
