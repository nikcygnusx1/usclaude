import { useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui';
import { Calendar, Info, Clock, AlertCircle } from 'lucide-react';

interface TimelineItem {
  id: string;
  track: string;
  name: string;
  startMonth: number;
  duration: number; // in months
  status: 'Complete' | 'In Progress' | 'Planned';
  description: string;
  dependencies: string[];
  unlocks: string[];
  color: string;
}

const timelineData: TimelineItem[] = [
  // Track 1: Corporate & Structuring
  {
    id: 'corp_de', track: 'Corporate Setup', name: 'Delaware C-Corp Filing', startMonth: 1, duration: 2, status: 'Complete',
    description: 'Establish LCX USA Inc. as the primary U.S. legal entity.',
    dependencies: [], unlocks: ['FinCEN MSB registration'], color: 'bg-green-500/20 text-green-700 border-green-500/30'
  },
  {
    id: 'corp_cco', track: 'Corporate Setup', name: 'U.S.-Resident CCO Hiring', startMonth: 1, duration: 3, status: 'In Progress',
    description: 'Recruit and hire a Chief Compliance Officer physically based in the U.S., a hard gate for MSB and state licensing.',
    dependencies: [], unlocks: ['State MTL submissions', 'FinCEN BSA Program approval'], color: 'bg-amber-500/20 text-amber-700 border-amber-500/30'
  },
  {
    id: 'corp_cfius', track: 'Corporate Setup', name: 'CFIUS Voluntary Filing', startMonth: 3, duration: 4, status: 'Planned',
    description: 'Submit and clear CFIUS review for foreign control (>25% voting rights by parent LCX AG) of U.S. critical infrastructure.',
    dependencies: ['Delaware C-Corp Filing'], unlocks: ['Phase 3 Custodial Exchange'], color: 'bg-blue-500/20 text-blue-700 border-blue-500/30'
  },
  // Track 2: Core Documents
  {
    id: 'doc_tos', track: 'Core Documents', name: 'U.S. ToS & Privacy Drafting', startMonth: 1, duration: 3, status: 'In Progress',
    description: 'Draft U.S.-specific terms of service including class-action waivers and mandatory arbitration covenants, and CCPA/GLBA privacy rules.',
    dependencies: [], unlocks: ['Phase 1 Non-custodial testing'], color: 'bg-amber-500/20 text-amber-700 border-amber-500/30'
  },
  {
    id: 'doc_risk', track: 'Core Documents', name: 'Consumer Disclosures Memo', startMonth: 2, duration: 2, status: 'In Progress',
    description: 'Complete state-mandated consumer risk disclosures (specifically for NY/TX stablecoin/crypto rules).',
    dependencies: [], unlocks: ['Token Listing opinons'], color: 'bg-amber-500/20 text-amber-700 border-amber-500/30'
  },
  // Track 3: Surveillance Stack
  {
    id: 'surv_ofac', track: 'Surveillance Stack', name: 'OFAC Real-Time Screening API', startMonth: 2, duration: 3, status: 'In Progress',
    description: 'Integrate transaction-blocking software to block OFAC SDNs lists in real-time.',
    dependencies: ['Delaware C-Corp Filing'], unlocks: ['Federal MSB Baseline'], color: 'bg-amber-500/20 text-amber-700 border-amber-500/30'
  },
  {
    id: 'surv_travel', track: 'Surveillance Stack', name: 'TRUST Travel Rule Integration', startMonth: 4, duration: 4, status: 'Planned',
    description: 'Integrate securely with the TRUST (Travel Rule Universal Safe Harbor) node network to transmit transactions >= $3,000.',
    dependencies: ['OFAC Real-Time Screening API'], unlocks: ['Phase 2 Custodial launch'], color: 'bg-blue-500/20 text-blue-700 border-blue-500/30'
  },
  // Track 4: Phase 1 States
  {
    id: 'p1_states', track: 'Phase 1 States', name: 'Non-Custodial Launch (CO, MT, UT, NH, NV)', startMonth: 5, duration: 4, status: 'Planned',
    description: 'Launch non-custodial wallet and API spot commodity platform in Phase 1 states. No state MTL required.',
    dependencies: ['U.S. ToS & Privacy Drafting', 'OFAC Real-Time Screening API'], unlocks: ['U.S. Market Entry traction'], color: 'bg-blue-500/20 text-blue-700 border-blue-500/30'
  },
  // Track 5: Phase 2 States
  {
    id: 'p2_states', track: 'Phase 2 States', name: 'Fiat Ramps & Custody (IL, PA, WA)', startMonth: 9, duration: 6, status: 'Planned',
    description: 'Obtain state money transmitter licenses and launch custodial fiat on/off ramps.',
    dependencies: ['U.S.-Resident CCO Hiring', 'TRUST Travel Rule Integration'], unlocks: ['Phase 2 Custodial trading'], color: 'bg-blue-500/20 text-blue-700 border-blue-500/30'
  },
  {
    id: 'p2_wy_spdi', track: 'Phase 2 States', name: 'Wyoming SPDI Bank Charter', startMonth: 8, duration: 8, status: 'Planned',
    description: 'Apply for and stand up a Special Purpose Depository Institution (SPDI) trust bank charter in Wyoming to provide qualified custody.',
    dependencies: ['Delaware C-Corp Filing', 'U.S.-Resident CCO Hiring'], unlocks: ['Omnibus Qualified Custody'], color: 'bg-blue-500/20 text-blue-700 border-blue-500/30'
  },
  // Track 6: Phase 3 States
  {
    id: 'p3_states', track: 'Phase 3 States', name: 'Full Retail Exchange (NY, CA, FL, MA)', startMonth: 15, duration: 9, status: 'Planned',
    description: 'Obtain NYDFS BitLicense, CA DFAL registration, and FL MTL to support a full-service omnibus custodial exchange.',
    dependencies: ['CFIUS Voluntary Filing', 'Wyoming SPDI Bank Charter', 'p2_states'], unlocks: ['Nationwide U.S. exchange coverage'], color: 'bg-blue-500/20 text-blue-700 border-blue-500/30'
  }
];

export function Roadmap() {
  const [selectedTask, setSelectedTask] = useState<TimelineItem | null>(timelineData[1]);

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold">U.S. Launch Gantt Roadmap</h1>
        <p className="text-sm text-grey-dark mt-1">
          Chronological tracks and task dependencies mapping the 24-month regulatory path to a full U.S. launch.
        </p>
      </div>

      {/* Main Roadmap & Detail Panel */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        {/* Gantt Timeline (Left/Center) */}
        <div className="lg:col-span-3 space-y-3">
          <Card className="overflow-x-auto">
            <CardBody className="p-4 min-w-[700px]">
              {/* Gantt Header Timeline months */}
              <div
                style={{ display: 'grid', gridTemplateColumns: 'repeat(25, minmax(0, 1fr))' }}
                className="border-b border-line pb-2 mb-3 text-[10px] font-bold uppercase tracking-wider text-grey-dark dark:text-grey-light text-center"
              >
                <div className="col-span-5 text-left pl-2">Compliance Track</div>
                {Array.from({ length: 20 }, (_, i) => (
                  <div key={i} className="col-span-1 border-l border-line/60">
                    M{i + 1}
                  </div>
                ))}
              </div>

              {/* Rows */}
              <div className="space-y-4">
                {timelineData.map(item => {
                  const startCol = item.startMonth + 5;
                  const endCol = startCol + item.duration;
                  return (
                    <div
                      key={item.id}
                      style={{ display: 'grid', gridTemplateColumns: 'repeat(25, minmax(0, 1fr))' }}
                      className="items-center relative group min-h-8"
                    >
                      {/* Track name & Task label */}
                      <div className="col-span-5 text-left text-xs font-semibold pr-2 leading-tight text-navy dark:text-ice">
                        <div className="text-[9px] text-grey uppercase tracking-wider">{item.track}</div>
                        <div>{item.name}</div>
                      </div>

                      {/* Timeline Bar block */}
                      <button
                        onClick={() => setSelectedTask(item)}
                        className={`col-span-20 border rounded-md h-7 select-none text-left pl-2.5 flex items-center justify-between text-[10px] font-bold transition-all relative ${
                          selectedTask?.id === item.id ? 'ring-2 ring-navy dark:ring-ice z-10 scale-[1.01]' : 'hover:scale-[1.005]'
                        } ${item.color}`}
                        style={{
                          gridColumnStart: startCol,
                          gridColumnEnd: endCol,
                        }}
                      >
                        <span className="truncate pr-1">{item.name}</span>
                        <span className="text-[9px] pr-2 shrink-0">{item.duration}M</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Milestone Detail Inspector (Right) */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="border-b border-line px-4 py-3 font-semibold flex items-center gap-2">
              <Calendar size={18} className="text-navy dark:text-ice" /> Milestone Inspector
            </CardHeader>
            <CardBody className="p-4 space-y-4">
              {selectedTask ? (
                <div className="space-y-3 text-sm text-navy dark:text-ice">
                  <div>
                    <h3 className="font-bold text-base leading-tight">{selectedTask.name}</h3>
                    <span className="text-[10px] uppercase tracking-wider text-grey font-semibold">{selectedTask.track}</span>
                  </div>

                  <p className="text-xs text-grey-dark dark:text-grey-light leading-relaxed">
                    {selectedTask.description}
                  </p>

                  <div className="flex items-center gap-4 text-xs font-medium border-t border-b border-line py-2.5 my-2">
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} className="text-grey" />
                      <span>Duration: {selectedTask.duration} Months</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="inline-block w-2.5 h-2.5 rounded-full border border-black/10 bg-current text-current opacity-70" />
                      <span className="font-bold uppercase tracking-wider text-[9px]">{selectedTask.status}</span>
                    </div>
                  </div>

                  {/* Dependencies */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-grey mb-1.5 flex items-center gap-1">
                      <AlertCircle size={12} /> Dependencies
                    </h4>
                    {selectedTask.dependencies.length === 0 ? (
                      <span className="text-xs text-green-600 dark:text-green-400 italic">None (Immediate Start)</span>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {selectedTask.dependencies.map((dep, idx) => (
                          <span key={idx} className="text-[10px] bg-ice-soft dark:bg-ice-soft/10 border border-line rounded px-2 py-0.5 font-medium">
                            {dep}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Unlocks */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-grey mb-1.5 flex items-center gap-1">
                      <Info size={12} /> Target Unlocks
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedTask.unlocks.map((unl, idx) => (
                        <span key={idx} className="text-[10px] bg-status-ready/15 border border-status-ready/20 text-status-ready rounded px-2 py-0.5 font-bold">
                          {unl}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-xs text-grey italic flex flex-col items-center gap-2">
                  <Info size={24} className="text-grey-light" />
                  Select a milestone bar on the Gantt chart to inspect timeline details.
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
