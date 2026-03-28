import { AnalysisResult, ConversationType, EmotionTag, SpeakerAnalysis, ToneLabel } from "@/lib/types";

const POSITIVE_WORDS = [
  "good",
  "great",
  "thanks",
  "thank you",
  "perfect",
  "agreed",
  "done",
  "support",
  "help",
  "clear",
  "win",
  "sahi",
  "accha",
  "achha",
  "badhiya",
  "shukriya",
  "theek",
  "thik",
  "mast",
  "badiya",
  "samajh gaya"
];

const NEGATIVE_WORDS = [
  "issue",
  "problem",
  "drop",
  "confusion",
  "friction",
  "delay",
  "risk",
  "wrong",
  "conflict",
  "fail",
  "galat",
  " dikkat",
  "dikhat",
  "pareshan",
  "tension",
  "gussa",
  "nahi hua",
  "late",
  "ruk gaya",
  "clear nahi"
];

function unique<T>(items: T[]) {
  return Array.from(new Set(items));
}

function splitLines(text: string) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function normalizeWord(word: string) {
  return word.toLowerCase().replace(/[^a-z0-9']/g, "");
}

function pickTone(line: string): ToneLabel {
  const lower = line.toLowerCase();

  if (/(thank|appreciate|help|support|shukriya|thanks yaar|madad)/.test(lower)) return "Supportive";
  if (/(need|must|should|will|let's|lets|deadline|karna hai|karna hoga|chahiye|jaldi)/.test(lower)) return "Assertive";
  if (/(analy|data|because|metric|suggest|lag raha|shayad|numbers|issue kaha)/.test(lower)) return "Analytical";
  if (/(agree|together|we could|good idea|sath|milke|haan sahi|theek hai)/.test(lower)) return "Collaborative";
  if (/(wrong|however|but|no|nahi|galat|aisa nahi)/.test(lower)) return "Defensive";

  return "Neutral";
}

function inferConversationType(text: string): ConversationType {
  const lower = text.toLowerCase();

  if (/(meeting|agenda|follow up|review|call pe|meeting mein)/.test(lower)) return "Meeting";
  if (/(launch|timeline|plan|prototype|next week|kal tak|is week|roadmap)/.test(lower)) return "Planning";
  if (/(feedback|improve|suggestion|kya better ho sakta)/.test(lower)) return "Feedback";
  if (/(support|ticket|customer|client issue|helpdesk)/.test(lower)) return "Support";
  if (/(price|deal|contract|budget|cost|paise|discount)/.test(lower)) return "Negotiation";
  if (/(angry|conflict|argument|upset|ladai|jhagda|tension)/.test(lower)) return "Conflict";

  return "Casual";
}

function inferEmotionTags(text: string, positives: number, negatives: number): EmotionTag[] {
  const lower = text.toLowerCase();
  const tags: EmotionTag[] = [];

  if (/(agree|aligned|perfect|done|haan sahi|theek hai)/.test(lower)) tags.push("Agreement");
  if (/(plan|next|action|review|prototype|kal tak|aaj hi)/.test(lower)) tags.push("Productive");
  if (/(thanks|appreciate|shukriya)/.test(lower)) tags.push("Appreciation");
  if (/(urgent|asap|today|immediately|jaldi|turant)/.test(lower)) tags.push("Urgency");
  if (/(confus|unclear|samajh nahi|clear nahi)/.test(lower)) tags.push("Confusion");
  if (/(resolve|fixed|done|ho gaya|solve ho gaya)/.test(lower)) tags.push("Resolution");
  if (/(conflict|argument|tension|ladai|jhagda)/.test(lower)) tags.push("Conflict");
  if (positives > negatives) tags.push("Collaborative");
  if (negatives > positives) tags.push("Frustration");

  return unique(tags).slice(0, 4).length ? unique(tags).slice(0, 4) : ["Productive"];
}

function buildSpeakerBreakdown(lines: string[]): SpeakerAnalysis[] {
  const speakerMap = new Map<string, { count: number; lines: string[] }>();

  for (const line of lines) {
    const match = line.match(/^([^:]{1,40}):\s*(.+)$/);
    const name = match?.[1]?.trim() || "Speaker A";
    const content = match?.[2]?.trim() || line;
    const current = speakerMap.get(name) ?? { count: 0, lines: [] };
    current.count += 1;
    current.lines.push(content);
    speakerMap.set(name, current);
  }

  return Array.from(speakerMap.entries())
    .map(([name, data]) => ({
      name,
      message_count: data.count,
      tone: pickTone(data.lines.join(" ")),
      key_contribution: (data.lines.sort((a, b) => b.length - a.length)[0] || "Contributed to the discussion.").slice(0, 160)
    }))
    .slice(0, 6);
}

function topTopics(text: string) {
  const counts = new Map<string, number>();
  const stopWords = new Set([
    "this",
    "that",
    "with",
    "from",
    "have",
    "will",
    "your",
    "their",
    "there",
    "could",
    "would",
    "because",
    "need",
    "hai",
    "nahi",
    "karo",
    "karna",
    "wala",
    "kiya",
    "liye"
  ]);

  for (const raw of text.split(/\s+/)) {
    const word = normalizeWord(raw);
    if (word.length < 4 || stopWords.has(word)) continue;
    counts.set(word, (counts.get(word) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word);
}

function actionItemsFromLines(lines: string[]) {
  return unique(
    lines.filter((line) =>
      /(will|should|need to|let's|lets|follow up|review|send|share|draft|build|prepare|karna hai|bhejna|banana|check karna|dekhna)/i.test(
        line
      )
    )
  ).slice(0, 4);
}

export function generateFreeAnalysis(text: string): AnalysisResult {
  const lines = splitLines(text);
  const lower = text.toLowerCase();
  const positiveHits = POSITIVE_WORDS.filter((word) => lower.includes(word)).length;
  const negativeHits = NEGATIVE_WORDS.filter((word) => lower.includes(word)).length;
  const sentimentScore = Math.max(10, Math.min(95, 60 + positiveHits * 6 - negativeHits * 7));
  const sentimentLabel = sentimentScore >= 67 ? "Positive" : sentimentScore <= 44 ? "Negative" : "Neutral";
  const speakers = buildSpeakerBreakdown(lines);
  const actionItems = actionItemsFromLines(lines);
  const topics = topTopics(text);
  const positiveLines = unique(
    lines.filter((line) => /(agree|thanks|done|perfect|support|clear|review|accha|sahi|badhiya|theek hai)/i.test(line)).slice(0, 3)
  );
  const negativeLines = unique(
    lines.filter((line) => /(issue|drop|confusion|wrong|risk|friction|delay|problem|galat|dikhat|pareshan|clear nahi)/i.test(line)).slice(0, 3)
  );

  return {
    summary: `This conversation was analyzed in ConvoLens free mode using local English plus Hindi/Hinglish heuristics instead of a paid AI API. The discussion focused on ${topics.slice(0, 3).join(", ") || "the main topic at hand"}. The overall tone appears ${sentimentLabel.toLowerCase()}, with ${actionItems.length} action-oriented moments identified. ${speakers.length ? `${speakers[0].name} was one of the main contributors.` : "Multiple participants contributed to the exchange."} Use a paid AI model later if you want deeper nuance.`,
    sentiment_score: sentimentScore,
    sentiment_label: sentimentLabel,
    positives: positiveLines.length ? positiveLines : ["The discussion contains collaborative or forward-moving moments."],
    negatives: negativeLines.length ? negativeLines : ["No major negative signals were strongly detected in free mode."],
    key_topics: topics.length ? topics : ["conversation", "discussion", "next steps", "team", "analysis"],
    action_items: actionItems.length ? actionItems : ["Review the conversation and define the next owner manually."],
    notable_quotes: lines.slice(0, 3).map((line) => line.replace(/^([^:]{1,40}):\s*/, "")),
    next_steps: "Review the generated action items and confirm the main decisions manually. If you want higher-quality summaries and speaker nuance later, reconnect a paid AI provider.",
    speakers: speakers.length
      ? speakers
      : [{ name: "Speaker A", message_count: lines.length || 1, tone: "Neutral", key_contribution: "Shared the main points of the conversation." }],
    emotion_tags: inferEmotionTags(text, positiveHits, negativeHits),
    conversation_type: inferConversationType(text)
  };
}
