# LCX USA OS — Regulatory Cockpit & Launch Modeler

An enterprise-grade, data-dense Governance, Risk, and Compliance (GRC) simulation engine and launch control cockpit designed for cryptocurrency spot exchanges, custody providers, and digital commodity operators.

---

## 🚀 Key Modules & Features

### 📊 1. Launch Control Cockpit (Dashboard)
- **Split-Screen Design**: Real-time GRC dashboard showing active state compliance maps, dynamic statistics cards, and simulated regulatory logs.
- **Dynamic Blocker Indicators**: Scans triggered compliance gates in real-time, calculating resolved and blocked requirements dynamically based on legislative policy overrides.
- **WORM Audit Trail**: Renders a terminal console stream linked directly to a write-once-read-many (WORM) equivalent cryptographic audit store, tracking all user operations.

### 🗺️ 2. Cartogram Operations Room (State Map)
- **Interactive USA Map**: Custom hairlined state borders filled dynamically based on licensing friction levels (Emerald = Ready, Amber = Conditional, Crimson = Blocked, Faint Slate = Unresearched).
- **Legislation Overrides**: Automatically resolves Money Transmitter License (MTL) blocks under active federal sandboxes (`clarityEnacted`) or New York BitLicense blocks under trust reciprocity (`spdiEquivalence`).
- **State Inspector Drawer**: Interactive side panels showing minimum net worths, surety bonds, regulators, and sandbox exemptions.

### 🔗 3. Product & Asset Registry (Product Matrix)
- **Forensic Ledger**: Lists listed tokens and wallet platforms with inline securities risk progression meters.
- **Safe Harbor Adjustments**: Automatically applies a 25% Howey test risk discount when the `commodityExempt` safe harbor is active, complete with compliance badges.
- **Expanded Drawer Analysis**: Access granular prong-by-prong Supreme Court Howey analysis, required gating controls, and registry dependencies.

### 📄 4. Executive Memo & Brief Publisher (Brief Generator)
- **Metadata Controllers**: Left sidebar controls to bulk-select states, override memorandum header details (To, From, Subject, Date), toggle watermarks, and configure signatories.
- **Inline Rich-Text Editing**: Direct A4 sheet previews with `contentEditable` headings and summaries, allowing CCOs to customize legal briefs before exporting.
- **Calculated Ledgers**: Dynamic tables displaying state-by-state net worth ceilings, surety bond escrows, fees, and timelines factoring in preemption rules.
- **Verified Annexes**: Appends dynamic PKCS#7 certification stamps and a chronological annex of the latest 10 session logs with SHA-256 equivalent cryptographic digests.

### ⚖️ 5. Chronos Gantt Timeline (Launch Roadmap)
- **Interactive Tracing**: Displays chronological milestone tracks with hovered SVG dependency curve vectors.
- **Preemption Accelerators**: Automatically compresses DFS review durations from 8 months to 2 months under SPDI trust charters, and marks MTL wave 1 application tasks as `[PREEMPTED]` under the CLARITY Act.

### ⚖️ 6. Securities Forensic Analyzer (Howey Calculator)
- **Checklist Models**: Multi-factor checklists matching the 4 prongs of the Howey Test.
- **Dynamic Needle Gauge**: Displays modeled securities risk thresholds alongside active safe harbor preemption discounts.

---

## ⚙️ Core Architecture

```
+-----------------------------------------------------------------+
|                         React & Vite                            |
|                                                                 |
|   [ Pages / Modules ] <=========> [ Zustand Global Stores ]     |
|   - Dashboard                     - useFilterStore              |
|   - ProductMatrix                 - useAuditStore               |
|   - StateMap                                                    |
|   - BriefGenerator                       |                      |
|   - OntologyExplorer                     v                      |
|                                  [ LocalPersistence ]           |
+-----------------------------------------------------------------+
```

- **State Layer**: Managed via [Zustand](https://github.com/pmndrs/zustand) persistent stores, bridging state-by-state rules and product classification criteria in lockstep.
- **Graph Visualization**: Leverages [ReactFlow](https://reactflow.dev/) and [Dagre](https://github.com/dagrejs/dagre) layout engines inside `useGraph.ts` to compute coordinate layouts dynamically.
- **Theme Engine**: Synchronous blocking script placed in the document head to guarantee instant dark-theme rendering without visual flashes (FOUC).

---

## 📦 Getting Started

### Prerequisites
- Node.js version 18.x or 20.x or 22.x
- npm version 9.x or higher

### Installation
Install dependencies utilizing the configured `.npmrc` peer dependency bypass:
```bash
npm install
```

### Local Development
Start the local Vite development server:
```bash
npm run dev
```

### Run Tests
Execute the unit testing suites:
```bash
npm run test
```

### Compile Production Build
Compile and bundle files for deployment:
```bash
npm run build
```
