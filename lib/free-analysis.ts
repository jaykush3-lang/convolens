import { AnalysisResult, ConversationType, EmotionTag, SpeakerAnalysis, SpeakerIntentInsight, ToneLabel } from "@/lib/types";

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

function splitSentences(text: string) {
  return text
    .split(/(?<=[.!?])\s+|\n+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function cleanSpeakerName(name: string) {
  return name
    .replace(/^screenshot\s*:\s*/i, "")
    .replace(/[|()[\]{}]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 32);
}

function isLikelySpeakerName(value: string) {
  const cleaned = cleanSpeakerName(value);
  if (!cleaned) return false;
  if (cleaned.length > 28) return false;
  if (/^\d+$/.test(cleaned)) return false;
  if (/\b(message|screenshot|image|chat|conversation)\b/i.test(cleaned)) return false;
  return /^[A-Za-z][A-Za-z0-9 ._-]{0,27}$/.test(cleaned);
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

function parseConversationTurns(text: string) {
  const lines = splitLines(text);
  const turns: Array<{ speaker: string; content: string }> = [];

  for (const line of lines) {
    const directMatch = line.match(/^([^:\n]{1,32})\s*:\s*(.+)$/);
    if (directMatch && isLikelySpeakerName(directMatch[1])) {
      turns.push({
        speaker: cleanSpeakerName(directMatch[1]),
        content: directMatch[2].trim()
      });
      continue;
    }

    const dashMatch = line.match(/^([^-\n]{1,32})\s*-\s*(.+)$/);
    if (dashMatch && isLikelySpeakerName(dashMatch[1])) {
      turns.push({
        speaker: cleanSpeakerName(dashMatch[1]),
        content: dashMatch[2].trim()
      });
      continue;
    }
  }

  if (turns.length >= 2) {
    return turns;
  }

  const sentences = splitSentences(text);
  const inferredTurns: Array<{ speaker: string; content: string }> = [];
  let speakerIndex = 0;

  for (const sentence of sentences) {
    if (sentence.length < 8) continue;
    inferredTurns.push({
      speaker: speakerIndex % 2 === 0 ? "Speaker A" : "Speaker B",
      content: sentence
    });
    speakerIndex += 1;
  }

  return inferredTurns.length ? inferredTurns : [{ speaker: "Speaker A", content: text.trim() }];
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

function buildSpeakerBreakdown(turns: Array<{ speaker: string; content: string }>): SpeakerAnalysis[] {
  const speakerMap = new Map<string, { count: number; lines: string[] }>();

  for (const turn of turns) {
    const name = turn.speaker || "Speaker A";
    const content = turn.content || "";
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

function inferConversationClarity(text: string, speakers: SpeakerAnalysis[], actionItems: string[]) {
  const lower = text.toLowerCase();
  const confusionSignals = [
    "confusion",
    "unclear",
    "samajh nahi",
    "clear nahi",
    "not clear",
    "issue",
    "problem"
  ].filter((signal) => lower.includes(signal)).length;
  const structureSignals = actionItems.length + (speakers.length > 1 ? 1 : 0) + (/(next|review|done|share|send|karna hai|theek hai)/.test(lower) ? 1 : 0);

  if (structureSignals >= 3 && confusionSignals === 0) {
    return "The conversation is fairly clear. Multiple speakers are identifiable, ownership is visible, and the discussion moves toward specific next steps.";
  }

  if (confusionSignals >= 2) {
    return "The conversation has mixed clarity. The main topic can be understood, but parts of the language suggest confusion, missing context, or weak structure between speakers.";
  }

  return "The conversation is understandable but could be clearer. Some intent and next steps are visible, though the structure would improve with more explicit speaker turns and decisions.";
}

function inferCommunicationImprovements(text: string, speakers: SpeakerAnalysis[], actionItems: string[]) {
  const lower = text.toLowerCase();
  const improvements: string[] = [];

  if (speakers.some((speaker) => /^Speaker [A-Z]$/.test(speaker.name))) {
    improvements.push("Label speakers more clearly so the analysis can identify who is talking without guessing.");
  }
  if (/(confusion|unclear|samajh nahi|clear nahi)/.test(lower)) {
    improvements.push("Clarify the unclear part directly and restate the decision in simple language.");
  }
  if (actionItems.length < 2) {
    improvements.push("Add explicit action items with owner and timing so the conversation ends with clear next steps.");
  }
  if (!/(today|tomorrow|monday|tuesday|week|kal|aaj|deadline)/.test(lower)) {
    improvements.push("Mention timing or deadlines so the follow-up feels more concrete.");
  }
  if (!/(because|reason|metric|data|kyunki|isliye|lag raha)/.test(lower)) {
    improvements.push("Explain the reasoning behind requests so intent and decision drivers are easier to understand.");
  }

  return unique(improvements).slice(0, 4).length
    ? unique(improvements).slice(0, 4)
    : ["Keep speaker labels, decisions, and next steps explicit so the conversation stays easy to follow."];
}

function inferIntentSummary(text: string, conversationType: ConversationType) {
  const lower = text.toLowerCase();

  if (/(client|customer|support|ticket)/.test(lower)) {
    return "The conversation is mainly trying to reduce friction for a user or customer while protecting trust. Beneath the words, the speakers want quick resolution without losing confidence or goodwill.";
  }

  if (conversationType === "Planning" || /(launch|prototype|deadline|kal tak|next week)/.test(lower)) {
    return "The speakers are not only discussing tasks, they are trying to lower execution risk and create clarity on ownership. The meaning behind the words is a push for speed without confusion.";
  }

  if (/(feedback|improve|better|performance)/.test(lower)) {
    return "This conversation is trying to balance honesty with improvement. Beneath the language, the intent is to correct direction while preserving motivation and trust.";
  }

  return "The speakers are trying to create alignment, reduce uncertainty, and move toward a practical next step. Beyond the literal wording, the conversation is about gaining clarity and commitment.";
}

function inferHiddenConcerns(text: string) {
  const lower = text.toLowerCase();
  const concerns: string[] = [];

  if (/(drop|abandon|lose|users|customer)/.test(lower)) concerns.push("Loss of users, customer trust, or conversion.");
  if (/(delay|late|deadline|kal tak|urgent|jaldi)/.test(lower)) concerns.push("Time pressure and fear of missing deadlines.");
  if (/(confus|unclear|samajh nahi|clear nahi)/.test(lower)) concerns.push("Confusion is blocking decisions or execution.");
  if (/(permission|access|trust|calendar)/.test(lower)) concerns.push("Requesting trust too early may create resistance.");
  if (/(cost|budget|price|paise)/.test(lower)) concerns.push("Financial pressure is shaping the discussion.");

  return concerns.length ? unique(concerns).slice(0, 3) : ["The group wants clarity before committing to the next step."];
}

function inferDecisionDrivers(text: string) {
  const lower = text.toLowerCase();
  const drivers: string[] = [];

  if (/(data|metric|rate|number|analysis)/.test(lower)) drivers.push("Data and measurable outcomes.");
  if (/(customer|support|client|ticket)/.test(lower)) drivers.push("Customer experience and trust.");
  if (/(today|urgent|deadline|jaldi|kal tak)/.test(lower)) drivers.push("Speed and delivery urgency.");
  if (/(team|owner|share|review)/.test(lower)) drivers.push("Clear ownership and team coordination.");
  if (/(risk|wrong|confusion|friction)/.test(lower)) drivers.push("Reducing risk, friction, and uncertainty.");

  return drivers.length ? unique(drivers).slice(0, 4) : ["Momentum, alignment, and practical next steps."];
}

function inferSpeakerIntentions(turns: Array<{ speaker: string; content: string }>, speakers: SpeakerAnalysis[]): SpeakerIntentInsight[] {
  return speakers.map((speaker) => {
    const relevant = turns.filter((turn) => turn.speaker.toLowerCase() === speaker.name.toLowerCase());
    const joined = relevant.map((turn) => turn.content).join(" ").toLowerCase();

    const statedGoal =
      /(will|i'll|i will|main|bhej|draft|prepare|review|share|ready)/.test(joined)
        ? "Wants to move the conversation toward a concrete next action."
        : /(need|should|chahiye|karna hai)/.test(joined)
          ? "Wants a specific change or decision to happen."
          : "Wants alignment on the discussion.";

    const likelyIntent =
      speaker.tone === "Analytical"
        ? "Trying to reduce ambiguity and influence the decision using evidence."
        : speaker.tone === "Assertive"
          ? "Trying to create momentum, ownership, or urgency."
          : speaker.tone === "Supportive"
            ? "Trying to protect trust, morale, or collaboration."
            : speaker.tone === "Defensive"
              ? "Trying to avoid blame or push back on a risk."
              : "Trying to keep the conversation stable and constructive.";

    const hiddenConcern =
      /(confus|samajh nahi|issue|risk|drop|delay|urgent|jaldi)/.test(joined)
        ? "Concerned that confusion or risk will hurt the outcome."
        : /(trust|permission|client|customer|support)/.test(joined)
          ? "Concerned about user trust and response quality."
          : "Concerned about keeping the discussion aligned and productive.";

    return {
      name: speaker.name,
      stated_goal: statedGoal,
      likely_intent: likelyIntent,
      hidden_concern: hiddenConcern
    };
  });
}

export function generateFreeAnalysis(text: string): AnalysisResult {
  const lines = splitLines(text);
  const turns = parseConversationTurns(text);
  const lower = text.toLowerCase();
  const positiveHits = POSITIVE_WORDS.filter((word) => lower.includes(word)).length;
  const negativeHits = NEGATIVE_WORDS.filter((word) => lower.includes(word)).length;
  const sentimentScore = Math.max(10, Math.min(95, 60 + positiveHits * 6 - negativeHits * 7));
  const sentimentLabel = sentimentScore >= 67 ? "Positive" : sentimentScore <= 44 ? "Negative" : "Neutral";
  const speakers = buildSpeakerBreakdown(turns);
  const actionItems = actionItemsFromLines(lines);
  const topics = topTopics(text);
  const conversationType = inferConversationType(text);
  const conversationClarity = inferConversationClarity(text, speakers, actionItems);
  const communicationImprovements = inferCommunicationImprovements(text, speakers, actionItems);
  const positiveLines = unique(
    lines.filter((line) => /(agree|thanks|done|perfect|support|clear|review|accha|sahi|badhiya|theek hai)/i.test(line)).slice(0, 3)
  );
  const negativeLines = unique(
    lines.filter((line) => /(issue|drop|confusion|wrong|risk|friction|delay|problem|galat|dikhat|pareshan|clear nahi)/i.test(line)).slice(0, 3)
  );

  return {
    summary: `This conversation was analyzed in ConvoLens free mode using local English plus Hindi/Hinglish heuristics instead of a paid AI API. The discussion focused on ${topics.slice(0, 3).join(", ") || "the main topic at hand"}. The overall tone appears ${sentimentLabel.toLowerCase()}, with ${actionItems.length} action-oriented moments identified. ${speakers.length ? `${speakers.length} distinct speaker${speakers.length > 1 ? "s were" : " was"} detected, and ${speakers[0].name} appears as a main contributor.` : "Multiple participants contributed to the exchange."} ${conversationClarity}`,
    sentiment_score: sentimentScore,
    sentiment_label: sentimentLabel,
    positives: positiveLines.length ? positiveLines : ["The discussion contains collaborative or forward-moving moments."],
    negatives: negativeLines.length ? negativeLines : ["No major negative signals were strongly detected in free mode."],
    key_topics: topics.length ? topics : ["conversation", "discussion", "next steps", "team", "analysis"],
    action_items: actionItems.length ? actionItems : ["Review the conversation and define the next owner manually."],
    notable_quotes: turns.slice(0, 3).map((turn) => turn.content),
    next_steps: "Review the generated action items and confirm the main decisions manually. If you want higher-quality summaries and speaker nuance later, reconnect a paid AI provider.",
    intent_summary: inferIntentSummary(text, conversationType),
    speaker_count: speakers.length,
    conversation_clarity: conversationClarity,
    communication_improvements: communicationImprovements,
    hidden_concerns: inferHiddenConcerns(text),
    decision_drivers: inferDecisionDrivers(text),
    speakers: speakers.length
      ? speakers
      : [{ name: "Speaker A", message_count: lines.length || 1, tone: "Neutral", key_contribution: "Shared the main points of the conversation." }],
    speaker_intentions: inferSpeakerIntentions(turns, speakers.length ? speakers : [{ name: "Speaker A", message_count: lines.length || 1, tone: "Neutral", key_contribution: "Shared the main points of the conversation." }]),
    emotion_tags: inferEmotionTags(text, positiveHits, negativeHits),
    conversation_type: conversationType
  };
}
