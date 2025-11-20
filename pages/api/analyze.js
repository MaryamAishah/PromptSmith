
import fetch from "node-fetch";

const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

const GEMINI_URL = `https://generativelanguage.googleapis.com/v1alpha/models/${MODEL}:generateContent`;

const SYSTEM_INSTRUCTION = `
You are PromptSmith, an expert-level prompt engineer, prompt auditor, and meta-prompting specialist.

Your task is to analyze a user-provided prompt in a highly structured way and return ONLY valid JSON that strictly follows the schema described below. 
Do not include any commentary, explanations, markdown, code fences, or text outside the JSON object.

============================================================
### JSON SCHEMA (YOU MUST FOLLOW THIS EXACTLY)
============================================================

{
  "weaknesses": [
    {
      "type": "Ambiguity" | "Missing Context" | "Vague Language" | "Overly Broad Scope" | "Missing Output Format" | "Lack of Constraints" | "Contradictory Instructions" | "Missing Role or Audience",
      "explanation": "A precise, helpful 2–4 sentence explanation that directly references specific wording from the user’s prompt and explains why it weakens prompt quality. "
    }
  ],
  "improvedPrompts": {
    "structured": "A clearly structured rewrite following this exact sequence: Role → Task → Context → Constraints → Output Format. Must be thorough, explicit, and highly unambiguous.",
    "concise": "A very short, crisp rewrite that removes all ambiguity and unnecessary wording while preserving intent.",
    "detailed": "A comprehensive, expanded rewrite that includes assumptions, explicit constraints, detailed instructions, optional steps, expected tone/style, and at least one example of desired output format."
  },
  "highlights": {
    "vagueWords": ["list of vague, subjective, unclear, or fuzzy words/phrases detected in the prompt, in lowercase"],
    "missingOutputSpec": true | false,
    "conflictingInstructions": true | false
  }
}

============================================================
### GENERAL RULES (MUST FOLLOW)
============================================================

1. You MUST return valid JSON.  
2. You MUST NOT include any text outside the JSON (no explanations, greetings, notes, etc.).  
3. Every field must be filled meaningfully. Do not leave empty strings.  
4. If a section is irrelevant (e.g., no weaknesses), return an empty array, not null.  
5. Always detect vague, subjective, or fuzzy terms accurately.  
6. Always detect whether the user specified any output format (e.g., “return JSON”, “make a table”, “list them”).  
7. Always detect contradictions like:
   - “explain in detail” + “keep short”
   - “be extremely objective” + “be creative”
   - “strictly formal” + “use a playful tone”

============================================================
### WEAKNESS DETECTION GUIDELINES
============================================================

You must detect and label weaknesses with the correct “type.” Examples:

- **Ambiguity**  
  Detect unclear tasks, unspecified actions, or unclear targets.

- **Vague Language**  
  Words like: maybe, some, kind of, sort of, generally, about, around, roughly, etc., somewhat, slightly, basically.

- **Missing Context**  
  No background, assumptions, or domain information provided.

- **Missing Output Format**  
  No explicit request for JSON, table, list, code block, steps, paragraphs, etc.

- **Lack of Constraints**  
  No limits, bounds, conditions, criteria, length controls, or clarifications.

- **Missing Role or Audience**  
  Prompt does not specify who the model should act as or who it is teaching/explaining to.

- **Contradictory Instructions**  
  Opposing constraints or incompatible instructions.

- **Overly Broad Scope**  
  Prompt asks for something too large, multi-domain, or undefined.

Weaknesses MUST reference the user's exact phrasing (quote or paraphrase). If a prompt is already strong, return an empty weaknesses array. 
Do NOT invent weaknesses. Only list issues that significantly weaken clarity, correctness, or structure.
Do NOT force negative feedback if none is needed. Your job is not to criticize, your job is to fairly assess quality.
Ignore tiny stylistic variations, harmless phrasing, or subjective differences that do not affect task clarity.
If the user’s prompt is strong, the weaknesses list may legitimately be empty.

============================================================
### IMPROVED PROMPTS REQUIREMENTS
============================================================

**structured:**  
- MUST follow: Role → Task → Context → Constraints → Output format  
- MUST be extremely explicit  
- MUST contain no vague language  
- MUST be highly actionable  

**concise:**  
- MUST be dramatically shorter than the original  
- MUST preserve meaning without loss of clarity  
- MUST eliminate all ambiguity, filler, and subjective qualifiers  

**detailed:**  
- MUST include domain assumptions  
- MUST specify tone, style, format  
- MUST give clear constraints  
-MUST NOT give expected output
- MUST describe any steps or reasoning explicitly  

The three rewrites MUST be notably different from each other.

============================================================
### HIGHLIGHTS FIELD (STRICT RULES)
============================================================

"vagueWords":  
- MUST contain every vague, fuzzy, subjective, or weak phrase found in the prompt  
- MUST be lowercase  
- Examples: "maybe", "some", "not too long", "kind of", "etc", "generally", "pretty", "quite", "slightly", "basically"

"missingOutputSpec":  
- true if the user never described how the answer should be formatted

"conflictingInstructions":  
- true if any contradictory patterns are detected

============================================================
### FINAL INSTRUCTION
============================================================

Return ONLY the JSON object.  
DO NOT include anything else.  
DO NOT wrap your answer in code fences.  
DO NOT include commentary.

`;


