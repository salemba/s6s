import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Zap, GitMerge, Box, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export interface BaseNodeData {
  name: string;
  type: 'Trigger' | 'Action' | 'Logic';
  description?: string;
  executionStatus?: 'RUNNING' | 'SUCCESS' | 'FAILED';
  nodeType?: string; // e.g. TRIGGER_WEBHOOK
}

const BaseNode = ({ id, data }: NodeProps<BaseNodeData>) => {
  const isTrigger = data.type === 'Trigger';

  // Icon selection
  const getIcon = () => {
    if (data.executionStatus === 'RUNNING') return <Loader2 size={14} className="animate-spin" />;
    if (data.executionStatus === 'SUCCESS') return <CheckCircle2 size={14} />;
    if (data.executionStatus === 'FAILED') return <XCircle size={14} />;
    
    if (data.type === 'Trigger') return <Zap size={14} />;
    if (data.type === 'Logic') return <GitMerge size={14} />;
    return <Box size={14} />;
  };

  // Dynamic styling
  let headerBg = 'bg-[#21262d]';
  let headerBorder = 'border-[#30363d]';
  let iconColor = 'text-gray-400';
  let titleColor = 'text-gray-200';

  if (data.executionStatus === 'RUNNING') {
    headerBg = 'bg-yellow-900/30';
    headerBorder = 'border-yellow-700/50';
    iconColor = 'text-yellow-500';
  } else if (data.executionStatus === 'SUCCESS') {
    headerBg = 'bg-green-900/30';
    headerBorder = 'border-green-700/50';
    iconColor = 'text-green-500';
  } else if (data.executionStatus === 'FAILED') {
    headerBg = 'bg-red-900/30';
    headerBorder = 'border-red-700/50';
    iconColor = 'text-red-500';
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
      <div className={`flex items-center gap-3 rounded-t-lg border-b ${headerBorder} px-4 py-3 ${headerBg}`}>
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
