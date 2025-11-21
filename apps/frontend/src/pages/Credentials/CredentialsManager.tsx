import React, { useEffect, useState } from 'react';

interface Credential {
  id: string;
  name: string;
  type: string;
  createdAt: string;
}

export const CredentialsManager: React.FC = () => {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [type, setType] = useState('API_KEY');
  const [value, setValue] = useState('');

  useEffect(() => {
    fetchCredentials();
  }, []);

  const fetchCredentials = async () => {
    try {
      // TODO: Add Auth Header
      const res = await fetch('/api/credentials');
      if (res.ok) {
        const data = await res.json();
        setCredentials(data);
      }
    } catch (error) {
      console.error('Failed to fetch credentials', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, type, value }),
      });

      if (res.ok) {
        alert('Credential saved successfully!');
        setShowForm(false);
        setName('');
        setValue('');
        fetchCredentials();
      } else {
        alert('Failed to save credential.');
      }
    } catch (error) {
      console.error('Error saving credential', error);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Credentials Vault</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
        >
          {showForm ? 'Cancel' : 'Add New Credential'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-8">
          <h2 className="text-lg font-bold mb-4">Add New Secret</h2>
          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 p-2 rounded"
                placeholder="e.g. Stripe API Key"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full border border-gray-300 p-2 rounded"
              >
                <option value="API_KEY">API Key</option>
                <option value="DATABASE">Database Connection</option>
                <option value="SSH">SSH Key</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Secret Value</label>
              <textarea
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full border border-gray-300 p-2 rounded font-mono h-24"
                placeholder="Paste your secret here..."
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                This value will be encrypted with AES-256-GCM before storage. It cannot be viewed again.
              </p>
            </div>
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 self-end"
            >
              Save Encrypted
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase">Name</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase">Type</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase">Created At</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase">ID</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="p-4 text-center text-gray-500">Loading...</td></tr>
            ) : credentials.length === 0 ? (
              <tr><td colSpan={4} className="p-4 text-center text-gray-500">No credentials found.</td></tr>
            ) : (
              credentials.map((cred) => (
                <tr key={cred.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-800">{cred.name}</td>
                  <td className="p-4 text-sm text-gray-600">
                    <span className="bg-gray-200 px-2 py-1 rounded text-xs font-bold">{cred.type}</span>
                  </td>
                  <td className="p-4 text-sm text-gray-500">{new Date(cred.createdAt).toLocaleDateString()}</td>
                  <td className="p-4 text-xs font-mono text-gray-400">{cred.id}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
