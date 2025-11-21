import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Logging in with:', { username, password });
    // TODO: Implement actual login logic
  };

  return (
    <div className="min-h-screen w-full bg-[#0d1117] flex items-center justify-center p-4">
      <div className="w-full max-w-[400px] bg-[#161b22] rounded-xl border border-[#30363d] p-8 shadow-xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">s6s</h1>
          <p className="text-[#8b949e] text-sm font-medium">Self-Hosted Automation</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className="w-full bg-[#0d1117] border border-[#30363d] text-gray-200 text-sm rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block p-3 outline-none transition-all placeholder-[#484f58]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full bg-[#0d1117] border border-[#30363d] text-gray-200 text-sm rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block p-3 pr-10 outline-none transition-all placeholder-[#484f58]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#8b949e] hover:text-gray-300 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 font-semibold rounded-md text-sm px-5 py-3 text-center transition-colors duration-200 mt-2"
          >
            Log In
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-xs text-[#484f58]">
            Data is encrypted and hosted by you.
          </p>
        </div>
      </div>
    </div>
  );
};
