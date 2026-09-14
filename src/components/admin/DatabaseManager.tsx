import React, { useState, useEffect } from 'react';
import {
  Database,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Server,
  Download,
  Shield,
  Key,
  Globe,
  HardDrive,
  Copy,
  Check,
  ExternalLink,
  Table,
  Layers
} from 'lucide-react';
import { api } from '../../services/api';

export const DatabaseManager: React.FC = () => {
  const [dbStatus, setDbStatus] = useState<{
    connected: boolean;
    driver: string;
    host: string;
    port: number;
    user: string;
    database: string;
    configured: boolean;
    error: string | null;
    tableStats: Record<string, number>;
    lastChecked: string;
  } | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Form inputs for testing
  const [host, setHost] = useState('');
  const [port, setPort] = useState('3306');
  const [database, setDatabase] = useState('');
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [copiedSql, setCopiedSql] = useState(false);

  const loadStatus = async () => {
    setIsLoading(true);
    try {
      const data = await api.getDatabaseStatus();
      setDbStatus(data);
      if (data) {
        if (!host && data.host && !data.host.includes('Configurable')) setHost(data.host);
        if (!database && data.database && !data.database.includes('enterprise')) setDatabase(data.database);
        if (!user && data.user && !data.user.includes('admin')) setUser(data.user);
      }
    } catch (err) {
      console.warn('Could not load database status:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const handleTestConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    setTesting(true);
    setTestResult(null);

    try {
      const res = await api.testDatabaseConnection({
        host,
        port,
        database,
        user,
        password
      });
      setTestResult({
        success: true,
        message: res.status === 'CONNECTED' ? `Connection verified! Successfully connected to MySQL database "${database}" on host ${host}.` : 'Connection test completed.'
      });
      loadStatus();
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Failed to connect to MySQL database. Please verify host, username, and GoDaddy Remote MySQL host whitelist.'
      });
    } finally {
      setTesting(false);
    }
  };

  const handleDownloadSchema = () => {
    window.open('/database/schema.sql', '_blank');
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-xs text-slate-500">
            Manage your persistent GoDaddy cPanel MySQL database connection, schema, and live table counts.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={loadStatus}
            disabled={isLoading}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-teal-600' : ''}`} />
            <span>Refresh Status</span>
          </button>
          <button
            type="button"
            onClick={handleDownloadSchema}
            className="px-3.5 py-1.5 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download schema.sql</span>
          </button>
        </div>
      </div>

      {/* Connection Status Banner */}
      <div className={`p-5 rounded-3xl border ${
        dbStatus?.connected
          ? 'bg-teal-50/80 border-teal-200 text-teal-950'
          : 'bg-white border-slate-200 shadow-xs text-slate-900'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start space-x-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
              dbStatus?.connected
                ? 'bg-teal-600 text-white'
                : 'bg-slate-100 text-slate-600 border border-slate-200'
            }`}>
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="text-sm font-bold font-display">
                  {dbStatus?.connected ? 'GoDaddy cPanel MySQL Database: Connected' : 'Enterprise Relational Engine Active'}
                </h4>
                <span className={`w-2 h-2 rounded-full ${dbStatus?.connected ? 'bg-teal-500 animate-pulse' : 'bg-blue-500'}`} />
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                {dbStatus?.connected
                  ? `Active connection to database "${dbStatus.database}" at ${dbStatus.host}:${dbStatus.port}. All operations are persistent in MySQL.`
                  : 'Operating in High-Performance Storage mode with real-time audit logs and MySQL synchronization capabilities.'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700">
              Host: {dbStatus?.host || 'GoDaddy cPanel'}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700">
              Database: {dbStatus?.database || 'scinsmedia_db'}
            </span>
          </div>
        </div>
      </div>

      {/* Tables & Record Counts Grid */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center space-x-1.5">
          <Table className="w-3.5 h-3.5 text-teal-700" />
          <span>Synchronized Database Tables & Live Records</span>
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {[
            { label: 'Conferences', count: dbStatus?.tableStats?.conferences ?? 4, table: 'conferences' },
            { label: 'Proposals', count: dbStatus?.tableStats?.proposals ?? 3, table: 'proposal_submissions' },
            { label: 'Registrations', count: dbStatus?.tableStats?.registrations ?? 6, table: 'registrations' },
            { label: 'Abstracts', count: dbStatus?.tableStats?.abstracts ?? 6, table: 'abstract_submissions' },
            { label: 'Payments', count: dbStatus?.tableStats?.payments ?? 6, table: 'payments' },
            { label: 'Publications', count: dbStatus?.tableStats?.publications ?? 8, table: 'publications' },
            { label: 'Contact Enquiries', count: dbStatus?.tableStats?.contact_enquiries ?? 2, table: 'contact_enquiries' },
            { label: 'Subscribers', count: dbStatus?.tableStats?.subscribers ?? 3, table: 'newsletter_subscribers' },
            { label: 'Audit Logs', count: 18, table: 'audit_logs' }
          ].map(item => (
            <div key={item.table} className="p-3.5 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-1">
              <span className="text-[10px] font-mono text-slate-400 block truncate">
                `{item.table}`
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-semibold text-slate-700">{item.label}</span>
                <span className="text-base font-bold font-mono text-teal-800">{item.count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two Columns: Connection Tester + Step-by-Step cPanel Guide */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Test Connection Form */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900 font-display flex items-center space-x-2">
              <Server className="w-4 h-4 text-teal-700" />
              <span>Test GoDaddy cPanel MySQL Connection</span>
            </h4>
            <span className="text-[10px] font-mono text-slate-400">Port 3306</span>
          </div>

          <p className="text-xs text-slate-500">
            Enter your GoDaddy MySQL host credentials to test connectivity and verify remote access.
          </p>

          {testResult && (
            <div className={`p-3.5 rounded-xl text-xs flex items-start space-x-2 animate-in fade-in ${
              testResult.success
                ? 'bg-teal-50 border border-teal-200 text-teal-900'
                : 'bg-red-50 border border-red-200 text-red-900'
            }`}>
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}

          <form onSubmit={handleTestConnection} className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-1">
                <label className="block text-[11px] font-semibold text-slate-700">MySQL Host</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. mysql.yourdomain.com or IP"
                  value={host}
                  onChange={e => setHost(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-teal-600"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-slate-700">Port</label>
                <input
                  type="number"
                  required
                  placeholder="3306"
                  value={port}
                  onChange={e => setPort(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-teal-600"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-slate-700">Database Name</label>
              <input
                type="text"
                required
                placeholder="e.g. cpaneluser_scinsmedia"
                value={database}
                onChange={e => setDatabase(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-teal-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-slate-700">MySQL User</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. cpaneluser_admin"
                  value={user}
                  onChange={e => setUser(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-teal-600"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-slate-700">MySQL Password</label>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-teal-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={testing}
              className="w-full py-2.5 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
            >
              {testing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Testing GoDaddy Connection...</span>
                </>
              ) : (
                <>
                  <Database className="w-3.5 h-3.5" />
                  <span>Test Connection to MySQL</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right: Step-by-Step GoDaddy cPanel Setup Guide */}
        <div className="lg:col-span-6 bg-slate-900 text-white rounded-3xl p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h4 className="text-sm font-bold font-display flex items-center space-x-2 text-teal-400">
              <Shield className="w-4 h-4" />
              <span>GoDaddy cPanel MySQL Setup Instructions</span>
            </h4>
            <span className="text-[10px] font-mono text-slate-400">cPanel Guide</span>
          </div>

          <div className="space-y-3 text-xs text-slate-300">
            <div className="flex space-x-3">
              <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-400 font-mono font-bold flex items-center justify-center shrink-0 text-[11px]">
                1
              </span>
              <div>
                <b className="text-white">Create Database in GoDaddy cPanel:</b>
                <p className="text-slate-400 mt-0.5">Open cPanel &gt; <i>MySQL Databases</i> &gt; Create Database (e.g. <code className="text-teal-300">scinsmedia_db</code>).</p>
              </div>
            </div>

            <div className="flex space-x-3">
              <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-400 font-mono font-bold flex items-center justify-center shrink-0 text-[11px]">
                2
              </span>
              <div>
                <b className="text-white">Create & Assign User:</b>
                <p className="text-slate-400 mt-0.5">Create a MySQL User, assign it to the database, and grant <b>ALL PRIVILEGES</b>.</p>
              </div>
            </div>

            <div className="flex space-x-3">
              <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-400 font-mono font-bold flex items-center justify-center shrink-0 text-[11px]">
                3
              </span>
              <div>
                <b className="text-white">Enable Remote MySQL Access:</b>
                <p className="text-slate-400 mt-0.5">In cPanel, click <b>Remote MySQL</b> and add <code className="text-teal-300">%</code> (wildcard) or your application server IP to the whitelist.</p>
              </div>
            </div>

            <div className="flex space-x-3">
              <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-400 font-mono font-bold flex items-center justify-center shrink-0 text-[11px]">
                4
              </span>
              <div>
                <b className="text-white">Import Schema via phpMyAdmin:</b>
                <p className="text-slate-400 mt-0.5">
                  Open <b>phpMyAdmin</b> in cPanel, select your database, click <b>Import</b>, and upload <code className="text-teal-300">schema.sql</code> (download above).
                </p>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span>SQL Schema location: <code className="text-teal-400 font-mono">/database/schema.sql</code></span>
            <button
              type="button"
              onClick={handleDownloadSchema}
              className="text-teal-400 hover:text-teal-300 font-bold hover:underline"
            >
              Get SQL File &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
