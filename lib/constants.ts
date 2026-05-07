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

export const SAMPLE_TEMPLATES = [
  {
    id: "english-product",
    label: "English Product",
    description: "Product planning discussion with clear action items.",
    text: SAMPLE_CONVERSATION
  },
  {
    id: "hindi-hinglish",
    label: "Hindi + Hinglish",
    description: "Mixed Hindi and English conversation for everyday team analysis.",
    text: `Aman: Client ko onboarding flow samajh nahi aa raha aur second step pe bahut confusion ho raha hai.
Riya: Haan, especially jab integration permissions maangte hain tab users drop kar rahe hain.
Aman: Mujhe lag raha hai pehle value dikhani chahiye, baad mein access maangna better rahega.
Riya: Theek hai, main aaj helper copy update karke bhej deti hoon.
Aman: Perfect, aur kal tak ek simple prototype bhi ready kar lete hain.
Riya: Done, main support team se 5 recent tickets bhi collect kar lungi.
Aman: Great, next review mein decide karenge ki change sab users ke liye launch karna hai ya nahi.`
  },
  {
    id: "support-escalation",
    label: "Support Case",
    description: "Customer support exchange with urgency and resolution cues.",
    text: `Customer: I was charged twice and I still cannot access my account.
Support Agent: I'm sorry about that. I can see the duplicate charge and the failed access token issue.
Customer: I need this fixed today because my team is blocked.
Support Agent: Understood. I'll refund the duplicate payment now and escalate the login issue to engineering.
Support Agent: I'll email you an update within one hour and confirm once access is restored.
Customer: Thanks, please make sure this doesn't happen again.`
  },
  {
    id: "manager-feedback",
    label: "Manager Feedback",
    description: "Performance feedback conversation with clear takeaways.",
    text: `Manager: You handled the launch well, especially the stakeholder updates and quick issue triage.
Employee: Thank you. I felt confident on communication, but I know the reporting deck came together too late.
Manager: That's the main improvement area. Earlier preparation would reduce last-minute stress for the team.
Employee: Agreed. I'll create a reporting template before the next launch cycle.
Manager: Good plan. Let's review that template together on Monday and make it reusable across the team.`
  }
] as const;

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
  "intent_summary": "2-3 sentence explanation of what the speakers actually want beneath the surface",
  "hidden_concerns": ["concern 1", "concern 2", "concern 3"],
  "decision_drivers": ["driver 1", "driver 2", "driver 3"],
  "speakers": [
    {
      "name": "Speaker name or Speaker A if unknown",
      "message_count": <integer>,
      "tone": "<Assertive|Collaborative|Defensive|Analytical|Supportive|Neutral>",
      "key_contribution": "One sentence describing their role in the conversation"
    }
  ],
  "speaker_intentions": [
    {
      "name": "Speaker name",
      "stated_goal": "What they openly say they want",
      "likely_intent": "What they likely mean or are trying to achieve beneath the words",
      "hidden_concern": "Their unspoken fear, pressure, or concern"
    }
  ],
  "emotion_tags": ["<pick relevant: Collaborative|Tense|Productive|Conflict|Agreement|Confusion|Resolution|Urgency|Appreciation|Frustration>"],
  "conversation_type": "<Meeting|Conflict|Planning|Feedback|Casual|Negotiation|Support>"
}`;

export const AUDIO_ACCEPT = ".mp3,.wav,.m4a,.ogg,.webm";
export const IMAGE_ACCEPT = "image/png,image/jpeg,image/webp";
export const MAX_SCREENSHOT_UPLOADS = 4;
export const MAX_DAILY_ANALYSES = 20;

