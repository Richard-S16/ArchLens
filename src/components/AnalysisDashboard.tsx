"use client";

import { motion } from "framer-motion";
import { GitBranch, Star, GitFork, Code2, ArrowLeft, FileCode, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { IngestionResult } from "@/lib/github";
import { LanguageBar } from "@/components/LanguageBar";
import { FileTree } from "@/components/FileTree";

type Props = { result: IngestionResult; onReset: () => void };

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export function AnalysisDashboard({ result, onReset }: Props) {
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
              {meta.topics.slice(0, 8).map((t) => (
                <Badge key={t} variant="secondary" className="text-xs font-mono">{t}</Badge>
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

        <motion.div variants={item} className="md:col-span-2 lg:col-span-3">
          <Card className="bg-linear-to-br from-(--al-blue)/10 to-(--al-purple)/10 border-(--al-blue)/20 hover:border-(--al-blue)/40 transition-colors">
            <CardContent className="py-6 flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="font-semibold text-foreground">Architecture Visualization — Coming in Phase 3</p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Interactive dependency graph, AI architectural analysis & scoring
                </p>
              </div>
              <Badge className="bg-(--al-blue)/20 text-(--al-blue) border-(--al-blue)/30 hover:bg-(--al-blue)/30">
                In Development
              </Badge>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
