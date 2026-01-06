
import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { MOCK_DOCUMENTS } from '../constants';
import { Document as AppDocument } from '../types';

type SortKey = 'name' | 'type' | 'uploadDate';
type StatusFilter = 'All' | 'Verified' | 'Uploaded' | 'Missing';

interface UploadTask {
  id: string;
  name: string;
  progress: number;
  size: number;
  status: 'queued' | 'uploading' | 'completed' | 'error';
  type: string;
}

interface DocumentWithPreview extends AppDocument {
  previewUrl?: string;
  isNew?: boolean;
}

const Documents: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentWithPreview[]>(MOCK_DOCUMENTS);
  const [sortBy, setSortBy] = useState<SortKey>('name');
  const [filterStatus, setFilterStatus] = useState<StatusFilter>('All');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Upload related state
  const [isDraggingGlobal, setIsDraggingGlobal] = useState(false);
  const [showUploadZone, setShowUploadZone] = useState(false);
  const [uploadQueue, setUploadQueue] = useState<UploadTask[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Preview State
  const [previewDoc, setPreviewDoc] = useState<DocumentWithPreview | null>(null);

  // Helper: Format bytes
  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const processedDocuments = useMemo(() => {
    let result = [...documents];
    if (filterStatus !== 'All') result = result.filter(doc => doc.status === filterStatus);
    if (searchTerm.trim()) {
      result = result.filter(doc => doc.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    result.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'type') return a.type.localeCompare(b.type);
      if (sortBy === 'uploadDate') {
        return new Date(b.uploadDate || 0).getTime() - new Date(a.uploadDate || 0).getTime();
      }
      return 0;
    });
    return result;
  }, [documents, filterStatus, sortBy, searchTerm]);

  // Highlight Text Component
  const HighlightText = ({ text, highlight }: { text: string; highlight: string }) => {
    if (!highlight.trim()) return <span>{text}</span>;
    const regex = new RegExp(`(${highlight})`, 'gi');
    const parts = text.split(regex);
    return (
      <span>
        {parts.map((part, i) => 
          regex.test(part) ? (
            <mark key={i} className="bg-indigo-100 text-indigo-700 font-bold p-0 rounded">{part}</mark>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </span>
    );
  };

  const identifyType = (file: File) => {
    if (file.type.startsWith('image/')) return 'IMAGE';
    if (file.type === 'application/pdf') return 'PDF';
    return file.name.split('.').pop()?.toUpperCase() || 'FILE';
  };

  const simulateUpload = (files: FileList | File[]) => {
    const fileList = Array.from(files);
    const newTasks: UploadTask[] = fileList.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      progress: 0,
      size: file.size,
      status: 'uploading',
      type: identifyType(file)
    }));

    setUploadQueue(prev => [...newTasks, ...prev]);

    fileList.forEach((file, index) => {
      const task = newTasks[index];
      let progress = 0;
      const speed = Math.random() * 15 + 5; // Variation in upload speeds
      
      const interval = setInterval(() => {
        progress += speed;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          
          setUploadQueue(prev => prev.map(t => 
            t.id === task.id ? { ...t, progress: 100, status: 'completed' } : t
          ));

          const type = identifyType(file);
          const newDoc: DocumentWithPreview = {
            id: task.id,
            name: file.name,
            type: type,
            status: 'Uploaded',
            uploadDate: new Date().toISOString().split('T')[0],
            previewUrl: type === 'IMAGE' ? URL.createObjectURL(file) : undefined,
            isNew: true
          };
          
          setDocuments(prev => [newDoc, ...prev]);

          // Simulate verification delay
          setTimeout(() => {
            setDocuments(prev => prev.map(doc => 
              doc.id === task.id ? { ...doc, status: 'Verified', isNew: false } : doc
            ));
          }, 5000);
        } else {
          setUploadQueue(prev => prev.map(t => 
            t.id === task.id ? { ...t, progress } : t
          ));
        }
      }, 200);
    });
  };

  // Drag and Drop Handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDraggingGlobal(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set false if we leave the window or move back to main content
    if (e.currentTarget === e.target) {
      setIsDraggingGlobal(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingGlobal(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      simulateUpload(e.dataTransfer.files);
    }
  };

  const removeTask = (id: string) => {
    setUploadQueue(prev => prev.filter(t => t.id !== id));
  };

  const clearCompleted = () => {
    setUploadQueue(prev => prev.filter(t => t.status !== 'completed'));
  };

  return (
    <div 
      className="space-y-6 min-h-screen"
      onDragEnter={handleDragEnter}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      {/* Global Drag Overlay */}
      {isDraggingGlobal && (
        <div 
          className="fixed inset-0 z-[100] bg-indigo-600/90 backdrop-blur-md flex flex-col items-center justify-center text-white p-8 animate-in fade-in duration-300"
          onDragLeave={handleDragLeave}
        >
          <div className="w-32 h-32 rounded-full bg-white/20 flex items-center justify-center mb-8 border-4 border-white border-dashed animate-pulse">
            <i className="fas fa-cloud-upload-alt text-6xl"></i>
          </div>
          <h2 className="text-4xl font-black mb-4">Drop to Upload</h2>
          <p className="text-xl text-indigo-100 font-medium">Release your files anywhere to securely store them.</p>
        </div>
      )}

      {/* Header & Actions */}
      <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Document Vault</h2>
          <p className="text-slate-500 font-medium">Global academic record management</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowUploadZone(!showUploadZone)}
            className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-3"
          >
            <i className="fas fa-plus"></i>
            Upload New Files
          </button>
        </div>
      </div>

      {/* Active Upload Queue Panel */}
      {uploadQueue.length > 0 && (
        <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden animate-in slide-in-from-top-4 duration-500">
          <div className="bg-slate-50 px-8 py-4 border-b border-slate-200 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 bg-indigo-600 rounded-full animate-ping"></span>
              <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Active Upload Center</h4>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase">{uploadQueue.filter(t => t.status === 'completed').length} / {uploadQueue.length} Done</span>
              <button 
                onClick={clearCompleted}
                className="text-xs text-indigo-600 font-bold hover:underline"
              >
                Clear Completed
              </button>
            </div>
          </div>
          <div className="p-6 max-h-[300px] overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {uploadQueue.map(task => (
                <div key={task.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-4 relative group">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                    task.status === 'completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-white text-indigo-500 shadow-sm'
                  }`}>
                    <i className={`fas ${task.status === 'completed' ? 'fa-check' : (task.type === 'PDF' ? 'fa-file-pdf' : 'fa-file-alt')}`}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-sm font-bold text-slate-800 truncate pr-4">{task.name}</p>
                      <span className="text-[10px] font-bold text-slate-400">{formatBytes(task.size)}</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${task.status === 'completed' ? 'bg-emerald-500' : 'bg-indigo-600'}`}
                        style={{ width: `${task.progress}%` }}
                      ></div>
                    </div>
                    <p className={`text-[10px] mt-1 font-black uppercase tracking-tighter ${task.status === 'completed' ? 'text-emerald-600' : 'text-indigo-400'}`}>
                      {task.status === 'completed' ? 'Finished' : `Uploading... ${Math.round(task.progress)}%`}
                    </p>
                  </div>
                  <button 
                    onClick={() => removeTask(task.id)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-red-500 transition-all"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Manual Upload Trigger Zone */}
      {showUploadZone && (
        <div 
          className="bg-indigo-50 border-4 border-dashed border-indigo-200 rounded-[2.5rem] p-12 flex flex-col items-center text-center animate-in zoom-in-95"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <input 
            type="file" 
            multiple 
            className="hidden" 
            ref={fileInputRef}
            onChange={(e) => e.target.files && simulateUpload(e.target.files)}
          />
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-indigo-600 text-4xl shadow-lg mb-6">
            <i className="fas fa-file-import"></i>
          </div>
          <h3 className="text-2xl font-black text-slate-800 mb-2">Select multiple files</h3>
          <p className="text-slate-500 mb-8 max-w-sm">Transcripts, Recommendation Letters, or Language Certificates. Up to 50MB per file.</p>
          <div className="flex gap-4">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="bg-white text-indigo-600 border-2 border-indigo-100 px-8 py-3 rounded-2xl font-black hover:bg-white/80 transition-all shadow-md"
            >
              Choose Files
            </button>
            <button 
              onClick={() => setShowUploadZone(false)}
              className="px-8 py-3 rounded-2xl font-black text-slate-400 hover:text-slate-600"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"></i>
          <input 
            type="text" 
            placeholder="Search documents by name..."
            className="w-full pl-12 pr-6 py-3 rounded-2xl border border-slate-100 bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <select 
            className="bg-slate-50 border border-slate-100 px-4 py-3 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-600 text-sm"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as StatusFilter)}
          >
            <option value="All">All Status</option>
            <option value="Verified">Verified Only</option>
            <option value="Uploaded">Processing</option>
            <option value="Missing">Pending</option>
          </select>
          <select 
            className="bg-slate-50 border border-slate-100 px-4 py-3 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-600 text-sm"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortKey)}
          >
            <option value="name">A - Z</option>
            <option value="type">File Type</option>
            <option value="uploadDate">Recently Added</option>
          </select>
        </div>
      </div>

      {/* Document List Table */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Document</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Added On</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Verification</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {processedDocuments.map((doc) => (
              <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-all ${
                      doc.type === 'PDF' ? 'bg-rose-50 text-rose-500' : 'bg-indigo-50 text-indigo-600'
                    }`}>
                      <i className={`fas ${doc.type === 'PDF' ? 'fa-file-pdf' : 'fa-file-alt'}`}></i>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800"><HighlightText text={doc.name} highlight={searchTerm} /></span>
                        {doc.isNew && (
                          <span className="bg-emerald-500 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-full animate-pulse">New</span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Secure Storage ID: {doc.id.toUpperCase()}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5 font-black text-xs text-slate-400 uppercase tracking-widest">{doc.type}</td>
                <td className="px-8 py-5 text-sm text-slate-500 font-medium">{doc.uploadDate || '--'}</td>
                <td className="px-8 py-5">
                  <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    doc.status === 'Verified' ? 'bg-emerald-50 text-emerald-600' :
                    doc.status === 'Uploaded' ? 'bg-indigo-50 text-indigo-600' :
                    'bg-slate-100 text-slate-400'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      doc.status === 'Verified' ? 'bg-emerald-500' :
                      doc.status === 'Uploaded' ? 'bg-indigo-500' : 'bg-slate-300'
                    }`}></span>
                    {doc.status}
                  </span>
                </td>
                <td className="px-8 py-5 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="w-10 h-10 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 shadow-sm transition-all"><i className="fas fa-eye"></i></button>
                    <button className="w-10 h-10 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 shadow-sm transition-all"><i className="fas fa-download"></i></button>
                    <button 
                      onClick={() => setDocuments(prev => prev.filter(d => d.id !== doc.id))}
                      className="w-10 h-10 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-rose-500 hover:border-rose-200 shadow-sm transition-all"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {processedDocuments.length === 0 && (
          <div className="py-24 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
              <i className="fas fa-folder-open text-4xl"></i>
            </div>
            <h3 className="text-xl font-bold text-slate-800">No documents found</h3>
            <p className="text-slate-500 mt-2">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f8fafc;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
};

export default Documents;
