import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Workflow, 
  FileText, 
  Link as LinkIcon, 
  Settings, 
  HelpCircle, 
  Plus, 
  Search, 
  MoreVertical, 
  ArrowUp, 
  ArrowDown, 
  Minus 
} from 'lucide-react';

interface WorkflowItem {
  id: string;
  name: string;
  status: 'Active' | 'Error' | 'Draft';
  lastRun: string;
  isActive: boolean;
}

export const Dashboard: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock Data matching the design
  const [workflows, setWorkflows] = useState<WorkflowItem[]>([
    { id: '1', name: 'Daily Data Sync', status: 'Active', lastRun: '2023-10-27 10:00 AM', isActive: true },
    { id: '2', name: 'User Onboarding Email', status: 'Active', lastRun: '2023-10-27 09:45 AM', isActive: true },
    { id: '3', name: 'Invoice Generation', status: 'Error', lastRun: '2023-10-27 09:30 AM', isActive: false },
    { id: '4', name: 'Social Media Poster', status: 'Draft', lastRun: 'Never', isActive: false },
    { id: '5', name: 'Weekly Report Aggregator', status: 'Active', lastRun: '2023-10-26 05:00 PM', isActive: true },
  ]);

  const toggleWorkflow = (id: string) => {
    setWorkflows(workflows.map(w => 
      w.id === id ? { ...w, isActive: !w.isActive } : w
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-900/30 text-green-400 border border-green-900/50';
      case 'Error': return 'bg-red-900/30 text-red-400 border border-red-900/50';
      case 'Draft': return 'bg-gray-700/30 text-gray-400 border border-gray-700/50';
      default: return 'bg-gray-700/30 text-gray-400';
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0d1117] text-gray-300 font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-[#30363d] flex flex-col bg-[#0d1117]">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-[#0d1117] font-bold text-xs">
            S6S
          </div>
          <div>
            <h1 className="font-bold text-white leading-tight">s6s</h1>
            <p className="text-[10px] text-gray-500 font-medium">Workflow Automation</p>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-4">
          <NavItem icon={<LayoutDashboard size={18} />} label="Dashboard" active />
          <NavItem icon={<Workflow size={18} />} label="Workflows" />
          <NavItem icon={<FileText size={18} />} label="Logs" />
          <NavItem icon={<LinkIcon size={18} />} label="Connections" />
        </nav>

        <div className="p-4 border-t border-[#30363d] space-y-1">
          <NavItem icon={<Settings size={18} />} label="Settings" />
          <NavItem icon={<HelpCircle size={18} />} label="Help" />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-1">Dashboard</h2>
            <p className="text-gray-500 text-sm">Monitor your workflow status at a glance.</p>
          </div>
          <Link 
            to="/workflow/new" 
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            <Plus size={16} />
            Create New Workflow
          </Link>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <SummaryCard 
            title="Total Workflows" 
            value="82" 
            trend="+2 this week" 
            trendColor="text-green-400" 
            trendIcon={<ArrowUp size={14} />} 
          />
          <SummaryCard 
            title="Active" 
            value="65" 
            trend="— 1 this week" 
            trendColor="text-gray-400" 
            trendIcon={<Minus size={14} />} 
          />
          <SummaryCard 
            title="Errors" 
            value="3" 
            trend="+1 this week" 
            trendColor="text-red-400" 
            trendIcon={<ArrowUp size={14} />} 
          />
        </div>

        {/* Workflow List */}
        <div className="bg-[#161b22] rounded-xl border border-[#30363d] overflow-hidden">
          {/* Search Header */}
          <div className="p-4 border-b border-[#30363d]">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
              <input 
                type="text" 
                placeholder="Search workflows..." 
                className="w-full bg-[#0d1117] border border-[#30363d] text-gray-300 text-sm rounded-md pl-10 pr-4 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-gray-600"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#0d1117] text-gray-500 font-medium uppercase text-xs">
                <tr>
                  <th className="px-6 py-4">Workflow Name</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Last Run</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#30363d]">
                {workflows.map((workflow) => (
                  <tr key={workflow.id} className="hover:bg-[#1c2128] transition-colors group">
                    <td className="px-6 py-4 font-medium text-white">
                      <Link to={`/workflow/${workflow.id}`} className="hover:text-blue-400 transition-colors">
                        {workflow.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(workflow.status)}`}>
                        {workflow.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400">{workflow.lastRun}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        {/* Toggle Switch */}
                        <div 
                          onClick={() => toggleWorkflow(workflow.id)}
                          className={`w-8 h-4 rounded-full relative cursor-pointer transition-colors ${workflow.isActive ? 'bg-blue-600' : 'bg-gray-600'}`}
                        >
                          <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${workflow.isActive ? 'left-4.5' : 'left-0.5'}`} style={{ left: workflow.isActive ? '18px' : '2px' }}></div>
                        </div>
                        <button className="text-gray-500 hover:text-white">
                          <MoreVertical size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

// Helper Components

const NavItem: React.FC<{ icon: React.ReactNode; label: string; active?: boolean }> = ({ icon, label, active }) => (
  <a 
    href="#" 
    className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      active 
        ? 'bg-[#1f6feb]/10 text-[#58a6ff]' 
        : 'text-gray-400 hover:text-white hover:bg-[#161b22]'
    }`}
  >
    {icon}
    {label}
  </a>
);

const SummaryCard: React.FC<{ title: string; value: string; trend: string; trendColor: string; trendIcon: React.ReactNode }> = ({ 
  title, value, trend, trendColor, trendIcon 
}) => (
  <div className="bg-[#161b22] p-6 rounded-xl border border-[#30363d]">
    <h3 className="text-gray-500 text-sm font-medium mb-2">{title}</h3>
    <div className="text-3xl font-bold text-white mb-2">{value}</div>
    <div className={`flex items-center gap-1 text-xs font-medium ${trendColor}`}>
      {trendIcon}
      {trend}
    </div>
  </div>
);
