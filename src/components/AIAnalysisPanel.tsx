import type { AIAnalysis } from "@/types/analysis";

const assessment = {
  excellent: "Excellent architecture",
  good: "Good architecture",
  "needs-work": "Needs improvement",
  critical: "Critical issues",
};

export function AIAnalysisPanel({ aiAnalysis }: { aiAnalysis: AIAnalysis }) {
  return <div className="space-y-5 text-sm">
    <section>
      <h3 className="font-semibold">{assessment[aiAnalysis.overallAssessment]}</h3>
      <p className="mt-2 text-muted-foreground">{aiAnalysis.architectureSummary}</p>
    </section>
    <section className="border-t pt-4">
      <h3 className="font-semibold">Technical debt</h3>
      <p className="mt-2 text-muted-foreground">{aiAnalysis.technicalDebtAssessment}</p>
    </section>
    <div className="grid gap-5 border-t pt-4 sm:grid-cols-2">
      {[
        { title: "Strengths", entries: aiAnalysis.keyStrengths },
        { title: "Critical risks", entries: aiAnalysis.criticalRisks },
      ].map(({ title, entries }) => <section key={title}>
        <h3 className="font-semibold">{title}</h3>
        {entries.length ? <ul className="mt-2 list-disc space-y-1 pl-4 text-muted-foreground">{entries.map((entry, index) => <li key={index}>{entry}</li>)}</ul> : <p className="mt-2 text-muted-foreground">None listed.</p>}
      </section>)}
    </div>
    {aiAnalysis.recommendations.length > 0 && <section className="border-t pt-4">
      <h3 className="font-semibold">Recommendations ({aiAnalysis.recommendations.length})</h3>
      <ol className="mt-2 list-decimal divide-y pl-5">
        {aiAnalysis.recommendations.map((rec) => <li key={rec.id} className="py-3 pl-1">
          <h4 className="font-medium">{rec.title}</h4>
          <p className="mt-1 text-muted-foreground">{rec.rationale}</p>
          <p className="mt-1 text-muted-foreground">Priority: {rec.priority} · Effort: {rec.effort} · Impact: {rec.impact}</p>
        </li>)}
      </ol>
    </section>}
  </div>;
}
