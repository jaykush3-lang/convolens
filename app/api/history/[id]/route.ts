import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerSupabaseClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Please sign in to delete history." }, { status: 401 });
    }

    const admin = createAdminSupabaseClient();
    const { error } = await admin.from("analyses").delete().eq("id", params.id).eq("user_id", user.id);

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to delete this analysis right now.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

