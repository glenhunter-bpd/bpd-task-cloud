import React, { useState, useEffect } from 'react';
import { Book, ChevronRight, FileText, Info } from 'lucide-react';

const DOCS = [
  { id: 'arch', name: 'System Architecture', file: 'docs/architecture.md', icon: Info },
  { id: 'sync', name: 'Sync Protocol v4.5', file: 'docs/sync_protocol.md', icon: Book },
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
          text = "# BPD Cloud Architecture v4.5.0-SENTINEL\n\n## System Overview\nThe BPD Cloud Registry V4.5 introduces the **AI Sentinel**, an autonomous background agent that performs real-time risk assessments.\n\n## Tech Stack\n- **Frontend Core**: React 19 + Tailwind CSS.\n- **Data Layer**: Supabase (PostgreSQL + Realtime Engine).\n- **Intelligence**: Google Gemini 3 Flash-Preview.\n\n## Pillars\n1. **AI Sentinel**: Background observer identifying anomalies every 300s.\n2. **My Mission**: Personalized views for staff blockers and unblocked tasks.\n3. **Dependency Nexus**: Visual graph traversal and enforcement logic.";
        } else if (selectedDoc.id === 'sync') {
          text = "# BPD Cloud Sync Protocol v4.5\n\n## The Handshake\nThe system executes a multi-step handshake: Discovery, Ping, Reconciliation, and WebSocket Subscription.\n\n## Sentinel Integration\nV4.5 introduces the Background Analysis loop. The `DatabaseService` triggers a structured JSON risk query to Gemini every 5 minutes after a sync event. Results are broadcast to the user via the Pulse Feed.\n\n## Conflict Resolution\nLast-Write-Wins (LWW) strategy with strict graph-aware UI enforcement.";
        } else {
          text = "# Version History\n\n## [v4.5.0-SENTINEL] - 2025-03-16\n### Added\n- **AI Sentinel**: Background anomaly detection.\n- **Quick-Switch Identity**: Header-based staff switching.\n\n## [v4.3.0-MISSION] - 2025-03-15\n### Added\n- **My Mission**: Personalized task prioritization.\n- **Blocker Tracking**: Automated identification of downstream bottlenecks.";
        }
        setContent(text);
      } catch (e) {
        setContent("Error loading document.");
      }
    };
    mockFetch();
  }, [selectedDoc]);

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm animate-in fade-in duration-500 min-h-[500px]">
      <div className="flex border-b border-slate-100 h-full flex-1">
        <div className="w-72 border-r border-slate-100 bg-slate-50/50 p-6 space-y-4 flex-shrink-0">
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
        
        <div className="flex-1 p-10 overflow-y-auto bg-white scroll-smooth custom-scrollbar">
          <article className="max-w-3xl mx-auto">
            <div className="whitespace-pre-wrap font-sans leading-relaxed text-slate-700">
              {content.split('\n').map((line, i) => {
                if (line.startsWith('# ')) return <h1 key={i} className="text-4xl font-black text-slate-900 mb-8">{line.replace('# ', '')}</h1>;
                if (line.startsWith('## ')) return <h2 key={i} className="text-xl font-bold text-slate-800 mt-10 mb-4 border-b border-slate-100 pb-2">{line.replace('## ', '')}</h2>;
                if (line.startsWith('### ')) return <h3 key={i} className="text-lg font-bold text-slate-800 mt-8 mb-2">{line.replace('### ', '')}</h3>;
                if (line.trim() === '') return <div key={i} className="h-4" />;
                if (line.startsWith('- ')) return <li key={i} className="ml-4 mb-1 list-disc list-outside text-slate-600 font-medium">{line.replace('- ', '')}</li>;
                return <p key={i} className="mb-4 text-slate-600 font-medium">{line}</p>;
              })}
            </div>
          </article>
        </div>
      </div>
    </div>
  );
};

export default DocsViewer;