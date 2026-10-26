import { useCallback, useEffect, useState } from "react";
import { AddNote } from "../components/notes/AddNote";
import { Login } from "../components/notes/Login";
import { NotesList } from "../components/notes/NotesList";
import "./NotesPage.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const TOKEN_KEY = "bite_dash_notes_token";
const USERNAME_KEY = "bite_dash_notes_username";

const requestNotes = async () => {
  const response = await fetch(`${API_URL}/api/notes`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to load notes.");
  }

  return data;
};

export const NotesPage = () => {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [username, setUsername] = useState(() => localStorage.getItem(USERNAME_KEY));
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [authMessage, setAuthMessage] = useState("");

  const fetchNotes = useCallback(async () => {
    try {
      setNotes(await requestNotes());
      setError("");
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Failed to load notes.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    requestNotes()
      .then((data) => {
        if (active) {
          setNotes(data);
          setError("");
        }
      })
      .catch((fetchError) => {
        if (active) {
          setError(fetchError instanceof Error ? fetchError.message : "Failed to load notes.");
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const handleLoginSuccess = (loggedInUsername, accessToken) => {
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(USERNAME_KEY, loggedInUsername);
    setToken(accessToken);
    setUsername(loggedInUsername);
    setAuthMessage("");
  };

  const handleLogout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USERNAME_KEY);
    setToken(null);
    setUsername(null);
  };

  const handleUnauthorized = () => {
    handleLogout();
    setAuthMessage("Your session expired. Please log in again.");
  };

  const updateNote = async (noteId, changes) => {
    try {
      const response = await fetch(`${API_URL}/api/notes/${noteId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(changes),
      });
      const data = await response.json();

      if (response.status === 401) {
        handleUnauthorized();
        return false;
      }
      if (!response.ok) {
        throw new Error(data.error || "Failed to update note.");
      }

      await fetchNotes();
      setError("");
      return true;
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Failed to update note.");
      return false;
    }
  };

  const deleteNote = async (noteId) => {
    try {
      const response = await fetch(`${API_URL}/api/notes/${noteId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (response.status === 401) {
        handleUnauthorized();
        return false;
      }
      if (!response.ok) {
        throw new Error(data.error || "Failed to delete note.");
      }

      await fetchNotes();
      setError("");
      return true;
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Failed to delete note.");
      return false;
    }
  };

  return (
    <section className="notes-page">
      <header className="notes-header">
        <div>
          <h1>Notes</h1>
          <p>Notes are saved by the Notes API.</p>
        </div>
        {token && (
          <div className="notes-user-bar">
            <span>Logged in as <strong>{username}</strong></span>
            <button className="notes-button notes-button-secondary" onClick={handleLogout}>
              Log out
            </button>
          </div>
        )}
      </header>

      {authMessage && <p className="notes-message" role="status">{authMessage}</p>}
      {token ? (
        <AddNote
          token={token}
          onNoteAdded={fetchNotes}
          onUnauthorized={handleUnauthorized}
        />
      ) : (
        <Login onLoginSuccess={handleLoginSuccess} />
      )}

      <section className="notes-section">
        <h2>My Notes</h2>
        {error && (
          <div className="notes-message notes-message-error" role="alert">
            <p>{error}</p>
            <button className="notes-link-button" onClick={fetchNotes}>Try again</button>
          </div>
        )}
        {loading ? (
          <p className="notes-empty">Loading notes...</p>
        ) : (
          <NotesList
            notes={notes}
            canManage={Boolean(token)}
            onUpdateNote={updateNote}
            onDeleteNote={deleteNote}
          />
        )}
      </section>
    </section>
  );
};
