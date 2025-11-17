import supabase from "../supabaseClient";

/**
 * PUBLIC_INTERFACE
 * Enroll a user in a learning path (idempotent).
 */
export async function enrollUser({ userId, learningPathId }) {
  /** Upsert enrollment row. Requires a table 'enrollments' with (user_id, learning_path_id, created_at). */
  const { error } = await supabase
    .from("enrollments")
    .upsert(
      { user_id: userId, learning_path_id: learningPathId },
      { onConflict: "user_id,learning_path_id" }
    );
  if (error) throw error;
  return true;
}

/**
 * PUBLIC_INTERFACE
 * Start a course for the user; creates or updates a progress row.
 */
export async function startCourse({ userId, courseId }) {
  const { data: existing, error: loadErr } = await supabase
    .from("course_progress")
    .select("*")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .maybeSingle();
  if (loadErr) throw loadErr;

  if (existing) {
    const { error } = await supabase
      .from("course_progress")
      .update({ started_at: existing.started_at || new Date().toISOString() })
      .eq("user_id", userId)
      .eq("course_id", courseId);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("course_progress").insert([
      {
        user_id: userId,
        course_id: courseId,
        percent_complete: 0,
        started_at: new Date().toISOString(),
        completed_at: null,
      },
    ]);
    if (error) throw error;
  }
  return true;
}

/**
 * PUBLIC_INTERFACE
 * Update progress percent for a course. If complete, sets completed_at timestamp.
 */
export async function updateProgress({ userId, courseId, percent }) {
  const clamped = Math.max(0, Math.min(100, Number(percent) || 0));
  const payload = {
    percent_complete: clamped,
    completed_at: clamped >= 100 ? new Date().toISOString() : null,
  };
  const { error } = await supabase
    .from("course_progress")
    .upsert(
      {
        user_id: userId,
        course_id: courseId,
        ...payload,
      },
      { onConflict: "user_id,course_id" }
    );
  if (error) throw error;
  return clamped;
}

/**
 * PUBLIC_INTERFACE
 * Fetch all course progress rows for a given user.
 */
export async function fetchUserProgress(userId) {
  const { data, error } = await supabase
    .from("course_progress")
    .select("course_id, percent_complete, started_at, completed_at")
    .eq("user_id", userId);
  if (error) throw error;
  return data || [];
}

/**
 * PUBLIC_INTERFACE
 * Fetch aggregate stats for admins: totalUsers, totalEnrollments, avgCompletion across course_progress.
 * If RPCs exist, they can be used instead of client-side aggregation.
 */
export async function fetchAggregateStats() {
  const [profilesRes, enrollRes, progressRes] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("enrollments").select("user_id", { count: "exact", head: true }),
    supabase.from("course_progress").select("percent_complete"),
  ]);

  const totalUsers = profilesRes.count ?? 0;
  const totalEnrollments = enrollRes.count ?? 0;
  const progress = Array.isArray(progressRes.data) ? progressRes.data : [];
  const avgCompletion =
    progress.length > 0
      ? Math.round(
          (progress.reduce((sum, r) => sum + (r.percent_complete || 0), 0) /
            progress.length) *
            10
        ) / 10
      : 0;

  return { totalUsers, totalEnrollments, avgCompletion };
}
