import { useState } from 'react';
import { readinessItems } from '@/data/readiness';
import { Card, CardBody } from '@/components/ui';
import { ReadinessItem, ReadinessStatus } from '@/types/ontology';
import { FileText, Award, Landmark } from 'lucide-react';

const categoryIcons = {
  Corporate: Landmark,
  Documents: FileText,
  Surveillance: Award,
};

const statusClasses: Record<ReadinessStatus, string> = {
  'Not Started': 'border-line text-grey dark:text-grey-light/50',
  'In Progress': 'border-status-deferred text-status-deferred',
  'Counsel Review': 'border-status-conditional text-status-conditional',
  'Complete': 'border-status-ready text-status-ready bg-status-ready/5',
};

export function ReadinessStack() {
  const [items, setItems] = useState<ReadinessItem[]>(() => {
    const saved = localStorage.getItem('lcx-readiness-stack');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Fallback checks to ensure parsed is valid array
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    return readinessItems;
  });

  const updateStatus = (id: string, status: ReadinessStatus) => {
    const next = items.map(item => item.id === id ? { ...item, status } : item);
    setItems(next);
    localStorage.setItem('lcx-readiness-stack', JSON.stringify(next));
  };

  // Calculate percentages
  const getProgress = (cat: 'Corporate' | 'Documents' | 'Surveillance') => {
    const catItems = items.filter(i => i.category === cat);
    const complete = catItems.filter(i => i.status === 'Complete').length;
    return catItems.length ? Math.round((complete / catItems.length) * 100) : 0;
  };

  const total = items.length;
  const complete = items.filter(i => i.status === 'Complete').length;
  const overallPercent = total ? Math.round((complete / total) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Top Banner & Overall Progress */}
      <div>
        <h1 className="text-2xl font-bold">Operational Readiness Stack</h1>
        <p className="text-sm text-grey-dark mt-1">
          Track the drafting, validation, and engineering audits of LCX USA’s required compliance materials.
        </p>
      </div>

      {/* Progress Dashboard */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {/* Overall Completion card */}
        <Card className="bg-navy text-white border-0 flex flex-col justify-center p-6 text-center">
          <CardBody className="space-y-1">
            <span className="text-4xl font-extrabold">{overallPercent}%</span>
            <h2 className="text-xs uppercase tracking-wider font-semibold text-grey-light">Overall Readiness</h2>
            <p className="text-[10px] text-grey-light/60 mt-2">{complete} of {total} controls verified complete</p>
          </CardBody>
        </Card>

        {/* Category progress cards */}
        {(['Corporate', 'Documents', 'Surveillance'] as const).map(cat => {
          const pct = getProgress(cat);
          const Icon = categoryIcons[cat];
          return (
            <Card key={cat}>
              <CardBody className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="rounded-md bg-ice-soft dark:bg-ice-soft/10 p-2 text-navy dark:text-ice"><Icon size={18} /></div>
                  <h3 className="font-semibold text-sm">{cat}</h3>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Progress</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="w-full bg-ice-soft dark:bg-ice-soft/10 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-navy dark:bg-ice h-1.5 rounded-full transition-all duration-300" style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      {/* Main Checklist Card Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(item => {
          const Icon = categoryIcons[item.category];
          return (
            <Card key={item.id} className="flex flex-col justify-between">
              <CardBody className="space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  {/* Category Badge & Status Dropdown */}
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-semibold tracking-wider uppercase text-grey dark:text-grey-light/70 flex items-center gap-1.5">
                      <Icon size={12} /> {item.category}
                    </span>
                    <select
                      value={item.status}
                      onChange={e => updateStatus(item.id, e.target.value as ReadinessStatus)}
                      className={`text-xs rounded-md border bg-card px-2 py-1 font-semibold outline-none transition-colors ${statusClasses[item.status]}`}
                    >
                      <option value="Not Started">Not Started</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Counsel Review">Counsel Review</option>
                      <option value="Complete">Complete</option>
                    </select>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h4 className="font-bold text-sm text-navy dark:text-ice leading-tight">{item.name}</h4>
                    <p className="text-xs text-grey-dark dark:text-grey-light/80 mt-1">{item.description}</p>
                  </div>
                </div>

                {/* Gating & Notes Box */}
                <div className="space-y-2 pt-2 border-t border-line mt-auto">
                  <p className="text-[10px] text-grey dark:text-grey-light/60">
                    <span className="font-bold uppercase tracking-wider text-[9px] mr-1">Gates Product:</span> {item.gatingFor}
                  </p>
                  <div className="bg-ice-soft dark:bg-ice-soft/10 rounded p-2 text-xs italic text-grey-dark dark:text-grey-light pl-2 border-l border-line">
                    "{item.notes}"
                  </div>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
