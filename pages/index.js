
import { useState } from "react";

import {
  ExclamationTriangleIcon,
  AdjustmentsHorizontalIcon,
  SparklesIcon,
  ChartBarIcon
} from "@heroicons/react/24/outline";

export default function Home() {
  const [promptText, setPromptText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  async function handleAnalyze(e) {
    e?.preventDefault();
    setError(null);
    setResult(null);

    if (!promptText.trim()) {
      setError("Please enter a prompt to analyze.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: promptText })
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Server error");
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
  <SparklesIcon style={{ width: 30, height: 30, color: "#2563eb" }} />
  <h1 style={styles.title}>PromptSmith </h1>
</div>
<p> Type in your prompt, hit Analyze, and I’ll give you a detailed analysis along with a boosted set of refined prompts. </p>
      
      <form onSubmit={handleAnalyze} style={styles.form}>
        <textarea
          value={promptText}
          placeholder="Enter an LLM prompt to analyze. Indicate the purpose of your prompt (General, Coding, Content Writing, Data Analysis, Roleplay etc.)"
          onChange={(e) => setPromptText(e.target.value)}
          style={styles.textarea}
        />
        <div style={styles.controls}>
          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? "Analyzing..." : "Analyze"}
          </button>
          <button
            type="button"
            onClick={() => {
              setPromptText("");
              setResult(null);
              setError(null);
            }}
            style={{ ...styles.button, marginLeft: 8, background: "#eee", color: "#111" }}
          >
            Clear
          </button>
        </div>
      </form>

      {error && <div style={styles.error}>{error}</div>}

      {result && (
        <div style={styles.result}>
          <div style={styles.scoreCard}>
            <h2 style={styles.sectionTitle}>
  <ChartBarIcon style={{ width: 20, height: 20, marginRight: 6 }} />
  Prompt Clarity Score
</h2>
            <div style={styles.scoreCircle}>
              <div style={styles.scoreNumber}>{result.clarityScore}</div>
              <div style={styles.scoreLabel}>/100</div>
            </div>
            <div style={styles.subscores}>
              <div>Clarity: {result.subscores.clarity}</div>
              <div>Structure: {result.subscores.structure}</div>
              <div>Specificity: {result.subscores.specificity}</div>
              <div>Context: {result.subscores.context}</div>
              <div>Constraints: {result.subscores.constraints}</div>
            </div>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>
  <ExclamationTriangleIcon style={{ width: 20, height: 20, marginRight: 6 }} />
  Detected Weaknesses
</h2>
            {result.weaknesses.length === 0 ? (
              <div style={styles.card}>No major weaknesses detected.</div>
            ) : (
              result.weaknesses.map((w, i) => (
                <div key={i} style={styles.card}>
                  <strong>{w.type}</strong>: {w.explanation}
                </div>
              ))
            )}
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>
  <AdjustmentsHorizontalIcon style={{ width: 20, height: 20, marginRight: 6 }} />
  Improved Prompt Suggestions
</h2>
            {Object.entries(result.improvedPrompts).map(([k, v]) => (
              <div key={k} style={styles.card}>
                <strong style={{ textTransform: "capitalize" }}>{k}</strong>
                <pre style={styles.pre}>{v}</pre>
                <button
                  onClick={() => navigator.clipboard.writeText(v)}
                  style={styles.copyButton}
                >
                  Copy
                </button>
              </div>
            ))}
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>
  <SparklesIcon style={{ width: 20, height: 20, marginRight: 6 }} />
  Highlights
</h2>
            <div style={styles.card}>
              <div>
                <strong>Vague words:</strong> {result.highlights.vagueWords.join(", ") || "—"}
              </div>
              <div>
                <strong>Missing output spec:</strong>{" "}
                {result.highlights.missingOutputSpec ? "Yes" : "No"}
              </div>
              <div>
                <strong>Conflicting instructions:</strong>{" "}
                {result.highlights.conflictingInstructions ? "Yes" : "No"}
              </div>
            </div>
          </div>
        </div>
      )}

      
    </div>
  );
}

const styles = {
  page: { fontFamily: "Inter, sans-serif", padding: 24, maxWidth: 900, margin: "0 auto" },
  title: { fontSize: 26, marginBottom: 12 },
  form: { marginBottom: 20 },
  textarea: { width: "100%", height: 160, padding: 12, fontSize: 14, borderRadius: 8, border: "1px solid #ddd" },
  controls: { marginTop: 8, display: "flex", alignItems: "center" },
  button: { padding: "8px 14px", borderRadius: 8, background: "#2563eb", color: "white", border: "none", cursor: "pointer" },
  error: { marginTop: 12, color: "crimson" },
  result: { marginTop: 18, display: "grid", gridTemplateColumns: "1fr", gap: 14 },
  scoreCard: { padding: 12, borderRadius: 8, border: "1px solid #eee", display: "flex", flexDirection: "column", alignItems: "center" },
  scoreCircle: { display: "flex", alignItems: "baseline", gap: 6, marginTop: 8 },
  scoreNumber: { fontSize: 42, fontWeight: "700" },
  scoreLabel: { opacity: 0.7 },
  subscores: { marginTop: 10, display: "grid", gap: 4, textAlign: "center" },
  section: { padding: 12, borderRadius: 8, border: "1px solid #eee" },
  card: { padding: 8, marginTop: 8, borderRadius: 6, background: "#fafafa" },
  pre: { whiteSpace: "pre-wrap", marginTop: 8, marginBottom: 8 },
  copyButton: { padding: "6px 10px", borderRadius: 6, border: "none", background: "#111", color: "white", cursor: "pointer" },
  footer: { marginTop: 30, color: "#666" }
};
