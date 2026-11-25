"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { ArrowUpRight, GitBranch } from "lucide-react";
import type { IngestionResult } from "@/types/github";
import type { AnalysisResult } from "@/types/analysis";
import { LanguageBar } from "./LanguageBar";
import { FileTree } from "./FileTree";
import { ArchitectureScores } from "./ArchitectureScores";
import { InsightCards } from "./InsightCards";
import { DependencyGraphSummary } from "./DependencyGraphSummary";
import { AIAnalysisPanel } from "./AIAnalysisPanel";

const DependencyGraph = dynamic(() => import("./DependencyGraph").then((module) => module.DependencyGraph), {
  ssr: false,
  loading: () => <p className="atlas-placeholder" role="status">Opening dependency map…</p>,
});

const sections = ["Dependency map", "Overview", "File tree", "Scores", "Findings", "AI report"] as const;

export function AnalysisDashboard({ result, analysisResult, analysisError }: {
  result: IngestionResult;
  analysisResult: AnalysisResult | null;
  analysisError: string;
}) {
  const { meta, tree, languages } = result;
  const [section, setSection] = useState<(typeof sections)[number]>("Dependency map");
  const pending = <p className="atlas-placeholder" role={analysisError ? "alert" : "status"}>{analysisError || "Analyzing repository structure and dependencies…"}</p>;

  return (
    <div className="atlas-wrap atlas-workspace">
      <div className="atlas-repo">
        <div>
          <h1>{meta.fullName}</h1>
          {meta.description && <p>{meta.description}</p>}
        </div>
        <div className="atlas-repo-meta">
          <span><GitBranch size={15} /> {meta.defaultBranch}</span>
          {meta.language && <span>{meta.language}</span>}
          <a href={`https://github.com/${meta.fullName}`} target="_blank" rel="noopener noreferrer">GitHub <ArrowUpRight size={15} /></a>
        </div>
      </div>
      <nav className="atlas-sections" aria-label="Repository report">
        {sections.map((name) => <button key={name} onClick={() => setSection(name)} aria-pressed={section === name}>{name}</button>)}
      </nav>
      {analysisResult ? (
        <section hidden={section !== "Dependency map"} aria-label="Dependency map">
          <DependencyGraph result={analysisResult} visible={section === "Dependency map"} />
        </section>
      ) : section === "Dependency map" && pending}
      {section === "Overview" && <div className="atlas-report">
        <section>
          <h2>Repository stats</h2>
          <dl className="atlas-facts">
            <div><dt>Stars</dt><dd>{meta.stars.toLocaleString()}</dd></div>
            <div><dt>Forks</dt><dd>{meta.forks.toLocaleString()}</dd></div>
            <div><dt>Size</dt><dd>{(meta.size / 1024).toFixed(1)} MB</dd></div>
            <div><dt>Default branch</dt><dd>{meta.defaultBranch}</dd></div>
          </dl>
          {meta.topics.length > 0 && <p className="atlas-topics">{meta.topics.slice(0, 8).join(" · ")}</p>}
        </section>
        <section><h2>Languages</h2><LanguageBar languages={languages} /></section>
        <section><h2>Dependency analysis</h2>{analysisResult ? <DependencyGraphSummary result={analysisResult} /> : pending}</section>
      </div>}
      {section === "File tree" && <section className="atlas-report"><h2>Repository structure</h2><FileTree tree={tree} /></section>}
      {section === "Scores" && <section className="atlas-report"><h2>Architecture scores</h2>{analysisResult ? <ArchitectureScores scores={analysisResult.scores} /> : pending}</section>}
      {section === "Findings" && <section className="atlas-report"><h2>Architecture findings</h2>{analysisResult ? analysisResult.insights.length > 0 ? <InsightCards insights={analysisResult.insights} /> : <p>No issues were flagged in this analysis.</p> : pending}</section>}
      {section === "AI report" && <section className="atlas-report"><h2>AI report</h2>{analysisResult ? analysisResult.aiAnalysis ? <AIAnalysisPanel aiAnalysis={analysisResult.aiAnalysis} /> : <p>No AI report is available for this analysis.</p> : pending}</section>}
    </div>
  );
}
