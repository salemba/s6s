import React, { useEffect, useState } from 'react';
import { X, Search, ExternalLink, Loader2, Key } from 'lucide-react';
import { apiClient } from '../../api/client';
import { Link } from 'react-router-dom';

interface Credential {
  id: string;
  name: string;
  type: string;
}

interface CredentialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (credentialId: string) => void;
  currentCredentialId?: string;
}

export const CredentialModal: React.FC<CredentialModalProps> = ({ isOpen, onClose, onSelect, currentCredentialId }) => {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchCredentials();
    }
  }, [isOpen]);

  const fetchCredentials = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/credentials');
      setCredentials(res.data);
    } catch (error) {
      console.error('Failed to fetch credentials', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const filteredCredentials = credentials.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-[500px] rounded-lg border border-[#30363d] bg-[#0d1117] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#30363d] px-4 py-3">
          <h3 className="text-sm font-semibold text-gray-200">Select Credential</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4">
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
            <input
              type="text"
              placeholder="Search credentials..."
              className="w-full rounded-md border border-[#30363d] bg-[#161b22] py-2 pl-9 pr-3 text-sm text-gray-200 placeholder-gray-600 focus:border-blue-500 focus:outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* List */}
          <div className="max-h-[300px] overflow-y-auto space-y-2">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="animate-spin text-blue-500" size={24} />
              </div>
            ) : filteredCredentials.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-500">
                No credentials found.
              </div>
            ) : (
              filteredCredentials.map((cred) => (
                <button
                  key={cred.id}
                  onClick={() => onSelect(cred.id)}
                  className={`flex w-full items-center justify-between rounded-md border px-3 py-2 text-left transition-colors ${
                    currentCredentialId === cred.id
                      ? 'border-blue-500 bg-blue-900/20'
                      : 'border-[#30363d] bg-[#161b22] hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-[#21262d] p-2 text-gray-400">
                      <Key size={14} />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-200">{cred.name}</div>
                      <div className="text-xs text-gray-500">{cred.type}</div>
                    </div>
                  </div>
                  {currentCredentialId === cred.id && (
                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[#30363d] bg-[#161b22] px-4 py-3">
          <Link 
            to="/credentials" 
            target="_blank"
            className="flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300"
          >
            Manage Credentials <ExternalLink size={12} />
          </Link>
          <button
            onClick={onClose}
            className="rounded-md bg-[#21262d] px-3 py-1.5 text-xs font-medium text-gray-300 hover:bg-[#30363d]"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
