import React from 'react';

interface OpenRouterConfigProps {
  config: any;
  onChange: (key: string, value: any) => void;
}

export const OpenRouterConfig: React.FC<OpenRouterConfigProps> = ({ config, onChange }) => {
  const handleChange = (field: string, value: any) => {
    onChange(field, value);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1">
          OpenRouter API Credential ID
        </label>
        <input
          type="text"
          className="w-full rounded-md border border-[#30363d] bg-[#0d1117] px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:border-blue-500 focus:outline-none"
          value={config.credentialId || ''}
          onChange={(e) => handleChange('credentialId', e.target.value)}
          placeholder="Enter Credential UUID"
        />
        <p className="text-xs text-gray-500 mt-1">
          Enter the UUID of the credential containing your OpenRouter API Key.
        </p>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1">
          Model Name
        </label>
        <input
          type="text"
          className="w-full bg-[#0d1117] border border-[#30363d] rounded px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
          placeholder="e.g. openai/gpt-4o-mini"
          value={config.modelName || ''}
          onChange={(e) => handleChange('modelName', e.target.value)}
        />
        <p className="text-xs text-gray-500 mt-1">
          Specify the model ID from OpenRouter (e.g., anthropic/claude-3-opus).
        </p>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1">
          Prompt
        </label>
        <textarea
          className="w-full bg-[#0d1117] border border-[#30363d] rounded px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none font-mono"
          rows={8}
          placeholder="Enter your prompt here. Use {{...}} for dynamic values."
          value={config.prompt || ''}
          onChange={(e) => handleChange('prompt', e.target.value)}
        />
        <p className="text-xs text-gray-500 mt-1">
          Supports dynamic parameters (e.g., <code>{`{{Node1.output.text}}`}</code>).
        </p>
      </div>
    </div>
  );
};