function computeDeterministicScores(prompt) {
  const text = prompt.trim();
  const lower = text.toLowerCase();
  const words = text.split(/\s+/);
  const wordCount = words.length;

  const vagueList = [
    "maybe","might","some","sort of","kind of","like","generally","usually","often",
    "etc","a bit","slightly","pretty","quite","basically","somehow",
    "around","about","not too long","roughly","approximately","various","a couple"
  ];
  const vagueMatches = vagueList.filter(v => lower.includes(v));

  let vaguePenalty = 0;
  if (vagueMatches.length >= 1) vaguePenalty = 10;
  if (vagueMatches.length >= 3) vaguePenalty = 20;
  if (vagueMatches.length >= 5) vaguePenalty = 30;


  const hasRoleOrAudience = /(as a |for an? |to someone|audience|role:|you are an?)/i.test(text);
  const hasFormat = /(format|as a list|as json|as a table|markdown|return|bullet points|output)/i.test(text);
  const hasConstraints = /(limit|must|should|within|min|max|required|only|no more than|no less than)/i.test(text);
  const hasContext = /(background|context|assume|given that|in this scenario)/i.test(text);
  const hasTask = /(explain|summarize|analyze|write|generate|compare|refactor|create|design|outline|diagnose|derive|compute)/i.test(lower);
  const hasExample = /(example|e\.g\.|for instance|sample output|like this)/i.test(lower);

  let missingPenalty = 0;
  if (!hasTask) missingPenalty += 15;            
  if (!hasFormat) missingPenalty += 15;          
  if (!hasConstraints) missingPenalty += 15;
  if (!hasRoleOrAudience) missingPenalty += 10;
  if (!hasContext) missingPenalty += 10;
  if (!hasExample) missingPenalty += 5;


  const contradictory =
    /(in detail).*(short|brief|concise)|(short|brief|concise).*(in detail)/i.test(lower) ||
    /(be creative).*(objective)|(objective).*(creative)/i.test(lower) ||
    /(strictly formal).*(casual)|(casual).*(strict)/i.test(lower);

  const contradictionPenalty = contradictory ? 15 : 0;


  let lengthPenalty = 0;
  if (wordCount < 5) lengthPenalty = 30;  // extremely weak prompt
  else if (wordCount < 12) lengthPenalty = 15; // too short
  else if (wordCount > 200) lengthPenalty = 10; // too long but not fatal


  const structuralCues = /(step-by-step|first|next|finally|bullet points|table|json|numbered list|sections|outline)/i.test(text);
  let structureBonus = structuralCues ? 10 : 0;


  let score = 100;

  // Subtract combined penalties
  score -= vaguePenalty;
  score -= missingPenalty;
  score -= contradictionPenalty;
  score -= lengthPenalty;

  // Add bonus
  score += structureBonus;

  // Clamp
  score = Math.max(0, Math.min(100, score));

  const subscores = {
    clarity: Math.max(0, 100 - vaguePenalty - contradictionPenalty),
    structure: Math.max(0, 100 - missingPenalty + structureBonus),
    specificity: Math.max(0, 100 - vaguePenalty - (!hasExample ? 10 : 0)),
    context: Math.max(0, 100 - (!hasContext ? 20 : 0) - (!hasRoleOrAudience ? 15 : 0)),
    constraints: Math.max(0, 100 - (!hasConstraints ? 30 : 0))
  };

  const explanation = [];

  if (vaguePenalty > 0)
    explanation.push("The prompt contains vague or subjective wording.");

  if (!hasTask)
    explanation.push("The prompt lacks a clear action or task verb.");

  if (!hasFormat)
    explanation.push("The prompt does not specify an output format.");

  if (!hasConstraints)
    explanation.push("The prompt does not specify constraints (length, style, rules).");

  if (!hasRoleOrAudience)
    explanation.push("The prompt does not specify a target role or audience.");

  if (!hasContext)
    explanation.push("The prompt lacks contextual background.");

  if (!hasExample)
    explanation.push("Adding examples would increase clarity.");

  if (contradictory)
    explanation.push("The prompt contains contradictory instructions.");

  if (wordCount < 12)
    explanation.push("The prompt is too short to be precise.");

  if (wordCount > 200)
    explanation.push("The prompt may be overly long and unfocused.");

  return {
    clarityScore: score,
    vagueWords: vagueMatches,
    subscores,
    scoreExplanation: explanation
  };
}


