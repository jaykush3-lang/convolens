export type ToneLabel =
  | "Assertive"
  | "Collaborative"
  | "Defensive"
  | "Analytical"
  | "Supportive"
  | "Neutral";

export type EmotionTag =
  | "Collaborative"
  | "Tense"
  | "Productive"
  | "Conflict"
  | "Agreement"
  | "Confusion"
  | "Resolution"
  | "Urgency"
  | "Appreciation"
  | "Frustration";

export type ConversationType =
  | "Meeting"
  | "Conflict"
  | "Planning"
  | "Feedback"
  | "Casual"
  | "Negotiation"
  | "Support";

export interface SpeakerAnalysis {
  name: string;
  message_count: number;
  tone: ToneLabel;
  key_contribution: string;
}

export interface SpeakerIntentInsight {
  name: string;
  stated_goal: string;
  likely_intent: string;
  hidden_concern: string;
}

export interface AnalysisResult {
  summary: string;
  sentiment_score: number;
  sentiment_label: "Positive" | "Neutral" | "Negative";
  positives: string[];
  negatives: string[];
  key_topics: string[];
  action_items: string[];
  notable_quotes: string[];
  next_steps: string;
  intent_summary: string;
  hidden_concerns: string[];
  decision_drivers: string[];
  speakers: SpeakerAnalysis[];
  speaker_intentions: SpeakerIntentInsight[];
  emotion_tags: EmotionTag[];
  conversation_type: ConversationType;
}

export interface HistoryItem {
  id: string;
  created_at: string;
  preview_text: string;
  result: AnalysisResult;
  conversation_type: string;
  sentiment_label: string;
  sentiment_score: number;
}

