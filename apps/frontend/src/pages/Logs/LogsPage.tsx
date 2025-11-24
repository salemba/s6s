import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../components/Layout/Sidebar';
import { Activity, CheckCircle, XCircle, Clock, Calendar, ChevronRight, ChevronDown } from 'lucide-react';
import { apiClient } from '../../api/client';
import { format } from 'date-fns';

interface ExecutionLog {
  id: string;
  workflowId: string;
  status: 'SUCCESS' | 'FAILED' | 'RUNNING';
  startTime: string;
  endTime?: string;
  durationMs?: number;
  summary: NodeLog[];
  workflow: {
    name: string;
  };
}

interface NodeLog {
  nodeId: string;
  nodeType: string;
  status: 'SUCCESS' | 'FAILED';
  startTime: string;
  endTime: string;
  input: any;
  output: any;
  error?: string;
}

export const LogsPage: React.FC = () => {
  const [logs, setLogs] = useState<ExecutionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<ExecutionLog | null>(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await apiClient.get('/executions/logs/history');
      setLogs(response.data);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (log: ExecutionLog) => {
    setSelectedLog(log);
  };

  const closeDetails = () => {
    setSelectedLog(null);
  };

  return (
    <div className="flex h-screen bg-[#0d1117] text-gray-300 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-[#30363d] bg-[#161b22] flex items-center px-6 justify-between">
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-blue-400" />
            <h1 className="text-lg font-semibold text-white">Execution History</h1>
          </div>
          <button onClick={fetchLogs} className="text-sm text-blue-400 hover:text-blue-300">
            Refresh
          </button>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="text-center py-10">Loading logs...</div>
          ) : (
            <div className="bg-[#161b22] border border-[#30363d] rounded-lg overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#21262d] text-gray-400 font-medium">
                  <tr>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Workflow</th>
                    <th className="px-4 py-3">Start Time</th>
                    <th className="px-4 py-3">Duration</th>
                    <th className="px-4 py-3">ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#30363d]">
                  {logs.map((log) => (
                    <tr 
                      key={log.id} 
                      onClick={() => handleRowClick(log)}
                      className="hover:bg-[#21262d] cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3">
                        <StatusBadge status={log.status} />
                      </td>
                      <td className="px-4 py-3 font-medium text-white">{log.workflow?.name || 'Unknown Workflow'}</td>
                      <td className="px-4 py-3 text-gray-400">
                        {format(new Date(log.startTime), 'MMM d, HH:mm:ss')}
                      </td>
                      <td className="px-4 py-3 text-gray-400">
                        {log.durationMs ? `${log.durationMs}ms` : '-'}
                      </td>
                      <td className="px-4 py-3 text-gray-500 font-mono text-xs">
                        {log.id.substring(0, 8)}...
                      </td>
                    </tr>
                  ))}
                  {logs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                        No execution logs found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </main>

        {/* Details Modal/Panel */}
        {selectedLog && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-end z-50" onClick={closeDetails}>
            <div className="w-[600px] bg-[#161b22] border-l border-[#30363d] h-full shadow-2xl overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
              <div className="h-16 border-b border-[#30363d] flex items-center justify-between px-6 bg-[#21262d]">
                <h2 className="font-semibold text-white">Execution Details</h2>
                <button onClick={closeDetails} className="text-gray-400 hover:text-white">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Summary Info */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-[#0d1117] rounded border border-[#30363d]">
                  <div>
                    <div className="text-xs text-gray-500 uppercase mb-1">Status</div>
                    <StatusBadge status={selectedLog.status} />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase mb-1">Duration</div>
                    <div className="text-white font-mono">{selectedLog.durationMs}ms</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-xs text-gray-500 uppercase mb-1">Workflow</div>
                    <div className="text-white">{selectedLog.workflow?.name}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-xs text-gray-500 uppercase mb-1">ID</div>
                    <div className="text-gray-400 font-mono text-xs">{selectedLog.id}</div>
                  </div>
                </div>

                {/* Node Logs */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">Node Execution Steps</h3>
                  <div className="space-y-2">
                    {selectedLog.summary && Array.isArray(selectedLog.summary) ? (
                      selectedLog.summary.map((nodeLog, index) => (
                        <NodeLogItem key={index} nodeLog={nodeLog} />
                      ))
                    ) : (
                      <div className="text-gray-500 italic">No node logs available.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  if (status === 'SUCCESS') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-900/30 text-green-400 border border-green-900/50">
        <CheckCircle className="w-3 h-3 mr-1" /> Success
      </span>
    );
  }
  if (status === 'FAILED') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-900/30 text-red-400 border border-red-900/50">
        <XCircle className="w-3 h-3 mr-1" /> Failed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-900/30 text-blue-400 border border-blue-900/50">
      <Activity className="w-3 h-3 mr-1" /> {status}
    </span>
  );
};

const NodeLogItem: React.FC<{ nodeLog: NodeLog }> = ({ nodeLog }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-[#30363d] rounded bg-[#0d1117] overflow-hidden">
      <div 
        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-[#21262d] transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          {expanded ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
          <div>
            <div className="text-sm font-medium text-white flex items-center gap-2">
              {nodeLog.nodeId} 
              <span className="text-xs text-gray-500 font-normal">({nodeLog.nodeType})</span>
            </div>
          </div>
        </div>
        <StatusBadge status={nodeLog.status} />
      </div>
      
      {expanded && (
        <div className="border-t border-[#30363d] p-4 bg-[#0d1117]">
          {nodeLog.error && (
            <div className="mb-4 p-3 bg-red-900/20 border border-red-900/50 rounded text-red-400 text-sm">
              <strong>Error:</strong> {nodeLog.error}
            </div>
          )}
          
          <div className="grid grid-cols-1 gap-4">
            <div>
              <div className="text-xs text-gray-500 uppercase mb-1">Input</div>
              <pre className="bg-[#161b22] p-3 rounded text-xs font-mono text-gray-300 overflow-x-auto border border-[#30363d]">
                {JSON.stringify(nodeLog.input, null, 2)}
              </pre>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase mb-1">Output</div>
              <pre className="bg-[#161b22] p-3 rounded text-xs font-mono text-gray-300 overflow-x-auto border border-[#30363d]">
                {JSON.stringify(nodeLog.output, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
