"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, GitBranch, ArrowRight, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { repoUrlSchema, parseRepoUrl } from "@/lib/github";
import type { IngestionResult } from "@/types/github";
import type { AnalysisResult } from "@/types/analysis";
import { toast } from "sonner";
import { AnalysisDashboard } from "./AnalysisDashboard";
import { EXAMPLE_REPOS } from "@/constants/heroForm";

export function HeroForm() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<IngestionResult | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const runAnalysis = async (owner: string, repo: string) => {
    setIsAnalyzing(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ owner, repo }),
      });
      const data = await res.json();
      if (!res.ok) {
        console.warn("Analysis failed:", data.error);
        return;
      }
      setAnalysisResult(data as AnalysisResult);
    } catch (err) {
      console.warn("Analysis error:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async (repoUrl: string = url) => {
    const validated = repoUrlSchema.safeParse(repoUrl.trim());
    if (!validated.success) {
      setError(validated.error.issues[0]?.message ?? "Invalid URL");
      inputRef.current?.focus();
      return;
    }
    setError(null);
    setLoading(true);
    setResult(null);
    setAnalysisResult(null);

    try {
      const res = await fetch("/api/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: repoUrl.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Analysis failed");
      }
      const ingested = data as IngestionResult;
      setResult(ingested);

      const { owner, repo } = parseRepoUrl(repoUrl.trim());
      void runAnalysis(owner, repo);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  if (result) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <AnalysisDashboard
          result={result}
          analysisResult={analysisResult}
          isAnalyzing={isAnalyzing}
          onReset={() => {
            setResult(null);
            setAnalysisResult(null);
            setIsAnalyzing(false);
          }}
        />
      </motion.div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.6 }}
        className="relative"
      >
        <div
          className={cn(
            "relative flex items-center rounded-xl border bg-(--al-surface) transition-all duration-300",
            error ? "border-destructive" : "border-border hover:border-(--al-blue)/50 focus-within:border-(--al-blue)",
            "shadow-lg shadow-black/20"
          )}
        >
          <Search className="absolute left-4 w-5 h-5 text-muted-foreground pointer-events-none shrink-0" />
          <Input
            ref={inputRef}
            value={url}
            onChange={(event) => { setUrl(event.target.value); setError(null); }}
            onKeyDown={handleKeyDown}
            placeholder="https://github.com/owner/repository"
            className="border-0 bg-transparent pl-12 pr-4 py-6 text-base placeholder:text-muted-foreground/60 focus-visible:ring-0 focus-visible:ring-offset-0"
            disabled={loading}
            aria-label="GitHub repository URL"
          />
          <Button
            onClick={() => handleSubmit()}
            disabled={loading || !url.trim()}
            className="mr-2 shrink-0 bg-(--al-blue) hover:bg-(--al-blue)/90 text-white px-5"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Analyze <ArrowRight className="ml-2 w-4 h-4" />
              </>
            )}
          </Button>
        </div>

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-2 text-sm text-destructive pl-1"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.8 }}
        className="mt-5 flex flex-wrap gap-2 justify-center"
      >
        <span className="text-xs text-muted-foreground/60 self-center">Try:</span>
        {EXAMPLE_REPOS.map((repo) => {
          const short = repo.replace("https://github.com/", "");
          return (
            <button
              key={repo}
              onClick={() => { setUrl(repo); handleSubmit(repo); }}
              disabled={loading}
              className="text-xs px-3 py-1.5 rounded-full border border-border/50 bg-(--al-surface) hover:border-(--al-blue)/50 hover:bg-(--al-surface-elevated) text-muted-foreground hover:text-foreground transition-all duration-200 font-mono disabled:opacity-50"
            >
              {short}
            </button>
          );
        })}
      </motion.div>

      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-8 overflow-hidden"
          >
            <div className="flex flex-col items-center gap-4 py-6">
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-2 border-(--al-blue)/20 border-t-(--al-blue) animate-spin" />
                <GitBranch className="absolute inset-0 m-auto w-5 h-5 text-(--al-blue)" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm text-foreground/80 font-medium">Analyzing repository…</p>
                <p className="text-xs text-muted-foreground">Fetching structure, languages & metadata</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
