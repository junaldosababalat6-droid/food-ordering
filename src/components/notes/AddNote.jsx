import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const AddNote = ({ token, onNoteAdded, onUnauthorized }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/api/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, content }),
      });
      const data = await response.json();

      if (response.status === 401) {
        onUnauthorized();
        return;
      }
      if (!response.ok) {
        setError(data.error || "Failed to create note.");
        return;
      }

      setTitle("");
      setContent("");
      await onNoteAdded();
    } catch {
      setError("Cannot reach the Notes API. Check that the backend is running.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="notes-card notes-form" onSubmit={handleSubmit}>
      <h2>Add a note</h2>
      {error && <p className="notes-message notes-message-error" role="alert">{error}</p>}
      <label className="notes-field">
        <span>Title</span>
        <input value={title} onChange={(event) => setTitle(event.target.value)} required />
      </label>
      <label className="notes-field">
        <span>Content</span>
        <textarea
          rows={4}
          value={content}
          onChange={(event) => setContent(event.target.value)}
        />
      </label>
      <button className="notes-button" type="submit" disabled={submitting}>
        {submitting ? "Saving..." : "Save note"}
      </button>
    </form>
  );
};