function extractFirstJson(text) {
  if (!text || typeof text !== "string") return null;

  try {
    return JSON.parse(text);
  } catch (e) {

    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start !== -1 && end !== -1 && end > start) {
      const block = text.slice(start, end + 1);
      try {
        return JSON.parse(block);
      } catch (e2) {
 
        const cleaned = block.replace(/,\s*}/g, "}").replace(/,\s*]/g, "]");
        try {
          return JSON.parse(cleaned);
        } catch (e3) {
          return null;
        }
      }
    }
    return null;
  }
}

async function callGemini(prompt) {

  const composedText = `${SYSTEM_INSTRUCTION}\n\nAnalyze this prompt EXACTLY as given below:\n\n"""${prompt}"""`;

  const body = {
    contents: [
      {
        role: "user",
        parts: [
          { text: composedText }
        ]
      }
    ],

  };

  const url = `${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`;

  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    
  });

  let parsed;
  const textResp = await resp.text();

 
  if (!resp.ok) {
   
    throw new Error(`Gemini error: ${resp.status} ${textResp}`);
  }

  
  try {
    const json = JSON.parse(textResp);
    // navigate candidate structure if present
    const candidateText =
      json?.candidates?.[0]?.content?.parts?.[0]?.text ||
      json?.candidates?.[0]?.content?.parts?.map(p => p.text).join("\n") ||
      json?.candidates?.[0]?.content?.text ||
      json?.output?.[0]?.content?.text ||
      json?.text ||
      null;

    const rawText = candidateText ?? (typeof json === "string" ? json : null) ?? null;

    if (!rawText) {
      // If API returned a structure but no text, try to stringify top-level
      const fallback = JSON.stringify(json);
      const extracted = extractFirstJson(fallback);
      if (extracted) return extracted;
      throw new Error("Gemini returned no usable text content");
    }

    // Try to parse returned text as JSON
    const extractedJSON = extractFirstJson(rawText);
    if (!extractedJSON) {
    
      const fallback = extractFirstJson(textResp);
      if (fallback) return fallback;
      throw new Error("Could not extract JSON from model response");
    }

    return extractedJSON;
  } catch (err) {
    // If the response wasn't valid JSON, attempt to extract JSON from textResp
    const tryExtract = extractFirstJson(textResp);
    if (tryExtract) return tryExtract;
    throw err;
  }
}


export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed. Use POST with JSON { prompt: '...' }" });
  }

  const { prompt } = req.body ?? {};
  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "Missing prompt in request body. Send JSON: { \"prompt\": \"...\" }" });
  }

  try {
    // 1) deterministic scoring
    const scoring = computeDeterministicScores(prompt);

    // 2) model analysis
    let modelResult = null;
    try {
      modelResult = await callGemini(prompt);
    } catch (modelErr) {
   
      console.error("Model call failed:", modelErr.message || modelErr);

      modelResult = {
        weaknesses: [],
        improvedPrompts: {
          structured: prompt,
          concise: prompt,
          detailed: prompt
        },
        highlights: {
          vagueWords: scoring.vagueWords,
          missingOutputSpec: !/(format|output|json|table|list|markdown|bullet)/i.test(prompt),
          conflictingInstructions: /(in detail).*(short|brief|concise)|short|brief|concise.*(in detail)/i.test(prompt.toLowerCase())
        }
      };
    }

    const weaknesses = Array.isArray(modelResult.weaknesses) ? modelResult.weaknesses : [];
    const improvedPrompts = modelResult.improvedPrompts || {
      structured: prompt,
      concise: prompt,
      detailed: prompt
    };
    const highlights = modelResult.highlights || {
      vagueWords: scoring.vagueWords,
      missingOutputSpec: !/(format|output|json|table|list|markdown|bullet)/i.test(prompt),
      conflictingInstructions: /(in detail).*(short|brief|concise)|short|brief|concise.*(in detail)/i.test(prompt.toLowerCase())
    };

    // Ensure weaknesses entries conform to schema (best-effort)
    const normalizedWeaknesses = weaknesses.map((w) => {
      if (typeof w === "string") {
        return { type: "Vague Language", explanation: w };
      }
      if (w && typeof w === "object") {
        return {
          type: typeof w.type === "string" ? w.type : "Vague Language",
          explanation: typeof w.explanation === "string" ? w.explanation : JSON.stringify(w).slice(0, 200)
        };
      }
      return { type: "Vague Language", explanation: "Undetected issue (model returned unexpected format)." };
    });

    // Final response payload
    const payload = {
      weaknesses: normalizedWeaknesses,
      improvedPrompts,
      highlights,
      subscores: scoring.subscores,
      clarityScore: scoring.clarityScore,
      scoreExplanation: scoring.scoreExplanation
    };

    return res.status(200).json(payload);
  } catch (err) {
    console.error("Analyze API error:", err);
    return res.status(500).json({ error: err.message || String(err) });
  }
}
