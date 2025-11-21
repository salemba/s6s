import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../components/Layout/Sidebar';
import { Activity, CheckCircle, XCircle, Clock, Calendar } from 'lucide-react';

interface LogEntry {
  id: string;
  workflowName: string;
  status: 'SUCCESS' | 'FAILED' | 'RUNNING';
  triggerType: string;
  duration: string;
  timestamp: string;
}

export const LogsPage: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Connect to API GET /api/executions
    // Mock data for now
    const mockLogs: LogEntry[] = [
      {
        id: '1',
        workflowName: 'Daily Data Sync',
        status: 'SUCCESS',
        triggerType: 'CRON',
        duration: '45s',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      },
      {
        id: '2',
        workflowName: 'New User Onboarding',
        status: 'SUCCESS',
        triggerType: 'WEBHOOK',
        duration: '1.2s',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      },
      {
        id: '3',
        workflowName: 'Payment Processing',
        status: 'FAILED',
        triggerType: 'WEBHOOK',
        duration: '5.0s',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      },
      {
        id: '4',
        workflowName: 'Slack Notification',
        status: 'SUCCESS',
        triggerType: 'EVENT',
        duration: '0.5s',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      },
    ];

    setTimeout(() => {
      setLogs(mockLogs);
      setLoading(false);
    }, 500);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'FAILED': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'RUNNING': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS': return <CheckCircle size={14} className="mr-1.5" />;
      case 'FAILED': return <XCircle size={14} className="mr-1.5" />;
      default: return <Activity size={14} className="mr-1.5" />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0d1117]">
      <Sidebar />
      
      <div className="flex-1 ml-64 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
              <Activity className="text-[#1f6feb]" />
              System Logs
            </h1>
            <p className="text-[#8b949e] mt-2">Recent execution history and system events.</p>
          </div>

          {/* Table */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#21262d] border-b border-[#30363d]">
                  <th className="p-4 text-xs font-bold text-[#8b949e] uppercase tracking-wider">Workflow Name</th>
                  <th className="p-4 text-xs font-bold text-[#8b949e] uppercase tracking-wider">Status</th>
                  <th className="p-4 text-xs font-bold text-[#8b949e] uppercase tracking-wider">Trigger</th>
                  <th className="p-4 text-xs font-bold text-[#8b949e] uppercase tracking-wider">Duration</th>
                  <th className="p-4 text-xs font-bold text-[#8b949e] uppercase tracking-wider text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#30363d]">
                {loading ? (
                  <tr><td colSpan={5} className="p-8 text-center text-[#8b949e]">Loading logs...</td></tr>
                ) : logs.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-[#8b949e]">No logs found.</td></tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#21262d] transition-colors">
                      <td className="p-4">
                        <span className="font-medium text-white">{log.workflowName}</span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(log.status)}`}>
                          {getStatusIcon(log.status)}
                          {log.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-[#c9d1d9] text-sm bg-[#30363d] px-2 py-1 rounded font-mono text-xs">
                          {log.triggerType}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center text-[#8b949e] text-sm">
                          <Clock size={14} className="mr-2" />
                          {log.duration}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end text-[#8b949e] text-sm">
                          <Calendar size={14} className="mr-2" />
                          {new Date(log.timestamp).toLocaleString()}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
