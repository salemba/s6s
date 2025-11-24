import React, { useState } from 'react';
import { Search, PlayCircle, GitMerge, Zap, Puzzle, ChevronLeft, Code } from 'lucide-react';

const nodeTypes = [
  { type: 'TRIGGER_WEBHOOK', label: 'Webhook Listener', category: 'Triggers', icon: PlayCircle },
  { type: 'SCHEDULE_TRIGGER', label: 'Schedule Trigger', category: 'Triggers', icon: PlayCircle },
  { type: 'LOGIC_IF', label: 'If / Else', category: 'Logic', icon: GitMerge },
  { type: 'LOGIC_CODE', label: 'JavaScript Code', category: 'Logic', icon: Code },
  { type: 'CODE_CUSTOM', label: 'Custom Code (Legacy)', category: 'Logic', icon: GitMerge },
  { type: 'ACTION_HTTP', label: 'HTTP Request', category: 'Actions', icon: Zap },
  { type: 'CLOUD_STORAGE', label: 'Cloud File Storage', category: 'Actions', icon: Zap },
  { type: 'RSS_FEED_READER', label: 'RSS Feed Reader', category: 'Actions', icon: Zap },
  { type: 'POSTGRES_DB', label: 'PostgreSQL Query', category: 'Actions', icon: Zap },
  { type: 'EMAIL_SENDER', label: 'Send Email (SMTP)', category: 'Actions', icon: Zap },
  { type: 'LLM_QUERY', label: 'AI LLM Query', category: 'Actions', icon: Zap },
  { type: 'ACTION_DB_QUERY', label: 'Database Query', category: 'Actions', icon: Zap },
  { type: 'INTEGRATION_TEAMS', label: 'Microsoft Teams', category: 'Integrations', icon: Puzzle },
  { type: 'INTEGRATION_EXCEL', label: 'Microsoft Excel', category: 'Integrations', icon: Puzzle },
  { type: 'INTEGRATION_FILE_SYSTEM', label: 'File System', category: 'Integrations', icon: Puzzle },
  { type: 'INTEGRATION_OPENROUTER', label: 'OpenRouter Query', category: 'Integrations', icon: Zap },
];

const categories = [
  { id: 'Triggers', label: 'Triggers', icon: PlayCircle },
  { id: 'Logic', label: 'Logic', icon: GitMerge },
  { id: 'Actions', label: 'Actions', icon: Zap },
  { id: 'Integrations', label: 'Integrations', icon: Puzzle },
];

export const NodePalette: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string | null>('Triggers');

  const onDragStart = (event: React.DragEvent, nodeType: string, label: string) => {
    event.dataTransfer.setData('application/reactflow/type', nodeType);
    event.dataTransfer.setData('application/reactflow/label', label);
    event.dataTransfer.effectAllowed = 'move';
  };

  const filteredNodes = nodeTypes.filter(node => 
    node.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <aside className="w-64 bg-[#0d1117] border-r border-[#30363d] flex flex-col h-full">
      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={14} />
          <input 
            type="text" 
            placeholder="Search nodes..." 
            className="w-full bg-[#161b22] border border-[#30363d] text-gray-300 text-sm rounded-md pl-9 pr-4 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-gray-600"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Categories */}
      <div className="flex-1 overflow-y-auto px-2">
        {categories.map(category => {
          const categoryNodes = filteredNodes.filter(n => n.category === category.id);
          if (searchTerm && categoryNodes.length === 0) return null;

          return (
            <div key={category.id} className="mb-2">
              <button 
                onClick={() => setExpandedCategory(expandedCategory === category.id ? null : category.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  expandedCategory === category.id ? 'bg-[#1f6feb]/10 text-[#58a6ff]' : 'text-gray-400 hover:text-white hover:bg-[#161b22]'
                }`}
              >
                <category.icon size={16} />
                {category.label}
              </button>

              {/* Nodes List */}
              {(expandedCategory === category.id || searchTerm) && (
                <div className="mt-1 ml-4 space-y-1 border-l border-[#30363d] pl-2">
                  {categoryNodes.map((node) => (
                    <div
                      key={node.type}
                      className="px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-[#161b22] rounded-md cursor-grab active:cursor-grabbing flex items-center gap-2"
                      draggable
                      onDragStart={(event) => onDragStart(event, node.type, node.label)}
                    >
                      {node.label}
                    </div>
                  ))}
                  {categoryNodes.length === 0 && !searchTerm && (
                    <div className="px-3 py-2 text-xs text-gray-600 italic">No nodes available</div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Collapse Footer */}
      <div className="p-4 border-t border-[#30363d]">
        <button className="flex items-center gap-2 text-gray-400 hover:text-white text-sm font-medium transition-colors w-full px-2 py-2 rounded-md hover:bg-[#161b22]">
          <ChevronLeft size={16} />
          Collapse
        </button>
      </div>
    </aside>
  );
};
