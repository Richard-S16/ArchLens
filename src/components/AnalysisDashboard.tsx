"use client";

import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import {
  GitBranch, Star, GitFork, Code2, ArrowLeft, FileCode, Globe,
  Loader2, BrainCircuit, Network,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { IngestionResult } from "@/types/github";
import type { AnalysisResult } from "@/types/analysis";
import { LanguageBar } from "@/components/LanguageBar";
import { FileTree } from "@/components/FileTree";
import { ArchitectureScores } from "@/components/ArchitectureScores";
import { InsightCards } from "@/components/InsightCards";
import { DependencyGraphSummary } from "@/components/DependencyGraphSummary";
import { container, item } from "@/constants/animations";
import { AnalysisLoadingState } from "@/components/AnalysisLoadingState";

const DependencyGraph = dynamic(
  () => import("@/components/DependencyGraph").then((module) => ({ default: module.DependencyGraph })),
  { ssr: false }
);

type Props = {
  result: IngestionResult;
  analysisResult: AnalysisResult | null;
  isAnalyzing: boolean;
  onReset: () => void;
};

export function AnalysisDashboard({ result, analysisResult, isAnalyzing, onReset }: Props) {
  const { meta, tree, languages } = result;

  return (
    <div className="w-full max-w-5xl mx-auto">
      <Button
        variant="ghost"
        size="sm"
        onClick={onReset}
        className="mb-6 text-muted-foreground hover:text-foreground -ml-1"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Analyze another
      </Button>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="mb-8"
      >
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <GitBranch className="w-6 h-6 text-(--al-blue)" />
              {meta.fullName}
            </h2>
            {meta.description && (
              <p className="mt-1.5 text-muted-foreground max-w-xl">{meta.description}</p>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              {meta.topics.slice(0, 8).map((topic) => (
                <Badge key={topic} variant="secondary" className="text-xs font-mono">{topic}</Badge>
              ))}
            </div>
          </div>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><Star className="w-4 h-4 text-yellow-400" />{meta.stars.toLocaleString()}</span>
            <span className="flex items-center gap-1.5"><GitFork className="w-4 h-4" />{meta.forks.toLocaleString()}</span>
            {meta.language && (
              <span className="flex items-center gap-1.5"><Code2 className="w-4 h-4 text-(--al-blue)" />{meta.language}</span>
            )}
            <a
              href={`https://github.com/${meta.fullName}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-(--al-blue) transition-colors"
            >
              <Globe className="w-4 h-4" />GitHub
            </a>
          </div>
        </div>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        <motion.div variants={item} className="md:col-span-2">
          <Card className="bg-(--al-surface) border-border/50 hover:border-(--al-blue)/30 transition-colors h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Languages</CardTitle>
            </CardHeader>
            <CardContent>
              <LanguageBar languages={languages} />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="bg-(--al-surface) border-border/50 hover:border-(--al-blue)/30 transition-colors h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Repository Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "Stars", value: meta.stars.toLocaleString(), icon: Star },
                { label: "Forks", value: meta.forks.toLocaleString(), icon: GitFork },
                { label: "Size", value: `${(meta.size / 1024).toFixed(1)} MB`, icon: FileCode },
                { label: "Default Branch", value: meta.defaultBranch, icon: GitBranch },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Icon className="w-3.5 h-3.5" />{label}
                  </span>
                  <span className="font-mono text-foreground/90">{value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item} className="md:col-span-2 lg:col-span-3">
          <Card className="bg-(--al-surface) border-border/50 hover:border-(--al-blue)/30 transition-colors">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Repository Structure</CardTitle>
            </CardHeader>
            <CardContent>
              <FileTree tree={tree} />
            </CardContent>
          </Card>
        </motion.div>

      </motion.div>

      <AnimatePresence mode="wait">
        {isAnalyzing && !analysisResult && (
          <Card className="mt-4 bg-(--al-surface) border-border/50">
            <CardContent className="py-4">
              <AnalysisLoadingState />
            </CardContent>
          </Card>
        )}

        {analysisResult && (
          <motion.div
            key="analysis"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mt-4 space-y-4"
          >
            <Card className="bg-(--al-surface) border-border/50 hover:border-(--al-blue)/30 transition-colors">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                  <BrainCircuit className="w-3.5 h-3.5 text-(--al-blue)" />
                  Architecture Health Scores
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ArchitectureScores scores={analysisResult.scores} />
              </CardContent>
            </Card>

            <Card className="bg-(--al-surface) border-border/50 hover:border-(--al-blue)/30 transition-colors">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                  <Network className="w-3.5 h-3.5 text-(--al-purple)" />
                  Dependency Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DependencyGraphSummary result={analysisResult} />
              </CardContent>
            </Card>

            <Card className="bg-(--al-surface) border-border/50 hover:border-(--al-blue)/30 transition-colors">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Architectural Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analysisResult.insights.length > 0 ? (
                  <InsightCards insights={analysisResult.insights} />
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 py-4 px-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5"
                  >
                    <div className="w-8 h-8 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0">
                      <Loader2 className="w-4 h-4 text-emerald-400 hidden" />
                      <span className="text-emerald-400 text-base">✓</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-emerald-400">No architecture issues detected</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        This repository follows good architectural practices — well-structured, low coupling, and no circular dependencies.
                      </p>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-(--al-surface) border-border/50 hover:border-(--al-blue)/30 transition-colors">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                  <Network className="w-3.5 h-3.5 text-(--al-blue)" />
                  Interactive Dependency Graph
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 overflow-hidden rounded-b-xl">
                <DependencyGraph result={analysisResult} />
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
