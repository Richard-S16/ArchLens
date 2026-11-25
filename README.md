<img width="1134" height="1079" alt="Home" src="https://github.com/user-attachments/assets/98f8c8c0-c717-475e-8c15-c4ae012d11e4" />

# ArchLens

**AI-Powered Repository Architecture Intelligence Platform**

ArchLens transforms any public GitHub repository into an interactive architectural intelligence dashboard. Paste a repository URL and get a cinematic, data-driven breakdown of its structure, dependencies, and health — powered by DeepSeek.

---

## Features

- **Interactive Dependency Graph** — Visualize module relationships, feature boundaries, and dependency flow with a zoomable, pannable graph built on React Flow. Nodes highlight hotspots, circular dependencies, and coupling intensity.
- **Architecture Scores** — Five scored dimensions (Maintainability, Scalability, Coupling, Frontend Performance, Architecture Consistency) rendered as animated gauges.
- **AI Architecture Analysis** — DeepSeek summarizes patterns, identifies anti-patterns, assesses technical debt, and generates prioritized recommendations.
- **Insight Cards** — Contextual insights surface issues like hydration boundary complexity, large rerender propagation risk, and circular dependency chains.
- **Framework & Stack Detection** — Automatically detects framework, architecture pattern, package manager, and full tech stack.
- **File Tree Explorer** — Collapsible file tree with language tagging and hotspot highlighting.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Motion | Framer Motion |
| Visualization | React Flow (`@xyflow/react`) |
| AI | DeepSeek Flash via AI SDK (`@ai-sdk/deepseek`) |
| Schema Validation | Zod |
| UI Components | shadcn/ui |

---

## Getting Started

### Prerequisites

- Node.js 20+
- A [DeepSeek API key](https://platform.deepseek.com/api_keys) (optional; required for AI analysis)
- A [GitHub Personal Access Token](https://github.com/settings/tokens) (public repo read scope is sufficient)

### Installation

```bash
git clone https://github.com/your-username/archlens.git
cd archlens
npm install
```

### Environment Variables

Create a `.env.local` or `.env` file in the project root:

```env
DEEPSEEK_API_KEY=your_deepseek_api_key
GITHUB_TOKEN=your_github_pat
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

---

## Usage

1. Paste any public GitHub repository URL into the input field on the landing page.
2. ArchLens fetches the repository tree and selects the most architecturally significant source files.
3. The analysis pipeline runs: framework detection → dependency graph construction → scoring → insight generation → DeepSeek AI analysis.
4. Explore the interactive dashboard:
   - Navigate the **Dependency Graph** to trace relationships between modules.
   - Review **Architecture Scores** across five health dimensions.
   - Read **AI Recommendations** prioritized by impact and effort.
   - Inspect **Insight Cards** for specific architectural risks.
   - Browse the **File Tree** with hotspot indicators.

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                  # Landing page
│   ├── layout.tsx
│   ├── globals.css
│   └── api/
│       ├── analyze/route.ts      # Main analysis endpoint
│       └── ingest/route.ts       # Repository ingestion endpoint
├── components/
│   ├── AnalysisDashboard.tsx     # Top-level dashboard layout
│   ├── DependencyGraph/          # React Flow graph system
│   ├── AIAnalysisPanel.tsx       # AI output panel
│   ├── ArchitectureScores.tsx    # Score gauges
│   ├── InsightCards.tsx          # Insight card grid
│   ├── FileTree.tsx              # File explorer
│   └── ui/                       # shadcn/ui primitives
├── lib/
│   ├── analyzer.ts               # Core analysis orchestrator
│   ├── aiAnalyzer.ts             # DeepSeek integration
│   ├── graphBuilder.ts           # Dependency graph construction
│   ├── scorer.ts                 # Architecture scoring
│   ├── insightGenerator.ts       # Insight generation
│   ├── detector.ts               # Framework/stack detection
│   ├── parser.ts                 # Import/export parsing
│   ├── classifier.ts             # File classification
│   └── githubClient.ts           # GitHub API client
├── types/                        # TypeScript type definitions
└── constants/                    # Shared constants
```

---

## API

### `POST /api/ingest`

Fetches a repository's file tree and metadata from GitHub.

**Body**
```json
{
  "owner": "vercel",
  "repo": "next.js",
  "branch": "main"
}
```

### `POST /api/analyze`

Runs the full analysis pipeline including AI analysis.

**Body**
```json
{
  "owner": "vercel",
  "repo": "next.js",
  "branch": "main"
}
```

**Response** — `AnalysisResult` containing scores, metadata, dependency graph, insights, and AI analysis.

---

## Architecture Scoring

Scores are computed from static analysis signals across five dimensions:

| Dimension | Signals |
|---|---|
| **Maintainability** | File count, test coverage, type coverage, folder depth |
| **Scalability** | Architectural pattern, modularity, coupling surface |
| **Coupling** | Import fan-in/fan-out, circular dependency count |
| **Frontend Performance** | Bundle splitting, lazy loading signals, render patterns |
| **Architecture Consistency** | Naming conventions, folder structure regularity |

---

## Deployment

The recommended deployment target is [Vercel](https://vercel.com).

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

Set the following environment variables in your Vercel project settings:

```
DEEPSEEK_API_KEY
GITHUB_TOKEN
```

---

## License

MIT
