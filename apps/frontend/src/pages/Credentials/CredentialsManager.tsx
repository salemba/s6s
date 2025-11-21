import React, { useEffect, useState } from 'react';
import { Sidebar } from '../../components/Layout/Sidebar';
import { apiClient } from '../../api/client';
import { Plus, Search, ShieldCheck, Pencil, Trash2, Key, Database, Terminal } from 'lucide-react';
import toast from 'react-hot-toast';

interface Credential {
  id: string;
  name: string;
  type: string;
  createdAt: string;
  isQuantum?: boolean;
}

export const CredentialsManager: React.FC = () => {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form State
  const [name, setName] = useState('');
  const [type, setType] = useState('API_KEY');
  const [value, setValue] = useState('');
  const [isQuantum, setIsQuantum] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchCredentials();
  }, []);

  const fetchCredentials = async () => {
    try {
      const res = await apiClient.get('/credentials');
      setCredentials(res.data);
    } catch (error) {
      console.error('Failed to fetch credentials', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setValue('');
    setIsQuantum(false);
    setEditingId(null);
    setType('API_KEY');
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await apiClient.put(`/credentials/${editingId}`, { name, type, value, isQuantum });
        toast.success('Credential updated successfully!');
      } else {
        await apiClient.post('/credentials', { name, type, value, isQuantum });
        toast.success('Credential saved successfully!');
      }
      setShowForm(false);
      resetForm();
      fetchCredentials();
    } catch (error) {
      console.error('Error saving credential', error);
      toast.error('Failed to save credential.');
    }
  };

  const handleEdit = (cred: Credential) => {
    setEditingId(cred.id);
    setName(cred.name);
    setType(cred.type);
    setIsQuantum(cred.isQuantum || false);
    setValue(''); // Value is not retrieved for security
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this credential? This action cannot be undone.')) {
      try {
        await apiClient.delete(`/credentials/${id}`);
        toast.success('Credential deleted successfully');
        fetchCredentials();
      } catch (error) {
        console.error('Error deleting credential', error);
        toast.error('Failed to delete credential.');
      }
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'DATABASE': return <Database size={16} className="text-blue-400" />;
      case 'SSH': return <Terminal size={16} className="text-green-400" />;
      default: return <Key size={16} className="text-yellow-400" />;
    }
  };

  const filteredCredentials = credentials.filter(cred => 
    cred.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cred.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-[#0d1117]">
      <Sidebar />
      
      <div className="flex-1 ml-64 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white tracking-tight">Credentials Vault</h1>
            <button
              onClick={() => {
                resetForm();
                setShowForm(!showForm);
              }}
              className="bg-[#1f6feb] hover:bg-[#388bfd] text-white px-4 py-2 rounded-md font-medium flex items-center gap-2 transition-colors shadow-sm"
            >
              <Plus size={18} />
              Create New Credential
            </button>
          </div>

          {/* Security Banner */}
          <div className="bg-[#1f6feb]/10 border border-[#1f6feb]/20 rounded-lg p-4 mb-8 flex items-start gap-4">
            <div className="p-2 bg-[#1f6feb]/20 rounded-lg">
              <ShieldCheck className="text-[#58a6ff]" size={24} />
            </div>
            <div>
              <h3 className="text-[#58a6ff] font-semibold mb-1">Your data is End-to-End Encrypted</h3>
              <p className="text-[#8b949e] text-sm">
                All credentials are securely stored using the hybrid post-quantum cryptography algorithms (AES+Kyber/ML-KEM) encryption standard. {' '}
                <a href="https://en.wikipedia.org/wiki/Kyber" className="text-[#58a6ff] hover:underline">Learn More →</a>
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8b949e]" size={18} />
            <input
              type="text"
              placeholder="Search by name or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0d1117] border border-[#30363d] text-gray-200 text-sm rounded-lg focus:ring-2 focus:ring-[#1f6feb] focus:border-[#1f6feb] block pl-10 p-3 outline-none transition-all placeholder-[#484f58]"
            />
          </div>

          {/* Create Form (Inline for now) */}
          {showForm && (
            <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6 mb-6 animate-in fade-in slide-in-from-top-4">
              <h2 className="text-lg font-bold text-white mb-4">{editingId ? 'Edit Secret' : 'Add New Secret'}</h2>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#8b949e] uppercase mb-2">Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-[#0d1117] border border-[#30363d] text-white p-2.5 rounded-md focus:border-[#1f6feb] outline-none"
                      placeholder="e.g. Stripe API Key"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#8b949e] uppercase mb-2">Type</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full bg-[#0d1117] border border-[#30363d] text-white p-2.5 rounded-md focus:border-[#1f6feb] outline-none"
                    >
                      <option value="API_KEY">API Key</option>
                      <option value="DATABASE">Database Connection</option>
                      <option value="SSH">SSH Key</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#8b949e] uppercase mb-2">Secret Value</label>
                  <textarea
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="w-full bg-[#0d1117] border border-[#30363d] text-white p-2.5 rounded-md font-mono h-24 focus:border-[#1f6feb] outline-none"
                    placeholder={editingId ? "Leave blank to keep existing secret..." : "Paste your secret here..."}
                    required={!editingId}
                  />
                </div>

                {/* Quantum Toggle */}
                <div className="bg-[#1f6feb]/10 border border-[#1f6feb]/20 rounded-lg p-4">
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <div className="relative mt-1">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          checked={isQuantum}
                          onChange={(e) => setIsQuantum(e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#1f6feb]/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1f6feb]"></div>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-[#58a6ff] group-hover:text-[#79c0ff] transition-colors flex items-center gap-2">
                            <ShieldCheck size={16} />
                            Enable Post-Quantum Protection (Kyber-1024)
                        </span>
                        <p className="text-xs text-[#8b949e] mt-1">
                            Protects your keys against future quantum computer attacks using NIST-standard ML-KEM.
                        </p>
                      </div>
                    </label>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                        setShowForm(false);
                        resetForm();
                    }}
                    className="px-4 py-2 text-[#c9d1d9] hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-[#238636] hover:bg-[#2ea043] text-white px-4 py-2 rounded-md font-medium transition-colors"
                  >
                    {editingId ? 'Update Encrypted' : 'Save Encrypted'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Table */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#21262d] border-b border-[#30363d]">
                  <th className="p-4 text-xs font-bold text-[#8b949e] uppercase tracking-wider">Name</th>
                  <th className="p-4 text-xs font-bold text-[#8b949e] uppercase tracking-wider">Type</th>
                  <th className="p-4 text-xs font-bold text-[#8b949e] uppercase tracking-wider">Date Created</th>
                  <th className="p-4 text-xs font-bold text-[#8b949e] uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#30363d]">
                {loading ? (
                  <tr><td colSpan={4} className="p-8 text-center text-[#8b949e]">Loading secure vault...</td></tr>
                ) : filteredCredentials.length === 0 ? (
                  <tr><td colSpan={4} className="p-8 text-center text-[#8b949e]">No credentials found in vault.</td></tr>
                ) : (
                  filteredCredentials.map((cred) => (
                    <tr key={cred.id} className="hover:bg-[#21262d] transition-colors group">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-[#30363d] rounded-md">
                            {getIconForType(cred.type)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-white">{cred.name}</span>
                                {cred.isQuantum && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-[0_0_10px_rgba(99,102,241,0.1)]">
                                    <ShieldCheck size={10} className="mr-1" /> Quantum Safe
                                </span>
                                )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="bg-[#30363d] text-[#c9d1d9] px-2.5 py-0.5 rounded-full text-xs font-medium border border-[#484f58]">
                          {cred.type}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-[#8b949e]">
                        {new Date(cred.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleEdit(cred)}
                            className="p-2 text-[#8b949e] hover:text-[#58a6ff] hover:bg-[#1f6feb]/10 rounded-md transition-colors"
                          >
                            <Pencil size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(cred.id)}
                            className="p-2 text-[#8b949e] hover:text-[#f85149] hover:bg-[#f85149]/10 rounded-md transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
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

