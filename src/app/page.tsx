import { HeroForm } from "@/components/HeroForm";
import { GridBackground } from "@/components/GridBackground";
import { HeroSection } from "@/components/HeroSection";
import { HowItWorks } from "@/components/HowItWorks";
import { GitBranch } from "lucide-react";
import { FEATURES } from "@/constants/home";

export default function HomePage() {
  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <GridBackground />

      <main
        id="main-content"
        className="relative min-h-screen flex flex-col"
        style={{ zIndex: 1 }}
      >
        <nav
          className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto w-full"
          aria-label="Primary navigation"
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-lg bg-linear-to-br from-(--al-blue) to-(--al-purple) flex items-center justify-center"
              aria-hidden="true"
            >
              <GitBranch className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-foreground tracking-tight text-lg">ArchLens</span>
          </div>
        </nav>

        <section className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center">
          <div className="max-w-3xl mx-auto w-full space-y-6">
            <HeroSection />
            <HeroForm />
          </div>
        </section>

        <HowItWorks />

        <section
          className="px-4 pb-20 max-w-5xl mx-auto w-full"
          aria-labelledby="features-heading"
        >
          <p id="features-heading" className="sr-only">
            Platform features
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map(({ icon: Icon, title, desc }, index) => (
              <div
                key={title}
                className="p-5 rounded-xl border border-border/40 bg-(--al-surface)/60 backdrop-blur-sm hover:border-(--al-blue)/30 hover:bg-(--al-surface-elevated)/80 hover:-translate-y-0.5 transition-all duration-200 group cursor-default"
                style={{ animationDelay: `${index * 0.08}s` }}
              >
                <div
                  className="w-9 h-9 rounded-lg bg-(--al-blue)/10 flex items-center justify-center mb-3 group-hover:bg-(--al-blue)/20 group-hover:scale-110 transition-all duration-200"
                  aria-hidden="true"
                >
                  <Icon className="w-4 h-4 text-(--al-blue)" />
                </div>
                <h3 className="font-semibold text-foreground text-sm mb-1.5">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <footer className="border-t border-border/30 py-6 px-6" role="contentinfo">
          <div className="max-w-6xl mx-auto flex items-center justify-between text-sm text-muted-foreground/50 flex-wrap gap-3">
            <span className="flex items-center gap-2">
              <GitBranch className="w-3 h-3" aria-hidden="true" />
              ArchLens: AI Repository Intelligence Platform
            </span>
          </div>
        </footer>
      </main>
    </>
  );
}

