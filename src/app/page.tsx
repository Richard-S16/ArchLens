import { HeroForm } from "@/components/HeroForm";
import { GridBackground } from "@/components/GridBackground";
import { Badge } from "@/components/ui/badge";
import { GitBranch, Zap, Eye, BrainCircuit } from "lucide-react";

const FEATURES = [
  {
    icon: GitBranch,
    title: "Architecture Mapping",
    desc: "Parse every file, module, and dependency relationship across the full repository tree.",
  },
  {
    icon: Eye,
    title: "Visual Intelligence",
    desc: "Cinematic dependency graphs with GPU-accelerated rendering and immersive interactions.",
  },
  {
    icon: BrainCircuit,
    title: "AI Analysis",
    desc: "Gemini analyzes architectural patterns, anti-patterns, and scalability risks.",
  },
  {
    icon: Zap,
    title: "Instant Scoring",
    desc: "Maintainability, coupling, and performance scores — clear, data-driven, actionable.",
  },
];

export default function HomePage() {
  return (
    <>
      <GridBackground />

      <main className="relative min-h-screen flex flex-col" style={{ zIndex: 1 }}>
        <nav className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto w-full">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-linear-to-br from-(--al-blue) to-(--al-purple) flex items-center justify-center">
              <GitBranch className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-foreground tracking-tight text-lg">ArchLens</span>
          </div>
          <Badge variant="secondary" className="text-xs font-mono border-border/50">
            Phase 2 · Analysis Engine
          </Badge>
        </nav>

        <section className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center">
          <div className="max-w-3xl mx-auto w-full space-y-6">
            <div className="flex justify-center">
              <Badge className="bg-(--al-blue)/15 text-(--al-blue) border-(--al-blue)/25 px-4 py-1 text-xs font-mono tracking-wide">
                AI-POWERED REPOSITORY INTELLIGENCE
              </Badge>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.05]">
              Understand your{" "}
              <span className="bg-linear-to-r from-(--al-blue) to-(--al-purple) bg-clip-text text-transparent">
                architecture
              </span>
              <br />instantly.
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Paste a GitHub URL. ArchLens maps your repository structure,
              visualizes dependencies, and surfaces architectural insights in seconds.
            </p>

            <HeroForm />
          </div>
        </section>

        <section className="px-4 pb-20 max-w-5xl mx-auto w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="p-5 rounded-xl border border-border/40 bg-(--al-surface)/60 backdrop-blur-sm hover:border-(--al-blue)/30 hover:bg-(--al-surface-elevated)/80 transition-all duration-300 group"
              >
                <div className="w-9 h-9 rounded-lg bg-(--al-blue)/10 flex items-center justify-center mb-3 group-hover:bg-(--al-blue)/20 transition-colors">
                  <Icon className="w-4 h-4 text-(--al-blue)" />
                </div>
                <h3 className="font-semibold text-foreground text-sm mb-1.5">{title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <footer className="border-t border-border/30 py-5 px-6">
          <div className="max-w-6xl mx-auto flex items-center justify-between text-xs text-muted-foreground/60">
            <span>ArchLens — AI Repository Intelligence Platform</span>
            <span className="font-mono">v0.2.0 · Phase 2</span>
          </div>
        </footer>
      </main>
    </>
  );
}
