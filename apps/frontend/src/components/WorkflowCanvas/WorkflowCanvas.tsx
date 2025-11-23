import React, { useCallback, useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
import toast from 'react-hot-toast';

// Import shared interface
import { INode, IWorkflowDefinition } from '../../../../../packages/shared/src/interfaces/s6s.interface';
import BaseNode from '../NodeTemplates/BaseNode';
import { NodeConfigPanel } from '../NodeConfigPanel/NodeConfigPanel';
import { NodePalette } from '../NodePalette/NodePalette';
import { sampleLogicFlow } from '../../fixtures/sampleFlow';

import { apiClient } from '../../api/client';

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
  const { id: paramId } = useParams<{ id: string }>();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

  // 1. Add State for workflow metadata
  const [workflowName, setWorkflowName] = useState('My New Workflow');
  const [workflowId, setWorkflowId] = useState<string | undefined>(propWorkflowId || paramId);
  const [executionResults, setExecutionResults] = useState<any[]>([]);
  const [selectedNode, setSelectedNode] = useState<INode | null>(null);

  // Load Workflow Data on Mount
  useEffect(() => {
    const loadWorkflow = async () => {
      if (!workflowId) return;

      try {
        console.log(`Loading workflow ${workflowId}...`);
        const response = await apiClient.get(`/workflows/${workflowId}`);
        const workflow: IWorkflowDefinition = response.data;
        
        setWorkflowName(workflow.name);

        // Map s6s INode back to React Flow Node
        const mappedNodes: Node[] = workflow.nodes.map((node) => ({
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

        const mappedEdges: Edge[] = (workflow.edges || []).map((edge) => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          label: edge.label,
          type: 'default',
        }));

        setNodes(mappedNodes);
        setEdges(mappedEdges);

        setTimeout(() => {
          if (reactFlowInstance) {
            reactFlowInstance.fitView();
          }
        }, 100);

      } catch (error) {
        console.error('Error loading workflow:', error);
      }
    };

    loadWorkflow();
  }, [workflowId, setNodes, setEdges, reactFlowInstance]);

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
          type: type.includes('TRIGGER') 
            ? 'Trigger' 
            : type.includes('LOGIC') || type.includes('CODE')
              ? 'Logic'
              : 'Action', // Simple mapping for BaseNode visualization
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
      type: node.data.nodeType || 'unknown', // This should map back to the specific NodeType enum (e.g. TRIGGER_WEBHOOK)
      config: node.data.config || {},
      inputs: [], // TODO: Derive from edges where target == node.id
      outputs: [], // TODO: Derive from edges where source == node.id
      position: node.position,
    }));

    const payload: IWorkflowDefinition = {
      id: workflowId || '', // ID is ignored on create, used on update
      name: workflowName,
      projectId: 'default-project', // Placeholder
      nodes: mappedNodes,
      edges: flowObject.edges,
      isActive: true,
    };

    // 4. API Call
    try {
      console.log('Sending payload to backend:', payload);
      
      if (workflowId) {
        // Update existing
        await apiClient.patch(`/workflows/${workflowId}`, payload);
        toast.success(`Workflow "${workflowName}" updated successfully!`);
      } else {
        // Create new
        const response = await apiClient.post('/workflows', payload);
        const newWorkflow = response.data;
        setWorkflowId(newWorkflow.id);
        toast.success(`Workflow "${workflowName}" created successfully!`);
        // Update URL without reloading
        navigate(`/workflow/${newWorkflow.id}`, { replace: true });
      }

    } catch (error) {
      console.error('Error saving workflow:', error);
      toast.error('Failed to save workflow.');
    }
  };

  // 5. Run Workflow Function
  const runWorkflow = async () => {
    if (!workflowId) {
      toast.error('Please save the workflow before running.');
      return;
    }

    try {
      console.log(`Running workflow ${workflowId}...`);
      // 1. Trigger Run
      const response = await apiClient.post(`/workflows/${workflowId}/run`);
      const { executionId } = response.data;
      
      console.log(`Execution started: ${executionId}`);
      toast.success(`Execution started! ID: ${executionId}`);

      // 2. Polling Loop
      const pollInterval = setInterval(async () => {
        try {
          console.log(`Polling execution ${executionId}...`);
          const statusRes = await apiClient.get(`/executions/${executionId}`);
          const statusData = statusRes.data;
          
          if (statusData.status === 'SUCCESS' || statusData.status === 'FAILED') {
            clearInterval(pollInterval);
            if (statusData.status === 'SUCCESS') {
                toast.success(`Execution finished successfully!`);
            } else {
                toast.error(`Execution failed.`);
            }
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
      toast.error('Failed to run workflow.');
    }
  };

  return (
    <div className="flex h-screen w-full flex-col bg-[#0d1117]">
      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b border-[#30363d] bg-[#161b22] px-4 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 border-r border-[#30363d] pr-4 mr-2">
             <img src="/s6s_icon.png" alt="S6S" className="w-6 h-6 rounded-md" />
             <span className="text-white font-bold text-sm tracking-tight">S6S</span>
          </div>
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
