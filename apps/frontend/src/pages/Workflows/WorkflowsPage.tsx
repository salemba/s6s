import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../../components/Layout/Sidebar';
import { apiClient } from '../../api/client';
import { Plus, Search, GitBranch, Play, MoreVertical, Trash2, Edit } from 'lucide-react';

interface Workflow {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const WorkflowsPage: React.FC = () => {
  const navigate = useNavigate();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    try {
      const res = await apiClient.get('/workflows');
      setWorkflows(res.data);
    } catch (error) {
      console.error('Failed to fetch workflows', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this workflow?')) {
      try {
        await apiClient.delete(`/workflows/${id}`);
        fetchWorkflows();
      } catch (error) {
        console.error('Failed to delete workflow', error);
      }
    }
  };

  const filteredWorkflows = workflows.filter(wf => 
    wf.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-[#0d1117]">
      <Sidebar />
      
      <div className="flex-1 ml-64 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Workflows</h1>
              <p className="text-[#8b949e] mt-2">Manage and monitor your automation pipelines.</p>
            </div>
            <button
              onClick={() => navigate('/workflow/new')}
              className="bg-[#1f6feb] hover:bg-[#388bfd] text-white px-4 py-2 rounded-md font-medium flex items-center gap-2 transition-colors shadow-sm"
            >
              <Plus size={18} />
              New Workflow
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8b949e]" size={18} />
            <input
              type="text"
              placeholder="Search workflows..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0d1117] border border-[#30363d] text-gray-200 text-sm rounded-lg focus:ring-2 focus:ring-[#1f6feb] focus:border-[#1f6feb] block pl-10 p-3 outline-none transition-all placeholder-[#484f58]"
            />
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full text-center text-[#8b949e] py-12">Loading workflows...</div>
            ) : filteredWorkflows.length === 0 ? (
              <div className="col-span-full text-center py-12 border border-dashed border-[#30363d] rounded-lg">
                <GitBranch className="mx-auto text-[#8b949e] mb-4" size={48} />
                <h3 className="text-white font-medium mb-2">No workflows found</h3>
                <p className="text-[#8b949e] mb-4">Get started by creating your first automation workflow.</p>
                <button
                  onClick={() => navigate('/workflow/new')}
                  className="text-[#58a6ff] hover:underline"
                >
                  Create Workflow
                </button>
              </div>
            ) : (
              filteredWorkflows.map((wf) => (
                <div 
                  key={wf.id}
                  onClick={() => navigate(`/workflow/${wf.id}`)}
                  className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 hover:border-[#58a6ff] transition-colors cursor-pointer group relative"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-[#1f6feb]/10 rounded-md">
                      <GitBranch className="text-[#58a6ff]" size={20} />
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium border ${
                      wf.isActive 
                        ? 'bg-green-900/20 text-green-400 border-green-900/50' 
                        : 'bg-gray-800 text-gray-400 border-gray-700'
                    }`}>
                      {wf.isActive ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                  
                  <h3 className="text-white font-semibold mb-2 group-hover:text-[#58a6ff] transition-colors">
                    {wf.name}
                  </h3>
                  
                  <div className="flex items-center justify-between text-xs text-[#8b949e] mt-4 pt-4 border-t border-[#30363d]">
                    <span>Updated {new Date(wf.updatedAt).toLocaleDateString()}</span>
                    <div className="flex gap-2">
                        <button 
                            onClick={(e) => handleDelete(e, wf.id)}
                            className="p-1.5 hover:bg-[#f85149]/10 hover:text-[#f85149] rounded transition-colors"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
