import OpenAI from "openai";
import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = createServerSupabaseClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Please sign in to transcribe audio." }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Please upload an audio file first." }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "test") {
      return NextResponse.json(
        {
          error: "Free mode does not include automatic audio transcription yet. Paste the transcript manually in the transcript box to analyze it for free."
        },
        { status: 400 }
      );
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const transcription = await client.audio.transcriptions.create({
      file,
      model: "whisper-1"
    });

    return NextResponse.json({ transcript: transcription.text });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to transcribe audio right now.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

