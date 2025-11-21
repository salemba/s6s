import React, { useCallback, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactFlow, {
  ReactFlowProvider,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  ReactFlowInstance,
  Node,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Play, Save, ArrowLeft } from 'lucide-react';

// Import shared interface
import { INode, IWorkflowDefinition } from '../../../../../packages/shared/src/interfaces/s6s.interface';
import BaseNode from '../NodeTemplates/BaseNode';
import { NodeConfigPanel } from '../NodeConfigPanel/NodeConfigPanel';
import { NodePalette } from '../NodePalette/NodePalette';
import { sampleLogicFlow } from '../../fixtures/sampleFlow';

const nodeTypes = {
  custom: BaseNode,
};

const initialNodes = [
  {
    id: '1',
    type: 'custom',
    data: { label: 'Start Trigger', type: 'Trigger', name: 'Start Trigger' },
    position: { x: 250, y: 5 },
  },
];

const initialEdges: Edge[] = [];

export interface WorkflowCanvasProps {
  nodeResults?: any[];
  workflowId?: string;
}

export const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({ nodeResults: propNodeResults, workflowId: propWorkflowId }) => {
  const navigate = useNavigate();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

  // 1. Add State for workflow metadata
  const [workflowName, setWorkflowName] = useState('My New Workflow');
  const [workflowId, setWorkflowId] = useState<string | undefined>(propWorkflowId);
  const [executionResults, setExecutionResults] = useState<any[]>([]);
  const [selectedNode, setSelectedNode] = useState<INode | null>(null);

  // Load Workflow Data on Mount
  React.useEffect(() => {
    const loadWorkflow = async () => {
      if (!propWorkflowId) return;

      let workflowData: IWorkflowDefinition | null = null;

      if (propWorkflowId === 'sample') {
        console.log('Loading sample workflow...');
        workflowData = sampleLogicFlow;
      } else {
        // TODO: Fetch from API
        // const res = await fetch(`/api/workflows/${propWorkflowId}`);
        // workflowData = await res.json();
        console.log(`Fetching workflow ${propWorkflowId} from API...`);
      }

      if (workflowData) {
        setWorkflowName(workflowData.name);
        setWorkflowId(workflowData.id);

        // Map Nodes
        const mappedNodes = workflowData.nodes.map((node) => ({
          id: node.id,
          type: 'custom', // Always use 'custom' for our BaseNode template
          position: node.position || { x: 0, y: 0 },
          data: {
            label: node.name,
            name: node.name,
            type: node.type.toString().includes('TRIGGER') 
              ? 'Trigger' 
              : node.type.toString().includes('LOGIC') 
                ? 'Logic' 
                : 'Action', // Visual category
            nodeType: node.type, // Specific type
            config: node.config,
          },
        }));

        // Map Edges
        const mappedEdges = (workflowData.edges || []).map((edge) => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          label: edge.label,
          type: 'default', // or 'smoothstep'
        }));

        setNodes(mappedNodes);
        setEdges(mappedEdges);

        // Fit View after a short delay to allow rendering
        setTimeout(() => {
          if (reactFlowInstance) {
            reactFlowInstance.fitView();
          }
        }, 100);
      }
    };

    loadWorkflow();
  }, [propWorkflowId, setNodes, setEdges, reactFlowInstance]);

  // Handler for node selection
  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    // Map ReactFlow node to s6s INode for the config panel
    const mappedNode: INode = {
      id: node.id,
      name: node.data.name || node.data.label,
      type: node.data.nodeType || 'unknown', // Use the specific type stored in data
      config: node.data.config || {},
      inputs: [],
      outputs: [],
      position: node.position,
    };
    setSelectedNode(mappedNode);
  }, []);

  // Handler for updating node configuration from the panel
  const onUpdateNode = useCallback((nodeId: string, newConfig: Record<string, any>) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              config: newConfig,
              // Also update name if it was changed in the config (optional, but good UX)
              name: newConfig.name || node.data.name, 
              label: newConfig.name || node.data.label,
            },
          };
        }
        return node;
      })
    );
    
    // Update local selected node state to reflect changes immediately
    setSelectedNode((prev) => {
      if (!prev || prev.id !== nodeId) return prev;
      return { ...prev, config: newConfig, name: newConfig.name || prev.name };
    });
  }, [setNodes]);

  // Effect to update nodes when execution results change (either from prop or internal state)
  React.useEffect(() => {
    const resultsToProcess = propNodeResults || executionResults;
    
    if (resultsToProcess.length > 0) {
      setNodes((nds) =>
        nds.map((node) => {
          const result = resultsToProcess.find((r) => r.nodeId === node.id);
          if (result) {
            return {
              ...node,
              data: {
                ...node.data,
                executionStatus: result.status, // 'SUCCESS' | 'FAILED'
                // We could also add output data here if we wanted to display it
              },
            };
          }
          return node;
        })
      );
    }
  }, [propNodeResults, executionResults, setNodes]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow/type');
      const label = event.dataTransfer.getData('application/reactflow/label');

      if (typeof type === 'undefined' || !type) {
        return;
      }

      // Calculate position
      let position = { x: 0, y: 0 };
      if (reactFlowInstance && reactFlowWrapper.current) {
        const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
        position = reactFlowInstance.project({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        });
      }

      const newNode = {
        id: crypto.randomUUID(),
        type: 'custom', // Using 'custom' to map to BaseNode
        position,
        data: { 
          label: label, 
          type: type.includes('TRIGGER') ? 'Trigger' : 'Action', // Simple mapping for BaseNode visualization
          nodeType: type, // Store specific type (e.g., ACTION_HTTP)
          name: label,
          config: {} // Initialize config
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes],
  );

  // Handler for deleting nodes (via button or keyboard)
  const onNodesDelete = useCallback(
    (deleted: Node[]) => {
      // Deselect if the deleted node was selected
      if (selectedNode && deleted.some((n) => n.id === selectedNode.id)) {
        setSelectedNode(null);
      }
    },
    [selectedNode]
  );

  const handleDeleteNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
    if (selectedNode?.id === nodeId) {
      setSelectedNode(null);
    }
  }, [selectedNode, setNodes, setEdges]);

  // 2. Add Save Function
  const saveWorkflowToBackend = async () => {
    if (!reactFlowInstance) return;

    // 3. Payload Preparation
    const flowObject = reactFlowInstance.toObject();

    // Map React Flow nodes to s6s INode structure
    // Note: We need to map the visual state (position, data) to the logical schema.
    const mappedNodes: INode[] = flowObject.nodes.map((node) => ({
      id: node.id,
      name: node.data.name || node.id,
      type: node.data.type || 'unknown', // This should map back to the specific NodeType enum (e.g. TRIGGER_WEBHOOK)
      config: node.data.config || {},
      inputs: [], // TODO: Derive from edges where target == node.id
      outputs: [], // TODO: Derive from edges where source == node.id
      position: node.position,
    }));

    const payload: IWorkflowDefinition = {
      id: workflowId || crypto.randomUUID(),
      name: workflowName,
      projectId: 'default-project', // Placeholder
      nodes: mappedNodes,
      edges: flowObject.edges,
      isActive: true,
    };

    // 4. API Call
    try {
      console.log('Sending payload to backend:', payload);
      // const response = await fetch('/api/workflows', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(payload),
      // });
      // const data = await response.json();
      // setWorkflowId(data.id);
      alert(`Workflow "${workflowName}" saved successfully! (Simulated)`);
      
      // Simulate setting an ID if one doesn't exist
      if (!workflowId) setWorkflowId('simulated-workflow-id');

    } catch (error) {
      console.error('Error saving workflow:', error);
      alert('Failed to save workflow.');
    }
  };

  // 5. Run Workflow Function
  const runWorkflow = async () => {
    if (!workflowId) {
      alert('Please save the workflow before running.');
      return;
    }

    try {
      console.log(`Running workflow ${workflowId}...`);
      // 1. Trigger Run
      // const response = await fetch(`/api/workflows/${workflowId}/run`, { method: 'POST' });
      // const { executionId } = await response.json();
      
      const executionId = 'exec-' + Date.now(); // Simulated ID
      console.log(`Execution started: ${executionId}`);
      alert(`Execution started! ID: ${executionId}`);

      // 2. Polling Loop
      const pollInterval = setInterval(async () => {
        try {
          console.log(`Polling execution ${executionId}...`);
          // const statusRes = await fetch(`/api/workflows/execution/${executionId}`);
          // const statusData = await statusRes.json();
          
          // Simulated Response
          const statusData = { 
            status: 'SUCCESS', 
            nodeResults: [
              { nodeId: '1', status: 'SUCCESS', outputData: { message: 'Triggered' } }
            ] 
          };

          if (statusData.status === 'SUCCESS' || statusData.status === 'FAILED') {
            clearInterval(pollInterval);
            alert(`Execution finished with status: ${statusData.status}`);
            console.log('Execution Results:', statusData);
            setExecutionResults(statusData.nodeResults); // Update state to trigger visualization
          }
        } catch (err) {
          console.error('Polling error:', err);
          clearInterval(pollInterval);
        }
      }, 3000);

    } catch (error) {
      console.error('Error running workflow:', error);
      alert('Failed to run workflow.');
    }
  };

  return (
    <div className="flex h-screen w-full flex-col bg-[#0d1117]">
      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b border-[#30363d] bg-[#161b22] px-4 shrink-0">
        <div className="flex items-center gap-4">
          <button 
            className="text-gray-400 hover:text-gray-200 cursor-pointer"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex flex-col">
             <input
              type="text"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              className="bg-transparent text-sm font-semibold text-gray-200 outline-none focus:text-blue-400"
            />
            <span className="text-[10px] text-gray-500">Last saved: Just now</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
           <button
            onClick={saveWorkflowToBackend}
            className="flex items-center gap-2 rounded-md border border-[#30363d] bg-[#21262d] px-3 py-1.5 text-xs font-medium text-gray-300 hover:bg-[#30363d] hover:text-white transition-colors"
          >
            <Save size={14} />
            Save
          </button>
          <button
            onClick={runWorkflow}
            className="flex items-center gap-2 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Play size={14} />
            Run
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Node Palette */}
        <NodePalette />

        {/* Canvas */}
        <div className="flex-1 relative bg-[#0d1117]" ref={reactFlowWrapper}>
          <ReactFlowProvider>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={onNodeClick}
              onInit={setReactFlowInstance}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onNodesDelete={onNodesDelete}
              deleteKeyCode={['Backspace', 'Delete']}
              nodeTypes={nodeTypes}
              fitView
              className="bg-[#0d1117]"
            >
              <Background color="#30363d" gap={20} size={1} variant={BackgroundVariant.Dots} />
              <Controls className="bg-[#161b22] border border-[#30363d] text-gray-400 [&>button]:border-b-[#30363d] [&>button:hover]:bg-[#21262d] [&>button:hover]:text-gray-200" />
            </ReactFlow>
          </ReactFlowProvider>
        </div>
        
        {/* Config Panel */}
        {selectedNode && (
            <NodeConfigPanel
            selectedNode={selectedNode}
            onUpdateNode={onUpdateNode}
            onDelete={handleDeleteNode}
            onClose={() => setSelectedNode(null)}
            />
        )}
      </div>
    </div>
  );
};
