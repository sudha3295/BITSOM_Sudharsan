import React, { useState } from 'react';
import {
  AlertCircle,
  ExternalLink,
  FileCode,
  FileSpreadsheet,
  FileText,
  FolderGit2,
  HardDrive,
  RefreshCw,
  Search,
  Tag,
} from 'lucide-react';
import { DriveFileItem } from '../services/driveService';

interface DriveViewProps {
  files: DriveFileItem[];
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
  onSearch: (query: string) => void;
  onReconcileDriveFile: (file: DriveFileItem) => void;
}

export const DriveView: React.FC<DriveViewProps> = ({
  files,
  isLoading,
  error,
  onRefresh,
  onSearch,
  onReconcileDriveFile,
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<DriveFileItem | null>(files[0] || null);

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('spreadsheet') || mimeType.includes('csv')) {
      return <FileSpreadsheet className="h-4 w-4 text-emerald-400" />;
    }
    if (mimeType.includes('pdf') || mimeType.includes('document')) {
      return <FileText className="h-4 w-4 text-blue-400" />;
    }
    return <FileCode className="h-4 w-4 text-slate-400" />;
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchInput);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">Google Drive Enterprise Files</h1>
            <span className="rounded bg-blue-500/20 px-2 py-0.5 text-xs font-semibold text-blue-300 border border-blue-500/30">
              Live Drive API v3
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real documents and spreadsheets stored in your authenticated Google Drive. Zero mock files.
          </p>
        </div>

        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Sync Drive Files</span>
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-300 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block mb-0.5">Google Drive Error:</span>
            {error}
          </div>
        </div>
      )}

      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search real Google Drive files by name (e.g. invoice, report, PO)..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full rounded-lg border border-slate-800 bg-slate-900 py-2 pl-9 pr-3 text-xs text-slate-200 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-hidden"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-medium text-white hover:bg-indigo-500"
        >
          Search Drive
        </button>
      </form>

      {/* Main split view */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[500px]">
        {/* Files table */}
        <div className="lg:col-span-7 flex flex-col rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
          <div className="p-3 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300">Retrieved Files ({files.length})</span>
            <span className="font-mono text-[10px] text-slate-500">drive.readonly</span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 max-h-[550px]">
            {isLoading && files.length === 0 ? (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <RefreshCw className="h-6 w-6 animate-spin mx-auto text-blue-400" />
                <p className="text-xs">Querying Google Drive API...</p>
              </div>
            ) : files.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                No files found in your authenticated Google Drive.
              </div>
            ) : (
              files.map((file) => {
                const isSelected = selectedFile?.id === file.id;
                return (
                  <div
                    key={file.id}
                    onClick={() => setSelectedFile(file)}
                    className={`p-3.5 cursor-pointer transition-colors flex items-center justify-between ${
                      isSelected
                        ? 'bg-indigo-950/40 border-l-4 border-indigo-500'
                        : 'hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 border border-slate-700 shrink-0">
                        {getFileIcon(file.mimeType)}
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-semibold text-slate-200 truncate">
                          {file.name}
                        </div>
                        <div className="text-[10px] font-mono text-slate-500 truncate">
                          ID: {file.id}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0 pl-3">
                      <div className="text-[10px] font-mono text-slate-400">
                        {file.modifiedTime ? new Date(file.modifiedTime).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* File Detail / Action Panel */}
        <div className="lg:col-span-5 flex flex-col rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
          {selectedFile ? (
            <>
              <div>
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block">
                  Selected Drive Document
                </span>
                <h3 className="text-base font-bold text-white mt-1 break-words">
                  {selectedFile.name}
                </h3>
              </div>

              <div className="space-y-2 rounded-lg border border-slate-800 bg-slate-950/70 p-4 text-xs font-mono">
                <div className="flex items-start justify-between">
                  <span className="text-slate-500">Google Drive ID:</span>
                  <span className="text-slate-300 break-all select-all">{selectedFile.id}</span>
                </div>
                <div className="flex items-start justify-between">
                  <span className="text-slate-500">MIME Type:</span>
                  <span className="text-slate-300 break-all">{selectedFile.mimeType}</span>
                </div>
                {selectedFile.size && (
                  <div className="flex items-start justify-between">
                    <span className="text-slate-500">File Size:</span>
                    <span className="text-slate-300">
                      {Math.round(parseInt(selectedFile.size, 10) / 1024)} KB
                    </span>
                  </div>
                )}
                {selectedFile.modifiedTime && (
                  <div className="flex items-start justify-between">
                    <span className="text-slate-500">Last Modified:</span>
                    <span className="text-slate-300">
                      {new Date(selectedFile.modifiedTime).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              {selectedFile.webViewLink && (
                <a
                  href={selectedFile.webViewLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Open in Google Drive Web Viewer</span>
                </a>
              )}

              <div className="pt-4 border-t border-slate-800 space-y-2">
                <span className="text-xs font-semibold text-slate-300 block">Workplace Reconciliation:</span>
                <p className="text-xs text-slate-400">
                  Cross-examine this document against Connected ERP records to discover quantity, pricing, or contract variances.
                </p>

                <button
                  onClick={() => onReconcileDriveFile(selectedFile)}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-xs font-semibold text-white hover:bg-indigo-500 shadow-md transition-all"
                >
                  <FolderGit2 className="h-3.5 w-3.5" />
                  <span>Cross-Reconcile With ERP Database</span>
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-500">
              <HardDrive className="h-10 w-10 text-slate-600 mb-2" />
              <p className="text-xs">Select a file to inspect metadata and run enterprise workflows</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
