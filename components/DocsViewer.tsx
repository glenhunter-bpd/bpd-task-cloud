
import React, { useState, useEffect } from 'react';
import { Book, ChevronRight, FileText, Info } from 'lucide-react';

const DOCS = [
  { id: 'arch', name: 'System Architecture', file: 'docs/architecture.md', icon: Info },
  { id: 'sync', name: 'Sync Protocol v2', file: 'docs/sync_protocol.md', icon: Book },
  { id: 'history', name: 'Version History', file: 'docs/changelog.md', icon: FileText },
];

const DocsViewer: React.FC = () => {
  const [selectedDoc, setSelectedDoc] = useState(DOCS[0]);
  const [content, setContent] = useState<string>('Loading document...');

  useEffect(() => {
    const mockFetch = async () => {
      setContent('Loading document content...');
      try {
        let text = "";
        if (selectedDoc.id === 'arch') {
          text = "# BPD Cloud Architecture v2\n\n## System Overview\nThe BPD Global Task Sync application is a distributed management system for the Broadband Policy team.\n\n## Tech Stack\n- **Frontend**: React 19 + Tailwind CSS.\n- **State**: Reactive `DatabaseService`.\n- **Sync**: `BroadcastChannel` v2.\n- **AI**: Gemini 3 Flash.\n\n## Core Pillars\n1. **Real-time Sync**: Zero-latency cross-tab updates.\n2. **Operational Safety**: Sitewide custom confirmation dialogs.\n3. **Audit Trail**: Every change is logged with `updatedBy` metadata.";
        } else if (selectedDoc.id === 'sync') {
          text = "# Sync Protocol v2.2-STABLE\n\n## Goal\nTo ensure state consistency across all browser contexts (tabs/windows) for global staff.\n\n## Implementation\nThe system uses the `BroadcastChannel` API to emit `UPDATE` events. When a node receives an event, it fetches the latest state from the shared persistence layer.\n\n## Supported Entities\n- Tasks (Full CRUD)\n- Programs (Full CRUD)\n- Users (Full CRUD)\n- System Settings";
        } else {
          text = "# Version History\n\n## [v2.2.0-STABLE] - 2025-06-01\n### Added\n- **Final Stabilization**: Comprehensive audit for production readiness.\n- **Dynamic Styling**: Support for user-defined grant categories.\n- **Persona Management**: Improved switcher logic.\n\n## [v2.1.5] - 2025-05-30\n### Added\n- **Custom Confirmation Modal**: Branded dialogs for all delete actions.\n\n## [v2.1.4] - 2025-05-28\n### Added\n- **Team & Grant Editing**: Full CRUD for all core registries.";
        }
        setContent(text);
      } catch (e) {
        setContent("Error loading document.");
      }
    };
    mockFetch();
  }, [selectedDoc]);

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm animate-in fade-in duration-500">
      <div className="flex border-b border-slate-100 h-full">
        <div className="w-72 border-r border-slate-100 bg-slate-50/50 p-6 space-y-4">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Knowledge Base</h3>
          <div className="space-y-1">
            {DOCS.map((doc) => {
              const Icon = doc.icon;
              return (
                <button
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all ${
                    selectedDoc.id === doc.id
                      ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-200'
                      : 'text-slate-600 hover:bg-white hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={16} />
                    <span>{doc.name}</span>
                  </div>
                  <ChevronRight size={14} className={selectedDoc.id === doc.id ? 'opacity-100' : 'opacity-40'} />
                </button>
              );
            })}
          </div>
        </div>
        
        <div className="flex-1 p-10 overflow-y-auto bg-white scroll-smooth">
          <article className="max-w-3xl mx-auto">
            <div className="whitespace-pre-wrap font-sans leading-relaxed text-slate-700">
              {content.split('\n').map((line, i) => {
                if (line.startsWith('# ')) return <h1 key={i} className="text-4xl font-black text-slate-900 mb-8">{line.replace('# ', '')}</h1>;
                if (line.startsWith('## ')) return <h2 key={i} className="text-xl font-bold text-slate-800 mt-10 mb-4 border-b border-slate-100 pb-2">{line.replace('## ', '')}</h2>;
                if (line.startsWith('### ')) return <h3 key={i} className="text-lg font-bold text-slate-800 mt-8 mb-2">{line.replace('### ', '')}</h3>;
                if (line.trim() === '') return <div key={i} className="h-4" />;
                if (line.startsWith('- ')) return <li key={i} className="ml-4 mb-1 list-disc list-outside text-slate-600">{line.replace('- ', '')}</li>;
                return <p key={i} className="mb-4 text-slate-600">{line}</p>;
              })}
            </div>
          </article>
        </div>
      </div>
    </div>
  );
};

export default DocsViewer;
