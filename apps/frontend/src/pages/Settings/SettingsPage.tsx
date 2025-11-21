import React from 'react';
import { Sidebar } from '../../components/Layout/Sidebar';
import { Settings, User, Shield, Monitor, Moon, Sun } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-[#0d1117]">
      <Sidebar />
      
      <div className="flex-1 ml-64 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
              <Settings className="text-[#1f6feb]" />
              Settings
            </h1>
            <p className="text-[#8b949e] mt-2">Manage your account and system preferences.</p>
          </div>

          <div className="space-y-6">
            {/* Profile Section */}
            <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#30363d]">
                <User className="text-[#1f6feb]" size={20} />
                <h2 className="text-lg font-semibold text-white">Profile Information</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-[#8b949e] uppercase mb-2">Display Name</label>
                  <input
                    type="text"
                    value="System Admin"
                    readOnly
                    className="w-full bg-[#0d1117] border border-[#30363d] text-[#8b949e] p-2.5 rounded-md cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#8b949e] uppercase mb-2">Email Address</label>
                  <input
                    type="email"
                    value="admin@s6s.com"
                    readOnly
                    className="w-full bg-[#0d1117] border border-[#30363d] text-[#8b949e] p-2.5 rounded-md cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Security Section */}
            <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#30363d]">
                <Shield className="text-[#1f6feb]" size={20} />
                <h2 className="text-lg font-semibold text-white">Security</h2>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-medium">Master Encryption Key</h3>
                  <p className="text-[#8b949e] text-sm mt-1">
                    Used to encrypt all credentials in the vault. Rotation requires system downtime.
                  </p>
                </div>
                <button 
                  disabled
                  className="px-4 py-2 bg-[#21262d] text-[#8b949e] border border-[#30363d] rounded-md text-sm font-medium cursor-not-allowed opacity-60"
                >
                  Rotate Master Key
                </button>
              </div>
            </div>

            {/* System Section */}
            <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#30363d]">
                <Monitor className="text-[#1f6feb]" size={20} />
                <h2 className="text-lg font-semibold text-white">System Preferences</h2>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-medium">Theme</h3>
                    <p className="text-[#8b949e] text-sm mt-1">
                      Select your preferred interface appearance.
                    </p>
                  </div>
                  <div className="flex bg-[#0d1117] border border-[#30363d] rounded-lg p-1">
                    <button className="p-2 rounded-md bg-[#1f6feb] text-white shadow-sm">
                      <Moon size={16} />
                    </button>
                    <button className="p-2 rounded-md text-[#8b949e] hover:text-white">
                      <Sun size={16} />
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#30363d]">
                  <div className="flex justify-between items-center">
                    <span className="text-[#8b949e] text-sm">System Version</span>
                    <span className="text-white font-mono text-sm bg-[#30363d] px-2 py-1 rounded">v1.0.0</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
