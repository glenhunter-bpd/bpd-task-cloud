
import React, { useState, useEffect } from 'react';
import { Book, ChevronRight, FileText, Info, ShieldCheck, Zap } from 'lucide-react';

const DOCS = [
  { id: 'arch', name: 'System Architecture v5', file: 'docs/architecture.md', icon: Info },
  { id: 'sync', name: 'Sync Protocol v5.0', file: 'docs/sync_protocol.md', icon: Zap },
  { id: 'history', name: 'Global Version History', file: 'docs/changelog.md', icon: FileText },
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
          text = `# BPD Cloud Architecture v5.0.0-ENTERPRISE

## Lifecycle Status: ACTIVE DEVELOPMENT
The BPD Cloud Registry V5 Enterprise builds upon the stable V4 core, introducing high-level strategic planning and cross-departmental resource optimization.

## Core V5 Pillars
1. **Advanced Resource Planning (ARP)**: Transitioning from simple heat-mapping to predictive workload distribution and departmental capacity analysis.
2. **Strategic AI Sentinel**: Upgraded from anomaly detection to strategic advisory, identifying multi-grant synergies and identifying 'Cross-Pollination' opportunities between grants.
3. **Multimodal Auditing**: Roadmap inclusion for the Gemini Live API to allow real-time audio/video registry audits.

## Tech Stack Evolution
- **Intelligence**: Migrating to **Gemini 3 Pro-Preview** for complex reasoning.
- **Data Layer**: **Supabase Nexus v5** (Optimized for higher concurrency).
- **Frontend**: React 19 + Tailwind CSS + Recharts.

## Relational Integrity
V5 mandates strict unique constraints on the 'programs' and 'users' tables to ensure zero-collision synchronicity across the enterprise cloud.`;
        } else if (selectedDoc.id === 'sync') {
          text = `# BPD Cloud Sync Protocol v5.0 (ENTERPRISE)

## The Nexus Handshake
Every client node performs a 4-step initialization sequence to ensure registry parity:
1. **Credential Validation**: Secure lookup of Supabase URL and Service Keys.
2. **Reconciliation Pulse**: Full state diffing to build the local shadow registry.
3. **WebSocket Handshake**: Establishing a dedicated channel on \`bpd-realtime-global\`.
4. **Subscription**: Attaching to Postgres changes for sub-second reactivity.

## V5 Delta-Sync Protocol (Beta)
V5 introduces the **Delta-Sync Engine**, which reduces bandwidth by 70% by fetching only the JSON segments that have changed since the last \`updated_at\` timestamp, rather than full table reconciliations.

## SQL Provisioning (Mandatory)
To support the 'Insert or Update' (Upsert) logic in the V5 engine, the following constraints must be present in the remote SQL environment:
- \`ALTER TABLE programs ADD CONSTRAINT programs_name_key UNIQUE (name);\`
- \`ALTER TABLE users ADD CONSTRAINT users_email_key UNIQUE (email);\`

Failure to apply these will result in the \`42P10\` Unique Constraint error during cloud sync.`;
        } else {
          text = `# Global Version History

## [v5.0.0-ENTERPRISE] - 2025-03-18
### Added
- **Enterprise Core**: Initialization of the V5 lifecycle.
- **ARP Framework**: Foundation for Advanced Resource Planning.
- **Enterprise UI**: Updated emerald branding and high-fidelity interface components.
- **Strategic Sentinel**: Enhanced anomaly detection logic.

## [v4.6.0-HEAT] - 2025-03-17 (FINAL V4)
### Added
- **Thermal Risk Engine**: Weighted health scoring for grant portfolios.
- **Grant Heatmap**: Visual pulse system for high-risk grant portfolios.
### Fixed
- **SQL Provisioning Docs**: Detailed troubleshooting for the \`42P10\` constraint error.

## [v4.5.0-SENTINEL] - 2025-03-16
### Added
- **Autonomous AI Sentinel**: Proactive background agent for anomaly detection.
- **Quick-Switcher**: Header-based identity switching for staff context simulation.

## [v4.3.0-MISSION] - 2025-03-15
### Added
- **My Mission Command Center**: Personalized operational summary focusing on direct blockers and unblocked tasks.`;
        }
        setContent(text);
      } catch (e) {
        setContent("Error loading document.");
      }
    };
    mockFetch();
  }, [selectedDoc]);

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm animate-in fade-in duration-500 min-h-[600px]">
      <div className="flex border-b border-slate-100 h-full flex-1 min-h-[600px]">
        <div className="w-72 border-r border-slate-100 bg-slate-50/50 p-6 space-y-4 flex-shrink-0">
          <div className="flex items-center gap-2 px-2 mb-2">
            <ShieldCheck size={16} className="text-emerald-600" />
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Enterprise Knowledge</h3>
          </div>
          <div className="space-y-1">
            {DOCS.map((doc) => {
              const Icon = doc.icon;
              return (
                <button
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all ${
                    selectedDoc.id === doc.id
                      ? 'bg-indigo-600 text-white font-semibold shadow-lg shadow-indigo-600/20'
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

          <div className="mt-auto pt-10 px-2">
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
              <div className="flex items-center gap-2 mb-2">
                <Zap size={12} className="text-emerald-600 fill-emerald-600" />
                <span className="text-[9px] font-black text-emerald-700 uppercase tracking-widest">V5 Engine Active</span>
              </div>
              <p className="text-[10px] text-emerald-600 font-medium leading-relaxed">
                Documentation is automatically reconciled with the BPD Nexus Registry v5.0 standard.
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex-1 p-10 overflow-y-auto bg-white scroll-smooth custom-scrollbar">
          <article className="max-w-3xl mx-auto pb-20">
            <div className="whitespace-pre-wrap font-sans leading-relaxed text-slate-700">
              {content.split('\n').map((line, i) => {
                if (line.startsWith('# ')) return <h1 key={i} className="text-4xl font-black text-slate-900 mb-8 tracking-tight">{line.replace('# ', '')}</h1>;
                if (line.startsWith('## ')) return <h2 key={i} className="text-xl font-bold text-slate-800 mt-10 mb-4 border-b border-slate-100 pb-2">{line.replace('## ', '')}</h2>;
                if (line.startsWith('### ')) return <h3 key={i} className="text-lg font-bold text-slate-800 mt-8 mb-2">{line.replace('### ', '')}</h3>;
                if (line.trim() === '') return <div key={i} className="h-4" />;
                if (line.startsWith('- ')) return <li key={i} className="ml-4 mb-2 list-disc list-outside text-slate-600 font-medium">{line.replace('- ', '')}</li>;
                if (line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ') || line.startsWith('4. ')) {
                  return <div key={i} className="ml-4 mb-3 font-semibold text-slate-700 flex gap-2">
                    <span className="text-indigo-600">{line.split('.')[0]}.</span>
                    <span>{line.split('.').slice(1).join('.').trim()}</span>
                  </div>;
                }
                if (line.startsWith('`')) {
                  return <div key={i} className="my-4 p-4 bg-slate-900 rounded-xl font-mono text-xs text-indigo-300 border border-slate-800 overflow-x-auto">
                    {line.replace(/`/g, '')}
                  </div>;
                }
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
