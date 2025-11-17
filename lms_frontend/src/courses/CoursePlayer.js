import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import supabase from "../supabaseClient";
import { startCourse, updateProgress } from "../progress/progressApi";
import { useAuth } from "../auth/AuthProvider";

/**
 * PUBLIC_INTERFACE
 * CoursePlayer loads a course by id (basic fetch) and allows the user to mark progress/complete.
 */
function CoursePlayer() {
  const { id } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [percent, setPercent] = useState(0);
  const [status, setStatus] = useState({ loading: true, error: "", saving: false });

  useEffect(() => {
    let active = true;
    const load = async () => {
      setStatus((s) => ({ ...s, loading: true, error: "" }));
      try {
        const { data, error } = await supabase.from("courses").select("*").eq("id", id).single();
        if (error) throw error;
        if (active) setCourse(data);
        if (user?.id) {
          await startCourse({ userId: user.id, courseId: id });
        }
      } catch (e) {
        if (active) setStatus({ loading: false, error: e.message || "Failed to load course", saving: false });
        return;
      }
      if (active) setStatus({ loading: false, error: "", saving: false });
    };
    if (id) load();
    return () => {
      active = false;
    };
  }, [id, user?.id]);

  const saveProgress = async (value) => {
    if (!user?.id || !id) return;
    setStatus((s) => ({ ...s, saving: true }));
    try {
      await updateProgress({ userId: user.id, courseId: id, percent: value });
      setPercent(value);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    } finally {
      setStatus((s) => ({ ...s, saving: false }));
    }
  };

  const markComplete = () => saveProgress(100);

  if (status.loading) return <div style={{ padding: 24 }}>Loading...</div>;
  if (status.error) return <div style={{ padding: 24, color: "#EF4444" }}>{status.error}</div>;
  if (!course) return <div style={{ padding: 24 }}>Course not found.</div>;

  return (
    <div className="container" style={{ maxWidth: 840, margin: "24px auto", textAlign: "left" }}>
      <h2 style={{ marginBottom: 8 }}>{course.title || `Course ${id}`}</h2>
      {course.url && (
        <p>
          <a className="App-link" href={course.url} target="_blank" rel="noreferrer">
            Open course resource
          </a>
        </p>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 16 }}>
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={percent}
          onChange={(e) => setPercent(Number(e.target.value))}
          onMouseUp={() => saveProgress(percent)}
          onTouchEnd={() => saveProgress(percent)}
          aria-label="Progress percent"
          style={{ flex: 1 }}
        />
        <div style={{ width: 48, textAlign: "right" }}>{percent}%</div>
      </div>

      <div style={{ marginTop: 12 }}>
        <button
          className="btn"
          onClick={markComplete}
          disabled={status.saving}
          style={{
            background: "var(--button-bg)",
            color: "var(--button-text)",
            border: "none",
            padding: "10px 16px",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          {status.saving ? "Saving..." : "Mark as Complete"}
        </button>
      </div>
    </div>
  );
}

export default CoursePlayer;
