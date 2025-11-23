import { INode } from '../../../../../../packages/shared/src/interfaces/s6s.interface';
import * as vm from 'vm';
import * as _ from 'lodash';
import axios from 'axios';

export class CodeNode {
  /**
   * Executes custom JavaScript code in a sandboxed environment.
   * 
   * @param node The node definition containing the code.
   * @param inputData The data from the previous node.
   * @returns The result of the code execution.
   */
  async execute(node: INode, inputData: any): Promise<any> {
    const { code } = node.config;

    if (!code) {
      throw new Error('Code Node requires a "code" configuration.');
    }

    // Prepare the sandbox context
    const sandbox = {
      input: inputData,
      axios: axios,
      _: _,
      console: {
        log: (...args: any[]) => console.log('[Code Node Log]', ...args),
        error: (...args: any[]) => console.error('[Code Node Error]', ...args),
        warn: (...args: any[]) => console.warn('[Code Node Warn]', ...args),
      },
    };

    // Create the context
    const context = vm.createContext(sandbox);

    // Wrap the user's code in an async IIFE to allow top-level await
    const wrappedCode = `
      (async () => {
        try {
          ${code}
        } catch (err) {
          throw err;
        }
      })();
    `;

    try {
      const script = new vm.Script(wrappedCode);
      
      // Execute with strict timeout
      const result = await script.runInNewContext(context, {
        timeout: 3000, // 3000ms timeout
        displayErrors: true,
      });

      return result;
    } catch (error: any) {
      throw new Error(`Code execution failed: ${error.message}`);
    }
  }
}
