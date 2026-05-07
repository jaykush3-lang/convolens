import { z } from "zod";

export const analysisSchema = z.object({
  summary: z.string(),
  sentiment_score: z.number().int().min(0).max(100),
  sentiment_label: z.enum(["Positive", "Neutral", "Negative"]),
  positives: z.array(z.string()),
  negatives: z.array(z.string()),
  key_topics: z.array(z.string()),
  action_items: z.array(z.string()),
  notable_quotes: z.array(z.string()),
  next_steps: z.string(),
  intent_summary: z.string(),
  speaker_count: z.number().int().nonnegative(),
  conversation_clarity: z.string(),
  communication_improvements: z.array(z.string()),
  hidden_concerns: z.array(z.string()),
  decision_drivers: z.array(z.string()),
  speakers: z.array(
    z.object({
      name: z.string(),
      message_count: z.number().int().nonnegative(),
      tone: z.enum(["Assertive", "Collaborative", "Defensive", "Analytical", "Supportive", "Neutral"]),
      key_contribution: z.string()
    })
  ),
  speaker_intentions: z.array(
    z.object({
      name: z.string(),
      stated_goal: z.string(),
      likely_intent: z.string(),
      hidden_concern: z.string()
    })
  ),
  emotion_tags: z.array(
    z.enum([
      "Collaborative",
      "Tense",
      "Productive",
      "Conflict",
      "Agreement",
      "Confusion",
      "Resolution",
      "Urgency",
      "Appreciation",
      "Frustration"
    ])
  ),
  conversation_type: z.enum(["Meeting", "Conflict", "Planning", "Feedback", "Casual", "Negotiation", "Support"])
});

export function parseAnalysisPayload(input: string) {
  const trimmed = input.trim().replace(/^```json\s*/i, "").replace(/```$/i, "");
  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  const candidate = firstBrace >= 0 && lastBrace > firstBrace ? trimmed.slice(firstBrace, lastBrace + 1) : trimmed;
  return analysisSchema.parse(JSON.parse(candidate));
}

