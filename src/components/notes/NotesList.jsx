import { useState } from "react";
import { Pencil, Save, Trash2, X } from "lucide-react";

const NoteEditor = ({ note, onSave, onCancel }) => {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const saved = await onSave({ title, content });
      if (saved) {
        onCancel();
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="notes-edit-form" onSubmit={handleSubmit}>
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
      <div className="notes-actions">
        <button className="notes-button" type="submit" disabled={saving}>
          <Save size={16} />
          {saving ? "Saving..." : "Save"}
        </button>
        <button
          className="notes-button notes-button-secondary"
          type="button"
          onClick={onCancel}
          disabled={saving}
        >
          <X size={16} />
          Cancel
        </button>
      </div>
    </form>
  );
};

export const NotesList = ({ notes, canManage, onUpdateNote, onDeleteNote }) => {
  const [editingId, setEditingId] = useState(null);
  const [busyId, setBusyId] = useState(null);

  if (notes.length === 0) {
    return <p className="notes-empty">No notes yet.</p>;
  }

  return (
    <div className="notes-list">
      {notes.map((note) => (
        <article className="notes-card notes-item" key={note.id}>
          {editingId === note.id ? (
            <NoteEditor
              note={note}
              onSave={(changes) => onUpdateNote(note.id, changes)}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <>
              <h3>{note.title}</h3>
              <p>{note.content || "No content."}</p>
              {canManage && (
                <div className="notes-actions">
                  <button
                    className="notes-button notes-button-secondary"
                    type="button"
                    onClick={() => setEditingId(note.id)}
                    disabled={busyId !== null}
                  >
                    <Pencil size={16} />
                    Edit
                  </button>
                  <button
                    className="notes-button notes-button-danger"
                    type="button"
                    disabled={busyId !== null}
                    onClick={async () => {
                      if (!window.confirm(`Delete "${note.title}"?`)) {
                        return;
                      }

                      setBusyId(note.id);
                      try {
                        await onDeleteNote(note.id);
                      } finally {
                        setBusyId(null);
                      }
                    }}
                  >
                    <Trash2 size={16} />
                    {busyId === note.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              )}
            </>
          )}
        </article>
      ))}
    </div>
  );
};
