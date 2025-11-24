import React, { memo, useState, useEffect } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Zap, GitMerge, Box, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { getExecutionState, getHeaderColor } from '../../utils/execution-status';

export interface BaseNodeData {
  name: string;
  type: 'Trigger' | 'Action' | 'Logic';
  description?: string;
  executionStatus?: 'RUNNING' | 'SUCCESS' | 'FAILED';
  nodeType?: string; // e.g. TRIGGER_WEBHOOK
  startTime?: string | Date;
}

const BaseNode = ({ id, data }: NodeProps<BaseNodeData>) => {
  const isTrigger = data.type === 'Trigger';
  const [currentState, setCurrentState] = useState(getExecutionState(data.executionStatus, data.startTime));

  useEffect(() => {
    setCurrentState(getExecutionState(data.executionStatus, data.startTime));

    let interval: NodeJS.Timeout;
    if (data.executionStatus === 'RUNNING') {
      interval = setInterval(() => {
        setCurrentState(getExecutionState(data.executionStatus, data.startTime));
      }, 60000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [data.executionStatus, data.startTime]);

  // Icon selection
  const getIcon = () => {
    if (currentState === 'RUNNING') return <Loader2 size={14} className="animate-spin text-white" />;
    if (currentState === 'SUCCESS') return <CheckCircle2 size={14} className="text-white" />;
    if (currentState === 'FAILED') return <XCircle size={14} className="text-white" />;
    if (currentState === 'STUCK') return <Loader2 size={14} className="text-gray-600" />;
    
    if (data.type === 'Trigger') return <Zap size={14} />;
    if (data.type === 'Logic') return <GitMerge size={14} />;
    return <Box size={14} />;
  };

  // Dynamic styling
  let headerBg = 'bg-[#21262d]';
  let headerBorder = 'border-[#30363d]';
  let iconColor = 'text-gray-400';
  let titleColor = 'text-gray-200';
  let headerStyle = {};

  const stateColor = getHeaderColor(currentState);
  if (stateColor) {
    headerStyle = { backgroundColor: stateColor };
    // Reset tailwind bg if we use inline style
    headerBg = ''; 
    iconColor = 'text-white';
    titleColor = 'text-white';
  } else if (isTrigger) {
    iconColor = 'text-blue-400';
  }

  return (
    <div className={`min-w-[240px] rounded-lg border ${headerBorder} bg-[#161b22] shadow-xl transition-all hover:ring-1 hover:ring-blue-500/50`}>
      {/* Input Handle */}
      {!isTrigger && (
        <Handle
          type="target"
          position={Position.Top}
          className="!h-3 !w-3 !bg-[#30363d] !border-2 !border-[#0d1117]"
        />
      )}

      {/* Node Header */}
      <div 
        className={`flex items-center gap-3 rounded-t-lg border-b ${headerBorder} px-4 py-3 ${headerBg}`}
        style={headerStyle}
      >
        <div className={`flex h-8 w-8 items-center justify-center rounded-md bg-[#0d1117] ${iconColor}`}>
          {getIcon()}
        </div>
        <div className="flex flex-col overflow-hidden">
          <div className={`truncate text-sm font-semibold ${titleColor}`} title={data.name}>
            {data.name}
          </div>
          <div className="text-[10px] font-medium uppercase tracking-wider text-gray-500">
            {data.type}
          </div>
        </div>
      </div>

      {/* Node Body */}
      <div className="rounded-b-lg bg-[#161b22] p-3">
        <div className="flex items-center justify-between">
           <div className="font-mono text-[10px] text-gray-600">ID: {id.slice(0, 8)}</div>
           {data.nodeType && <div className="text-[10px] text-gray-600">{data.nodeType.split('_')[1] || data.nodeType}</div>}
        </div>
        {data.description && (
          <div className="mt-2 truncate text-xs text-gray-400">
            {data.description}
          </div>
        )}
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-3 !w-3 !bg-[#30363d] !border-2 !border-[#0d1117]"
      />
    </div>
  );
};

export default memo(BaseNode);
