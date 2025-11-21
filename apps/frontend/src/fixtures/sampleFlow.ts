import { IWorkflowDefinition, NodeType } from '../../../../packages/shared/src/interfaces/s6s.interface';

export const sampleLogicFlow: IWorkflowDefinition = {
  id: 'logic-test-flow-1',
  name: 'Logic Test Flow',
  projectId: 'default-project',
  isActive: true,
  nodes: [
    {
      id: 'node-1',
      name: 'Start Trigger',
      type: NodeType.TRIGGER_WEBHOOK,
      position: { x: 100, y: 100 },
      config: {
        path: '/test-logic',
        method: 'GET'
      },
      inputs: [],
      outputs: ['node-2']
    },
    {
      id: 'node-2',
      name: 'Fetch Post',
      type: NodeType.ACTION_HTTP,
      position: { x: 300, y: 100 },
      config: {
        url: 'https://jsonplaceholder.typicode.com/posts/1',
        method: 'GET'
      },
      inputs: ['node-1'],
      outputs: ['node-3']
    },
    {
      id: 'node-3',
      name: 'Check User ID',
      type: NodeType.LOGIC_IF,
      position: { x: 500, y: 100 },
      config: {
        valueA: '{{ $node["Fetch Post"].json.userId }}',
        operator: 'EQUALS',
        valueB: '1'
      },
      inputs: ['node-2'],
      outputs: ['node-4', 'node-5']
    },
    {
      id: 'node-4',
      name: 'SUCCESS Path',
      type: NodeType.ACTION_HTTP, // Using HTTP as a placeholder for a "Log" or "Success" action
      position: { x: 700, y: 50 },
      config: {
        url: 'https://httpbin.org/anything/success',
        method: 'POST',
        body: '{ "status": "User ID matched!" }'
      },
      inputs: ['node-3'],
      outputs: []
    },
    {
      id: 'node-5',
      name: 'FAILURE Path',
      type: NodeType.ACTION_HTTP,
      position: { x: 700, y: 200 },
      config: {
        url: 'https://httpbin.org/anything/failure',
        method: 'POST',
        body: '{ "status": "User ID did not match." }'
      },
      inputs: ['node-3'],
      outputs: []
    }
  ],
  edges: [
    { id: 'e1-2', source: 'node-1', target: 'node-2' },
    { id: 'e2-3', source: 'node-2', target: 'node-3' },
    { id: 'e3-4', source: 'node-3', target: 'node-4', label: 'true' },
    { id: 'e3-5', source: 'node-3', target: 'node-5', label: 'false' }
  ]
};
