import React, { useEffect, useState } from 'react';
import { X, Settings, Key, FileText, Trash2 } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { INode } from '../../../../../packages/shared/src/interfaces/s6s.interface';

interface NodeConfigPanelProps {
  selectedNode: INode | null;
  onUpdateNode: (nodeId: string, newConfig: Record<string, any>) => void;
  onDelete: (nodeId: string) => void;
  onClose: () => void;
}

type TabType = 'configuration' | 'credentials' | 'notes';

export const NodeConfigPanel: React.FC<NodeConfigPanelProps> = ({ selectedNode, onUpdateNode, onDelete, onClose }) => {
  const [config, setConfig] = useState<Record<string, any>>({});
  const [activeTab, setActiveTab] = useState<TabType>('configuration');

  // Sync local state when selected node changes
  useEffect(() => {
    if (selectedNode) {
      setConfig(selectedNode.config || {});
      setActiveTab('configuration');
    }
  }, [selectedNode]);

  if (!selectedNode) {
    return null;
  }

  const handleConfigChange = (key: string, value: any) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    onUpdateNode(selectedNode.id, newConfig);
  };

  // Render specific fields based on node type
  const renderConfigFields = () => {
    switch (selectedNode.type) {
      case 'ACTION_HTTP':
        return (
          <>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-400">Method</label>
              <select
                className="w-full rounded-md border border-[#30363d] bg-[#0d1117] px-3 py-2 text-sm text-gray-200 focus:border-blue-500 focus:outline-none"
                value={config.method || 'GET'}
                onChange={(e) => handleConfigChange('method', e.target.value)}
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-400">URL</label>
              <input
                type="text"
                className="w-full rounded-md border border-[#30363d] bg-[#0d1117] px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:border-blue-500 focus:outline-none"
                value={config.url || ''}
                onChange={(e) => handleConfigChange('url', e.target.value)}
                placeholder="https://api.example.com"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-400">Body (JSON)</label>
              <textarea
                className="h-32 w-full rounded-md border border-[#30363d] bg-[#0d1117] px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:border-blue-500 focus:outline-none font-mono"
                value={config.body || ''}
                onChange={(e) => handleConfigChange('body', e.target.value)}
                placeholder='{ "key": "value" }'
              />
            </div>
          </>
        );

      case 'CLOUD_STORAGE':
        return (
          <>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-400">Provider</label>
              <select
                className="w-full rounded-md border border-[#30363d] bg-[#0d1117] px-3 py-2 text-sm text-gray-200 focus:border-blue-500 focus:outline-none"
                value={config.provider || 'AWS'}
                onChange={(e) => handleConfigChange('provider', e.target.value)}
              >
                <option value="AWS">AWS S3</option>
                <option value="AZURE">Azure Blob Storage</option>
                <option value="GCP">Google Cloud Storage</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-400">Operation</label>
              <select
                className="w-full rounded-md border border-[#30363d] bg-[#0d1117] px-3 py-2 text-sm text-gray-200 focus:border-blue-500 focus:outline-none"
                value={config.operation || 'UPLOAD'}
                onChange={(e) => handleConfigChange('operation', e.target.value)}
              >
                <option value="UPLOAD">Upload File</option>
                <option value="DOWNLOAD">Download File</option>
                <option value="LIST">List Files</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-400">Bucket / Container Name</label>
              <input
                type="text"
                className="w-full rounded-md border border-[#30363d] bg-[#0d1117] px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:border-blue-500 focus:outline-none"
                value={config.bucket || ''}
                onChange={(e) => handleConfigChange('bucket', e.target.value)}
                placeholder="e.g. my-app-backups"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-400">File Path / Prefix</label>
              <input
                type="text"
                className="w-full rounded-md border border-[#30363d] bg-[#0d1117] px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:border-blue-500 focus:outline-none"
                value={config.filePath || ''}
                onChange={(e) => handleConfigChange('filePath', e.target.value)}
                placeholder="e.g. uploads/report.pdf"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-400">Credential ID</label>
              <input
                type="text"
                className="w-full rounded-md border border-[#30363d] bg-[#0d1117] px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:border-blue-500 focus:outline-none"
                value={config.credentialId || ''}
                onChange={(e) => handleConfigChange('credentialId', e.target.value)}
                placeholder="Select a credential (UUID)"
              />
            </div>
          </>
        );

      case 'RSS_FEED_READER':
        return (
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gray-400">Feed URL</label>
            <input
              type="text"
              className="w-full rounded-md border border-[#30363d] bg-[#0d1117] px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:border-blue-500 focus:outline-none"
              value={config.url || ''}
              onChange={(e) => handleConfigChange('url', e.target.value)}
              placeholder="https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml"
            />
          </div>
        );

      case 'EMAIL_SENDER':
        return (
          <>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-400">To</label>
              <input
                type="text"
                className="w-full rounded-md border border-[#30363d] bg-[#0d1117] px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:border-blue-500 focus:outline-none"
                value={config.to || ''}
                onChange={(e) => handleConfigChange('to', e.target.value)}
                placeholder="recipient@example.com"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-400">Subject</label>
              <input
                type="text"
                className="w-full rounded-md border border-[#30363d] bg-[#0d1117] px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:border-blue-500 focus:outline-none"
                value={config.subject || ''}
                onChange={(e) => handleConfigChange('subject', e.target.value)}
                placeholder="Email Subject"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-400">Body</label>
              <textarea
                className="h-32 w-full rounded-md border border-[#30363d] bg-[#0d1117] px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:border-blue-500 focus:outline-none font-mono"
                value={config.body || ''}
                onChange={(e) => handleConfigChange('body', e.target.value)}
                placeholder="Email content..."
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-400">SMTP Credential ID</label>
              <input
                type="text"
                className="w-full rounded-md border border-[#30363d] bg-[#0d1117] px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:border-blue-500 focus:outline-none"
                value={config.credentialId || ''}
                onChange={(e) => handleConfigChange('credentialId', e.target.value)}
                placeholder="Select a credential (UUID)"
              />
            </div>
          </>
        );

      case 'LLM_QUERY':
        return (
          <>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-400">Model Name</label>
              <input
                type="text"
                className="w-full rounded-md border border-[#30363d] bg-[#0d1117] px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:border-blue-500 focus:outline-none"
                value={config.model || 'gpt-4o'}
                onChange={(e) => handleConfigChange('model', e.target.value)}
                placeholder="e.g. gpt-4o, gemini-1.5-pro"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-400">API Endpoint (Optional)</label>
              <input
                type="text"
                className="w-full rounded-md border border-[#30363d] bg-[#0d1117] px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:border-blue-500 focus:outline-none"
                value={config.endpoint || ''}
                onChange={(e) => handleConfigChange('endpoint', e.target.value)}
                placeholder="e.g. https://api.openai.com/v1"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-400">Temperature</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="2"
                className="w-full rounded-md border border-[#30363d] bg-[#0d1117] px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:border-blue-500 focus:outline-none"
                value={config.temperature || 0.7}
                onChange={(e) => handleConfigChange('temperature', e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-400">Prompt Template</label>
              <textarea
                className="h-48 w-full rounded-md border border-[#30363d] bg-[#0d1117] px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:border-blue-500 focus:outline-none font-mono"
                value={config.prompt || ''}
                onChange={(e) => handleConfigChange('prompt', e.target.value)}
                placeholder="Summarize the following text: {{ $node['RSS'].items[0].content }}"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-400">API Key Credential ID</label>
              <input
                type="text"
                className="w-full rounded-md border border-[#30363d] bg-[#0d1117] px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:border-blue-500 focus:outline-none"
                value={config.credentialId || ''}
                onChange={(e) => handleConfigChange('credentialId', e.target.value)}
                placeholder="Select a credential (UUID)"
              />
            </div>
          </>
        );

      case 'SCHEDULE_TRIGGER':
        return (
          <>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-400">Schedule Mode</label>
              <select
                className="w-full rounded-md border border-[#30363d] bg-[#0d1117] px-3 py-2 text-sm text-gray-200 focus:border-blue-500 focus:outline-none"
                value={config.mode || 'interval'}
                onChange={(e) => handleConfigChange('mode', e.target.value)}
              >
                <option value="interval">Interval</option>
                <option value="cron">Cron Expression</option>
              </select>
            </div>

            {config.mode === 'cron' ? (
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-gray-400">Cron Expression</label>
                <input
                  type="text"
                  className="w-full rounded-md border border-[#30363d] bg-[#0d1117] px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:border-blue-500 focus:outline-none font-mono"
                  value={config.cronExpression || '* * * * *'}
                  onChange={(e) => handleConfigChange('cronExpression', e.target.value)}
                  placeholder="* * * * *"
                />
              </div>
            ) : (
              <div className="flex flex-row gap-2">
                <div className="flex flex-col gap-2 flex-1">
                  <label className="text-xs font-semibold text-gray-400">Every</label>
                  <input
                    type="number"
                    min="1"
                    className="w-full rounded-md border border-[#30363d] bg-[#0d1117] px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:border-blue-500 focus:outline-none"
                    value={config.intervalValue || 15}
                    onChange={(e) => handleConfigChange('intervalValue', parseInt(e.target.value))}
                  />
                </div>
                <div className="flex flex-col gap-2 flex-1">
                  <label className="text-xs font-semibold text-gray-400">Unit</label>
                  <select
                    className="w-full rounded-md border border-[#30363d] bg-[#0d1117] px-3 py-2 text-sm text-gray-200 focus:border-blue-500 focus:outline-none"
                    value={config.intervalUnit || 'minutes'}
                    onChange={(e) => handleConfigChange('intervalUnit', e.target.value)}
                  >
                    <option value="minutes">Minutes</option>
                    <option value="hours">Hours</option>
                    <option value="days">Days</option>
                  </select>
                </div>
              </div>
            )}

            <div className="border-t border-[#303d] my-2 pt-2">
              <label className="flex items-center gap-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  className="rounded border-[#303d] bg-[#0d1117] text-blue-500 focus:ring-0"
                  checked={config.alwaysOutputData || false}
                  onChange={(e) => handleConfigChange('alwaysOutputData', e.target.checked)}
                />
                Always output data
              </label>
            </div>

            <div className="flex flex-col gap-2">
               <label className="flex items-center gap-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  className="rounded border-[#303d] bg-[#0d1117] text-blue-500 focus:ring-0"
                  checked={config.retryOnFail || false}
                  onChange={(e) => handleConfigChange('retryOnFail', e.target.checked)}
                />
                Retry on fail
              </label>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-400">On Error (Action)</label>
              <input
                type="text"
                className="w-full rounded-md border border-[#303d] bg-[#0d1117] px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:border-blue-500 focus:outline-none"
                value={config.onError || ''}
                onChange={(e) => handleConfigChange('onError', e.target.value)}
                placeholder="e.g. continue, stop, or specific node ID"
              />
            </div>
          </>
        );

      case 'TRIGGER_WEBHOOK':
        return (
          <>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-400">Path</label>
              <input
                type="text"
                className="w-full rounded-md border border-[#303d] bg-[#0d1117] px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:border-blue-500 focus:outline-none"
                value={config.path || ''}
                onChange={(e) => handleConfigChange('path', e.target.value)}
                placeholder="/webhook/..."
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-400">Method</label>
              <select
                className="w-full rounded-md border border-[#303d] bg-[#0d1117] px-3 py-2 text-sm text-gray-200 focus:border-blue-500 focus:outline-none"
                value={config.method || 'POST'}
                onChange={(e) => handleConfigChange('method', e.target.value)}
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
              </select>
            </div>
          </>
        );

      case 'POSTGRES_DB':
        return (
          <>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-400">Credential ID</label>
              <input
                type="text"
                className="w-full rounded-md border border-[#303d] bg-[#0d1117] px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:border-blue-500 focus:outline-none"
                value={config.credentialId || ''}
                onChange={(e) => handleConfigChange('credentialId', e.target.value)}
                placeholder="Select Credential (ID)"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-400">SQL Query</label>
              <textarea
                className="h-32 w-full rounded-md border border-[#303d] bg-[#0d1117] px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:border-blue-500 focus:outline-none font-mono"
                value={config.query || ''}
                onChange={(e) => handleConfigChange('query', e.target.value)}
                placeholder="SELECT * FROM users WHERE id = 1;"
              />
            </div>
          </>
        );

      case 'Logic':
      case 'LOGIC_IF':
        return (
          <>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-400">Value A</label>
              <input
                type="text"
                className="w-full rounded-md border border-[#303d] bg-[#0d1117] px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:border-blue-500 focus:outline-none"
                value={config.valueA || ''}
                onChange={(e) => handleConfigChange('valueA', e.target.value)}
                placeholder="{{ $node['Step'].json.id }}"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-400">Operator</label>
              <select
                className="w-full rounded-md border border-[#303d] bg-[#0d1117] px-3 py-2 text-sm text-gray-200 focus:border-blue-500 focus:outline-none"
                value={config.operator || 'EQUALS'}
                onChange={(e) => handleConfigChange('operator', e.target.value)}
              >
                <option value="EQUALS">Equals (==)</option>
                <option value="NOT_EQUALS">Not Equals (!=)</option>
                <option value="GT">Greater Than (&gt;)</option>
                <option value="LT">Less Than (&lt;)</option>
                <option value="GTE">Greater Than or Equal (&gt;=)</option>
                <option value="LTE">Less Than or Equal (&lt;=)</option>
                <option value="CONTAINS">Contains</option>
                <option value="IS_EMPTY">Is Empty</option>
                <option value="IS_NOT_EMPTY">Is Not Empty</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-400">Value B</label>
              <input
                type="text"
                className="w-full rounded-md border border-[#303d] bg-[#0d1117] px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:border-blue-500 focus:outline-none"
                value={config.valueB || ''}
                onChange={(e) => handleConfigChange('valueB', e.target.value)}
                placeholder="Value to compare"
              />
            </div>
          </>
        );

      case 'INTEGRATION_TEAMS':
        return (
          <>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-400">Webhook URL</label>
              <input
                type="text"
                className="w-full rounded-md border border-[#303d] bg-[#0d1117] px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:border-blue-500 focus:outline-none"
                value={config.webhookUrl || ''}
                onChange={(e) => handleConfigChange('webhookUrl', e.target.value)}
                placeholder="https://outlook.office.com/webhook/..."
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-400">Message</label>
              <textarea
                className="h-32 w-full rounded-md border border-[#303d] bg-[#0d1117] px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:border-blue-500 focus:outline-none font-mono"
                value={config.message || ''}
                onChange={(e) => handleConfigChange('message', e.target.value)}
                placeholder="Message content..."
              />
            </div>
          </>
        );

      case 'INTEGRATION_EXCEL':
        return (
          <>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-400">Operation</label>
              <select
                className="w-full rounded-md border border-[#303d] bg-[#0d1117] px-3 py-2 text-sm text-gray-200 focus:border-blue-500 focus:outline-none"
                value={config.operation || 'READ'}
                onChange={(e) => handleConfigChange('operation', e.target.value)}
              >
                <option value="READ">Read Excel File</option>
                <option value="WRITE">Write Excel File</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-400">File Path</label>
              <input
                type="text"
                className="w-full rounded-md border border-[#303d] bg-[#0d1117] px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:border-blue-500 focus:outline-none"
                value={config.filePath || ''}
                onChange={(e) => handleConfigChange('filePath', e.target.value)}
                placeholder="/path/to/file.xlsx"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-400">Sheet Name</label>
              <input
                type="text"
                className="w-full rounded-md border border-[#303d] bg-[#0d1117] px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:border-blue-500 focus:outline-none"
                value={config.sheetName || ''}
                onChange={(e) => handleConfigChange('sheetName', e.target.value)}
                placeholder="Sheet1"
              />
            </div>
            {config.operation === 'WRITE' && (
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-gray-400">Data (JSON)</label>
                <textarea
                  className="h-32 w-full rounded-md border border-[#303d] bg-[#0d1117] px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:border-blue-500 focus:outline-none font-mono"
                  value={config.data || ''}
                  onChange={(e) => handleConfigChange('data', e.target.value)}
                  placeholder='[{"col1": "val1", "col2": "val2"}]'
                />
              </div>
            )}
          </>
        );

      case 'INTEGRATION_FILE_SYSTEM':
        return (
          <>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-400">Operation</label>
              <select
                className="w-full rounded-md border border-[#303d] bg-[#0d1117] px-3 py-2 text-sm text-gray-200 focus:border-blue-500 focus:outline-none"
                value={config.operation || 'READ'}
                onChange={(e) => handleConfigChange('operation', e.target.value)}
              >
                <option value="READ">Read File</option>
                <option value="WRITE">Write File</option>
                <option value="DELETE">Delete File</option>
                <option value="LIST">List Directory</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-400">File/Dir Path</label>
              <input
                type="text"
                className="w-full rounded-md border border-[#303d] bg-[#0d1117] px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:border-blue-500 focus:outline-none"
                value={config.filePath || ''}
                onChange={(e) => handleConfigChange('filePath', e.target.value)}
                placeholder="/path/to/file.txt"
              />
            </div>
            {(config.operation === 'READ' || config.operation === 'WRITE') && (
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-gray-400">Encoding</label>
                <input
                  type="text"
                  className="w-full rounded-md border border-[#303d] bg-[#0d1117] px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:border-blue-500 focus:outline-none"
                  value={config.encoding || 'utf-8'}
                  onChange={(e) => handleConfigChange('encoding', e.target.value)}
                  placeholder="utf-8"
                />
              </div>
            )}
            {config.operation === 'WRITE' && (
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-gray-400">Content</label>
                <textarea
                  className="h-32 w-full rounded-md border border-[#303d] bg-[#0d1117] px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:border-blue-500 focus:outline-none font-mono"
                  value={config.content || ''}
                  onChange={(e) => handleConfigChange('content', e.target.value)}
                  placeholder="File content..."
                />
              </div>
            )}
          </>
        );

      case 'LOGIC_CODE':
        return (
          <div className="flex flex-col gap-2 h-full">
            <label className="text-xs font-semibold text-gray-400">JavaScript Code</label>
            <div className="h-64 w-full border border-[#30363d] rounded-md overflow-hidden">
              <Editor
                height="100%"
                defaultLanguage="javascript"
                theme="vs-dark"
                value={config.code || `// Access previous node data via 'input'
// You can use 'axios' and lodash '_'
// Return the data you want to pass to the next node
return {
  message: "Hello " + (input?.name || "World"),
  timestamp: new Date()
};`}
                onChange={(value) => handleConfigChange('code', value)}
                options={{
                  minimap: { enabled: false },
                  fontSize: 12,
                  scrollBeyondLastLine: false,
                }}
              />
            </div>
          </div>
        );

      case 'CODE_CUSTOM':
        return (
          <div className="flex flex-col gap-2 h-full">
            <label className="text-xs font-semibold text-gray-400">JavaScript Code</label>
            <textarea
              className="flex-1 w-full rounded-md border border-[#303d] bg-[#0d1117] px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:border-blue-500 focus:outline-none font-mono"
              value={config.code || ''}
              onChange={(e) => handleConfigChange('code', e.target.value)}
              placeholder="// return { ... }"
            />
          </div>
        );

      default:
        return (
          <div className="text-sm text-gray-500 italic">
            No specific configuration for this node type.
          </div>
        );
    }
  };

  return (
    <div className="w-96 border-l border-[#30363d] bg-[#161b22] shadow-xl flex flex-col h-full shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#30363d] px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-[#21262d] text-blue-400">
            <Settings size={18} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-200">{selectedNode.name || 'Node Configuration'}</h3>
            <p className="text-xs text-gray-500">{selectedNode.type}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded p-1 text-gray-400 hover:bg-[#21262d] hover:text-gray-200 transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#30363d] px-2">
        <button
          onClick={() => setActiveTab('configuration')}
          className={`flex flex-1 items-center justify-center gap-2 border-b-2 px-4 py-3 text-xs font-medium transition-colors ${
            activeTab === 'configuration'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Settings size={14} />
          Configuration
        </button>
        <button
          onClick={() => setActiveTab('credentials')}
          className={`flex flex-1 items-center justify-center gap-2 border-b-2 px-4 py-3 text-xs font-medium transition-colors ${
            activeTab === 'credentials'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Key size={14} />
          Credentials
        </button>
        <button
          onClick={() => setActiveTab('notes')}
          className={`flex flex-1 items-center justify-center gap-2 border-b-2 px-4 py-3 text-xs font-medium transition-colors ${
            activeTab === 'notes'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <FileText size={14} />
          Notes
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {activeTab === 'configuration' && (
          <div className="flex flex-col gap-6">
            {/* Common Fields */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-400">Node Name</label>
              <input
                type="text"
                className="w-full rounded-md border border-[#30363d] bg-[#0d1117] px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:border-blue-500 focus:outline-none"
                value={selectedNode.name || ''}
                onChange={(e) => onUpdateNode(selectedNode.id, { ...config, name: e.target.value })}
              />
            </div>

            {/* Specific Fields */}
            {renderConfigFields()}
          </div>
        )}

        {activeTab === 'credentials' && (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="mb-3 rounded-full bg-[#21262d] p-3 text-gray-500">
              <Key size={24} />
            </div>
            <h4 className="text-sm font-medium text-gray-300">No Credentials Required</h4>
            <p className="mt-1 text-xs text-gray-500">
              This node does not require any authentication credentials.
            </p>
            <button className="mt-4 rounded-md bg-[#21262d] px-4 py-2 text-xs font-medium text-blue-400 hover:bg-[#30363d] transition-colors">
              + Add Credential
            </button>
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="flex flex-col gap-2 h-full">
            <label className="text-xs font-semibold text-gray-400">Documentation & Notes</label>
            <textarea
              className="flex-1 w-full rounded-md border border-[#30363d] bg-[#0d1117] px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:border-blue-500 focus:outline-none resize-none"
              placeholder="Add notes about this node's purpose or configuration..."
              value={config.notes || ''}
              onChange={(e) => handleConfigChange('notes', e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-[#30363d] bg-[#161b22] p-4">
        <div className="flex gap-3">
          <button
            onClick={() => onDelete(selectedNode.id)}
            className="flex flex-1 items-center justify-center gap-2 rounded-md border border-red-900/30 bg-red-900/10 px-4 py-2 text-xs font-medium text-red-400 hover:bg-red-900/20 transition-colors"
          >
            <Trash2 size={14} />
            Delete Node
          </button>
        </div>
      </div>
    </div>
  );
};
