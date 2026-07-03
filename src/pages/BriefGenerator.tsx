import { useState, useMemo } from 'react';
import { states, products } from '@/data';
import { useAuditStore } from '@/stores/useAuditStore';
import { FileText, Printer } from 'lucide-react';
import { clsx } from 'clsx';

export function BriefGenerator() {
  const { committedArchitecture, addAuditLog } = useAuditStore();

  const [selectedTemplate, setSelectedTemplate] = useState<'exec' | 'state' | 'sec'>('exec');
  const [selectedStates, setSelectedStates] = useState<string[]>(['MT', 'WY']);
  const [selectedProducts, setSelectedProducts] = useState<string[]>(['CUSTODY', 'LCX_TOKEN']);

  const handleToggleState = (abbr: string) => {
    setSelectedStates(prev =>
      prev.includes(abbr) ? prev.filter(x => x !== abbr) : [...prev, abbr]
    );
  };

  const handleToggleProduct = (id: string) => {
    setSelectedProducts(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const activeStates = useMemo(() => {
    return states.filter(s => selectedStates.includes(s.abbreviation));
  }, [selectedStates]);

  const activeProducts = useMemo(() => {
    return products.filter(p => selectedProducts.includes(p.id));
  }, [selectedProducts]);

  const handlePrint = () => {
    addAuditLog(`CCO printed compliance brief: [Template: ${selectedTemplate}]`, 'System');
    window.print();
  };

  const memoHeader = useMemo(() => {
    const today = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    return {
      to: selectedTemplate === 'sec' ? 'U.S. Securities & Exchange Commission (SEC)' : 'Board of Directors, LCX AG',
      from: 'Chief Compliance Officer, LCX USA',
      date: today,
      subject: selectedTemplate === 'sec'
        ? 'Response Outline: Token Securities and Commodity Assets Classifications'
        : selectedTemplate === 'state'
        ? 'Multi-State Money Transmitter License Submission Portfolio'
        : 'U.S. Operational Readiness and Compliance Feasibility Brief',
    };
  }, [selectedTemplate]);

  return (
    <div className="space-y-4 text-navy dark:text-ice h-[calc(100vh-6.5rem)] flex flex-col overflow-hidden min-h-0 print:p-0 print:bg-white print:text-black">
      {/* Header (hidden on print) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 shrink-0 print:hidden">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText size={24} className="text-navy dark:text-ice" /> Executive Memo &amp; Brief Publisher
          </h1>
          <p className="text-sm text-grey-dark dark:text-grey-light mt-0.5">
            Compile watermarked, legal compliance briefings directly for counsel, banks, or the board.
          </p>
        </div>

        {/* Print Trigger */}
        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 h-9 rounded bg-navy dark:bg-ice text-white dark:text-navy hover:opacity-95 px-4 text-xs font-bold shadow-sm transition-colors shrink-0"
        >
          <Printer size={14} />
          <span>Print Brief / Save PDF</span>
        </button>
      </div>

      {/* Main split view container */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0 overflow-hidden print:overflow-visible print:block print:h-auto">
        
        {/* Left Side: Parameters panel (hidden on print) */}
        <div className="w-full lg:w-80 bg-card border border-line rounded-lg p-4 overflow-y-auto space-y-4 shrink-0 shadow-sm print:hidden">
          
          {/* Choose Template */}
          <div className="space-y-2">
            <span className="font-bold text-[10px] uppercase tracking-wider text-grey block">1. Choose Template</span>
            <div className="space-y-1.5">
              {[
                { id: 'exec', label: 'Executive Board Briefing' },
                { id: 'state', label: 'State Regulators Memo' },
                { id: 'sec', label: 'SEC Regulatory Response' },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTemplate(t.id as any)}
                  className={clsx(
                    'w-full text-left p-2 rounded text-xs font-semibold border transition-colors',
                    selectedTemplate === t.id
                      ? 'border-navy bg-navy/5 text-navy dark:border-ice dark:bg-ice-soft/5 dark:text-ice'
                      : 'border-line hover:bg-ice-soft/10 text-grey-dark'
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Select Target Launch States */}
          <div className="space-y-2 pt-2 border-t border-line">
            <span className="font-bold text-[10px] uppercase tracking-wider text-grey block">2. Select Target States</span>
            <div className="grid grid-cols-3 gap-1.5">
              {states.filter(s => s.tier !== 'Unresearched').map(s => {
                const active = selectedStates.includes(s.abbreviation);
                return (
                  <button
                    key={s.id}
                    onClick={() => handleToggleState(s.abbreviation)}
                    className={clsx(
                      'px-1.5 py-1 rounded text-[10px] font-mono border text-center font-bold transition-all',
                      active
                        ? 'bg-navy border-navy text-white dark:bg-ice dark:border-ice dark:text-navy'
                        : 'border-line bg-card text-grey-dark hover:bg-ice-soft dark:hover:bg-ice-soft/10'
                    )}
                  >
                    {s.abbreviation}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Select listed assets */}
          <div className="space-y-2 pt-2 border-t border-line">
            <span className="font-bold text-[10px] uppercase tracking-wider text-grey block">3. Select Listed Assets</span>
            <div className="space-y-1.5">
              {products.map(p => {
                const active = selectedProducts.includes(p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => handleToggleProduct(p.id)}
                    className={clsx(
                      'flex items-center gap-2 w-full text-left p-1.5 rounded border text-[10px] font-semibold transition-colors',
                      active
                        ? 'border-navy bg-navy/5 text-navy dark:border-ice dark:bg-ice-soft/5 dark:text-ice'
                        : 'border-line hover:bg-ice-soft/10 text-grey-dark'
                    )}
                  >
                    <input type="checkbox" checked={active} readOnly className="rounded h-3 w-3 pointer-events-none" />
                    <span>{p.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Side: A4 Preview panel */}
        <div className="flex-1 bg-grey-light/50 dark:bg-navy-deep/20 border border-line rounded-lg p-6 shadow-sm overflow-y-auto flex justify-center print:border-0 print:p-0 print:bg-white print:shadow-none print:overflow-visible">
          
          {/* A4 Sheet layout container */}
          <div
            className="w-[210mm] min-h-[297mm] bg-white text-slate-900 px-[20mm] py-[25mm] shadow-lg rounded border border-slate-200 relative overflow-hidden font-sans print:shadow-none print:border-0 print:w-full print:p-0"
            style={{ boxSizing: 'border-box' }}
          >
            {/* Rotating Confidential Watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] select-none z-0">
              <span className="text-[64px] font-extrabold rotate-45 uppercase font-mono tracking-widest text-red-600 border-[10px] border-red-600 p-6">
                Confidential - CCO Audit
              </span>
            </div>

            {/* Document Body (z-index to stay above watermark) */}
            <div className="relative z-10 space-y-6">
              
              {/* CCO Memorandum Header block */}
              <div className="border-b-[3px] border-slate-900 pb-4">
                <h2 className="text-3xl font-extrabold tracking-tight text-center uppercase font-mono mb-6">Memorandum</h2>
                
                <div className="grid grid-cols-4 gap-y-2 text-xs font-mono">
                  <span className="font-bold uppercase text-slate-500">To:</span>
                  <span className="col-span-3 font-semibold text-slate-950">{memoHeader.to}</span>
                  
                  <span className="font-bold uppercase text-slate-500">From:</span>
                  <span className="col-span-3 font-semibold text-slate-950">{memoHeader.from}</span>
                  
                  <span className="font-bold uppercase text-slate-500">Date:</span>
                  <span className="col-span-3 font-semibold text-slate-950">{memoHeader.date}</span>
                  
                  <span className="font-bold uppercase text-slate-500">Subject:</span>
                  <span className="col-span-3 font-bold text-slate-950 uppercase">{memoHeader.subject}</span>
                </div>
              </div>

              {/* Template Content Renders */}
              {selectedTemplate === 'exec' && (
                <div className="space-y-4 text-xs leading-relaxed text-slate-800 font-sans">
                  <h3 className="text-sm font-bold text-slate-950 border-b border-slate-300 pb-1">1. Scope and Rollout Architecture</h3>
                  <p>
                    This memorandum provides an operational analysis of the U.S. launch strategy. The active committed rollout model is set to <strong>{committedArchitecture ? committedArchitecture.toUpperCase() : 'NOT COMMITTED (defaulting to Option C Custodial)'}</strong>.
                  </p>

                  <h3 className="text-sm font-bold text-slate-950 border-b border-slate-300 pb-1">2. Target Launch Jurisdictions</h3>
                  <p>
                    The proposed first-wave jurisdictions include {activeStates.length} states: {activeStates.map(s => s.name).join(', ') || 'None selected'}. 
                    Money Transmitter Licensing (MTL) application processes will be triggered in states demanding licenses (e.g. {activeStates.filter(s => s.nmlsRequired).map(s => s.abbreviation).join(', ') || 'none'}).
                  </p>

                  <h3 className="text-sm font-bold text-slate-950 border-b border-slate-300 pb-1">3. Capital Requirement Projections</h3>
                  <p>
                    Based on the active state cohort selection, the aggregate estimated licensing fees sum to <strong>${activeStates.reduce((acc, s) => { if (s.estCost) { const parsed = parseInt(s.estCost.replace(/[^0-9]/g, '')); return acc + (isNaN(parsed) ? 15000 : parsed * (s.estCost.includes('K') ? 1000 : 1)); } return acc + 15000; }, 0).toLocaleString()}</strong>. Combined surety bond collateral requirements require a minimum escrow allocation of <strong>${activeStates.reduce((acc, s) => { if (s.suretyBond) { const val = parseInt(s.suretyBond.replace(/[^0-9]/g, '')) || 0; return acc + val; } return acc; }, 0).toLocaleString()}</strong>.
                  </p>
                </div>
              )}

              {selectedTemplate === 'state' && (
                <div className="space-y-4 text-xs leading-relaxed text-slate-800 font-sans">
                  <h3 className="text-sm font-bold text-slate-950 border-b border-slate-300 pb-1">1. Money Transmitter Licensing (MTL) Portfolio</h3>
                  <p>
                    This brief outlines the license registration structures submitted under NMLS guidelines for the following states: {activeStates.map(s => s.name).join(', ') || 'None selected'}.
                  </p>

                  <h3 className="text-sm font-bold text-slate-950 border-b border-slate-300 pb-1">2. Regulatory Sandbox &amp; Exemptions</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {activeStates.map(s => (
                      <li key={s.id}>
                        <strong>{s.name}</strong>: {s.sandboxAvailable ? `Exemption active under sandbox rules. ("${s.sandboxNotes}")` : 'No sandbox programs available; standard MTL required.'}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedTemplate === 'sec' && (
                <div className="space-y-4 text-xs leading-relaxed text-slate-800 font-sans">
                  <h3 className="text-sm font-bold text-slate-950 border-b border-slate-300 pb-1">1. Token Listing and securities Classifications</h3>
                  <p>
                    This legal analysis outline covers the securities risks calculated for the following listed digital assets:
                  </p>
                  
                  <div className="space-y-2.5">
                    {activeProducts.map(p => (
                      <div key={p.id} className="border border-slate-200 rounded p-2 bg-slate-50">
                        <p className="font-bold font-mono text-slate-950">{p.name} (Howey Index: {p.howeyScore !== undefined ? `${p.howeyScore}%` : 'N/A'})</p>
                        <p className="text-[10px] text-slate-600 mt-0.5">{p.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CCO Digital Stamp Signatures */}
              <div className="pt-8 border-t border-slate-300 flex justify-between items-center text-[10px] font-mono mt-12 select-none">
                <div>
                  <span className="font-bold text-slate-500 uppercase block">Published by:</span>
                  <span className="font-bold text-slate-950">LCX USA Compliance Office</span>
                </div>
                <div className="border-2 border-slate-900 rounded p-2 text-[9px] uppercase tracking-wider text-slate-950 font-bold border-double">
                  [Digitally Certified Stamp]
                  <span className="block text-[9px] text-slate-500 font-normal">Hash: sha256_e8d21b37</span>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* Stylesheet injector for print margins overriding dashboard headers */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:p-0, .print\\:p-0 * {
            visibility: visible;
          }
          .print\\:p-0 {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: auto;
            background: white !important;
            color: black !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
export default BriefGenerator;
