import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { MAX_DAILY_ANALYSES } from "@/lib/constants";

export async function enforceDailyAnalysisLimit(userId: string) {
  const supabase = createAdminSupabaseClient();
  const day = new Date().toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("analysis_rate_limits")
    .select("request_count")
    .eq("user_id", userId)
    .eq("day", day)
    .maybeSingle();

  if (error) {
    throw new Error("Unable to verify rate limit.");
  }

  const nextCount = (data?.request_count ?? 0) + 1;

  if (nextCount > MAX_DAILY_ANALYSES) {
    throw new Error(`Daily limit reached. You can run up to ${MAX_DAILY_ANALYSES} analyses per day.`);
  }

  const { error: upsertError } = await supabase.from("analysis_rate_limits").upsert(
    {
      user_id: userId,
      day,
      request_count: nextCount,
      updated_at: new Date().toISOString()
    },
    { onConflict: "user_id,day" }
  );

  if (upsertError) {
    throw new Error("Unable to update rate limit.");
  }
}

