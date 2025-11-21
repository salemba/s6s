import { resolveDynamicParameters } from './dynamic-resolver';
import { IExecutionResult, ExecutionStatus } from '../../interfaces/s6s.interface';

describe('resolveDynamicParameters', () => {
  const mockContext: IExecutionResult = {
    id: 'exec-1',
    workflowId: 'wf-1',
    status: ExecutionStatus.RUNNING,
    startTime: new Date(),
    nodeResults: [
      {
        nodeId: 'node-1',
        nodeName: 'Trigger',
        status: 'SUCCESS',
        startTime: new Date(),
        endTime: new Date(),
        outputData: {
          body: {
            data: 'some-value',
            items: [1, 2, 3],
            nested: {
              key: 'nested-value'
            }
          },
          headers: {
            'content-type': 'application/json'
          }
        }
      },
      {
        nodeId: 'node-2',
        nodeName: 'Transform',
        status: 'SUCCESS',
        startTime: new Date(),
        endTime: new Date(),
        outputData: {
          result: 42
        }
      }
    ]
  };

  it('should return the original string if no template syntax is present', () => {
    const input = 'static string';
    const result = resolveDynamicParameters(input, mockContext);
    expect(result).toBe(input);
  });

  it('should resolve a simple path from a node output', () => {
    const input = "{{ $node['Trigger'].body.data }}";
    const result = resolveDynamicParameters(input, mockContext);
    expect(result).toBe('some-value');
  });

  it('should resolve nested object paths', () => {
    const input = "{{ $node['Trigger'].body.nested.key }}";
    const result = resolveDynamicParameters(input, mockContext);
    expect(result).toBe('nested-value');
  });

  it('should resolve array indices', () => {
    const input = "{{ $node['Trigger'].body.items[1] }}";
    const result = resolveDynamicParameters(input, mockContext);
    expect(result).toBe(2);
  });

  it('should resolve multiple parameters in one string', () => {
    const input = "Value: {{ $node['Trigger'].body.data }} - Count: {{ $node['Transform'].result }}";
    const result = resolveDynamicParameters(input, mockContext);
    expect(result).toBe('Value: some-value - Count: 42');
  });

  it('should return undefined or null string for missing nodes', () => {
    const input = "{{ $node['NonExistent'].data }}";
    // Depending on implementation, this might return 'undefined', '', or throw.
    // Assuming standard behavior of returning undefined or empty string for safety.
    const result = resolveDynamicParameters(input, mockContext);
    expect(result).toBeUndefined(); 
  });

  it('should return undefined for missing keys in existing nodes', () => {
    const input = "{{ $node['Trigger'].body.missingKey }}";
    const result = resolveDynamicParameters(input, mockContext);
    expect(result).toBeUndefined();
  });

  it('should handle complex mixed content', () => {
    const input = "The result is {{ $node['Transform'].result }}!";
    const result = resolveDynamicParameters(input, mockContext);
    expect(result).toBe('The result is 42!');
  });
});
