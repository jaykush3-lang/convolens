import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Please sign in to view history." }, { status: 401 });
    }

    const admin = createAdminSupabaseClient();
    const { data, error } = await admin
      .from("analyses")
      .select("id, created_at, preview_text, result, conversation_type, sentiment_label, sentiment_score")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json(data ?? []);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load history right now.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

