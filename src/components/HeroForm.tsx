"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, GitBranch } from "lucide-react";
import { repoUrlSchema, parseRepoUrl } from "@/lib/github";
import type { IngestionResult } from "@/types/github";
import type { AnalysisResult } from "@/types/analysis";
import { AnalysisDashboard } from "./AnalysisDashboard";
import { EXAMPLE_REPOS } from "@/constants/heroForm";

function MapExample() {
  return (
    <figure className="atlas-example">
      <figcaption><span><GitBranch size={16} /> relay-labs/relay</span><span>Example map</span></figcaption>
      <svg viewBox="0 0 540 300" role="img" aria-label="Example dependency map: API and worker entry points use a shared dispatch module, which imports the queue and store adapters">
        <path d="M180 0v300M360 0v300M0 42h540" stroke="#cfd5cb" />
        <g className="atlas-demo-labels" textAnchor="middle">
          <text x="90" y="26">A · Entry points</text><text x="270" y="26">B · Core</text><text x="450" y="26">C · Adapters</text>
        </g>
        <path d="M148 110h42v56h22M148 222h42v-56h22" fill="none" stroke="#86491c" strokeWidth="2" strokeDasharray="5 3" />
        <path d="M328 166h42v-56h22m-22 56v56h22" fill="none" stroke="#235a45" strokeWidth="2" />
        {[
          [90, 110, "index.ts"], [90, 222, "jobs.ts"], [270, 166, "dispatch.ts"], [450, 110, "queue.ts"], [450, 222, "store.ts"],
        ].map(([x, y, label]) => (
          <g key={label} transform={`translate(${x} ${y})`} textAnchor="middle">
            <rect x="-58" y="-18" width="116" height="36" rx="4" fill={label === "dispatch.ts" ? "#235a45" : "#fdfdf9"} stroke={label === "dispatch.ts" ? "#235a45" : "#a6b2a5"} />
            <text y="5" fill={label === "dispatch.ts" ? "#fff" : "#232923"}>{label}</text>
          </g>
        ))}
      </svg>
      <div className="atlas-trace-key"><span>Imports</span><span>Imported by</span></div>
    </figure>
  );
}

export function HeroForm() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<IngestionResult | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [analysisError, setAnalysisError] = useState("");
  const [error, setError] = useState("");
  const request = useRef<AbortController | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const main = useRef<HTMLElement>(null);

  useEffect(() => () => request.current?.abort(), []);

  async function analyze(value: string) {
    if (loading) return;
    const trimmed = value.trim();
    const validated = repoUrlSchema.safeParse(trimmed);
    if (!validated.success) {
      setError(validated.error.issues[0]?.message ?? "Enter a public GitHub repository URL.");
      input.current?.focus();
      return;
    }

    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    const send = (endpoint: string, body: object) => fetch(`/api/${endpoint}`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body), signal: controller.signal,
    });
    setUrl(trimmed);
    setLoading(true);
    setError("");
    setAnalysisError("");
    setAnalysis(null);

    try {
      const response = await send("ingest", { url: trimmed });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not read the repository.");
      if (controller.signal.aborted) return;
      setResult(data as IngestionResult);
      setLoading(false);
      main.current?.focus();
      window.scrollTo({ top: 0, behavior: "instant" });

      try {
        const analyzed = await send("analyze", parseRepoUrl(trimmed));
        const report = await analyzed.json();
        if (!analyzed.ok) throw new Error(report.error ?? "Could not finish the analysis.");
        if (!controller.signal.aborted) setAnalysis(report as AnalysisResult);
      } catch {
        if (!controller.signal.aborted) setAnalysisError("The dependency analysis couldn’t finish. Repository details are still available. Try analyzing the repository again.");
      }
    } catch (cause) {
      if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : "Could not read the repository.");
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }

  function reset() {
    request.current?.abort();
    setResult(null);
    setAnalysis(null);
    setAnalysisError("");
    setLoading(false);
    main.current?.focus();
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  return (
    <div className="atlas-app">
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <header className="atlas-header">
        <div className="atlas-wrap">
          <span className="atlas-wordmark">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true"><path d="M3 3h7v7H8v6h6v-2h7v7h-7v-2H5v-9H3z" /></svg>
            ArchLens
          </span>
          {result && <button className="atlas-header-button" onClick={reset}>Analyze another repo</button>}
        </div>
      </header>
      <main id="main-content" ref={main} tabIndex={-1}>
        {result ? <AnalysisDashboard result={result} analysisResult={analysis} analysisError={analysisError} /> : (
          <>
            <section className="atlas-wrap atlas-entry" aria-labelledby="atlas-title">
              <div>
                <h1 id="atlas-title">Map a GitHub repository</h1>
                <p>See how files and modules fit together before you open the code.</p>
                <form onSubmit={(event) => { event.preventDefault(); void analyze(url); }}>
                  <label htmlFor="repo-url">Public GitHub repository URL</label>
                  <div className="atlas-form-row">
                    <input id="repo-url" ref={input} type="url" value={url} onChange={(event) => { setUrl(event.target.value); setError(""); }} placeholder="https://github.com/owner/repository" disabled={loading} aria-invalid={!!error} aria-describedby={error ? "repo-error" : undefined} />
                    <button className="atlas-primary" disabled={loading || !url.trim()}>Analyze repo <ArrowRight size={16} /></button>
                  </div>
                  {error && <p id="repo-error" className="atlas-error" role="alert">{error}</p>}
                </form>
                <div className="atlas-examples"><span>Try a repository</span>{EXAMPLE_REPOS.map((repo) => <button key={repo} disabled={loading} onClick={() => void analyze(repo)}>{repo.replace("https://github.com/", "")}</button>)}</div>
                {loading && <p className="atlas-status" role="status">Reading repository from GitHub…</p>}
              </div>
              <MapExample />
            </section>
            <section className="atlas-wrap atlas-guide" aria-labelledby="atlas-guide-title">
              <h2 id="atlas-guide-title">How it works</h2>
              <ol>
                <li><strong>Open a public repo</strong><span>Paste its GitHub URL or choose an example.</span></li>
                <li><strong>Read the map</strong><span>Select a file to follow its imports and spot cycles or hotspots.</span></li>
                <li><strong>Review the findings</strong><span>Check the file tree, scores, and AI report when available.</span></li>
              </ol>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
