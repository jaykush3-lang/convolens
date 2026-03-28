import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { z } from "zod";
import { CLAUDE_SYSTEM_PROMPT } from "@/lib/constants";
import { generateFreeAnalysis } from "@/lib/free-analysis";
import { enforceDailyAnalysisLimit } from "@/lib/rate-limit";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { parseAnalysisPayload } from "@/lib/validation";

const bodySchema = z.object({
  text: z.string().min(20, "Please provide at least 20 characters to analyze.")
});

export async function POST(request: Request) {
  try {
    const payload = bodySchema.parse(await request.json());
    const supabase = createServerSupabaseClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Please sign in to analyze conversations." }, { status: 401 });
    }

    await enforceDailyAnalysisLimit(user.id);

    let result;

    try {
      if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === "test") {
        throw new Error("Free mode enabled");
      }

      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      const completion = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1800,
        system: CLAUDE_SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: [{ type: "text", text: payload.text }]
          }
        ]
      });

      const textBlock = completion.content.find((block) => block.type === "text");

      if (!textBlock || textBlock.type !== "text") {
        throw new Error("The AI model did not return analysis text.");
      }

      result = parseAnalysisPayload(textBlock.text);
    } catch {
      result = generateFreeAnalysis(payload.text);
    }
    const admin = createAdminSupabaseClient();
    const previewText = payload.text.slice(0, 200);

    const { error: insertError } = await admin.from("analyses").insert({
      user_id: user.id,
      created_at: new Date().toISOString(),
      preview_text: previewText,
      result,
      conversation_type: result.conversation_type,
      sentiment_label: result.sentiment_label,
      sentiment_score: result.sentiment_score
    });

    if (insertError) {
      throw new Error(insertError.message);
    }

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to analyze the conversation right now.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

