export const SAMPLE_CONVERSATION = `Ava: Thanks for joining. Our onboarding completion rate dropped from 72% to 54% this month.
Leo: Most of the drop seems to happen after the second setup screen. Users are abandoning when asked to connect integrations.
Mina: Support tickets also mention confusion about why we need calendar access so early.
Ava: That suggests the sequence is wrong. We may be asking for too much trust before we've shown value.
Leo: Agreed. We could move the integration step until after the first win moment and add a clearer explanation.
Mina: I can draft new helper copy today, and support can test it with recent users.
Ava: Good. Leo, can product mock the revised flow by Thursday? Mina, let's also collect five support transcripts that mention calendar permissions.
Leo: Yes, I'll have a prototype ready.
Mina: Done. I'll share the transcripts and updated copy before end of day.
Ava: Perfect. Let's review impact next Tuesday and decide whether to ship the change broadly.`;

export const CLAUDE_SYSTEM_PROMPT = `You are ConvoLens, an expert conversation analyst. Analyze the conversation and return ONLY valid JSON with no extra text, markdown, or backticks.

JSON structure:
{
  "summary": "4-5 sentence crisp summary of the conversation and outcome",
  "sentiment_score": <integer 0-100>,
  "sentiment_label": "<Positive|Neutral|Negative>",
  "positives": ["specific positive point 1", "point 2", "point 3"],
  "negatives": ["specific negative point 1", "point 2", "point 3"],
  "key_topics": ["topic1", "topic2", "topic3", "topic4", "topic5"],
  "action_items": ["action 1", "action 2", "action 3", "action 4"],
  "notable_quotes": ["exact quote 1", "exact quote 2", "exact quote 3"],
  "next_steps": "Concrete 2-3 sentence recommendation on what should happen next",
  "speakers": [
    {
      "name": "Speaker name or Speaker A if unknown",
      "message_count": <integer>,
      "tone": "<Assertive|Collaborative|Defensive|Analytical|Supportive|Neutral>",
      "key_contribution": "One sentence describing their role in the conversation"
    }
  ],
  "emotion_tags": ["<pick relevant: Collaborative|Tense|Productive|Conflict|Agreement|Confusion|Resolution|Urgency|Appreciation|Frustration>"],
  "conversation_type": "<Meeting|Conflict|Planning|Feedback|Casual|Negotiation|Support>"
}`;

export const AUDIO_ACCEPT = ".mp3,.wav,.m4a,.ogg,.webm";
export const MAX_DAILY_ANALYSES = 20;

