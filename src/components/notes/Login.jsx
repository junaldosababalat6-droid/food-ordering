import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const Login = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Authentication failed.");
        return;
      }

      if (mode === "register") {
        setMode("login");
        setMessage("Account created. Log in to continue.");
        setPassword("");
        return;
      }

      onLoginSuccess(username.trim(), data.token);
    } catch {
      setError("Cannot reach the Notes API. Check that the backend is running.");
    } finally {
      setSubmitting(false);
    }
  };

  const switchMode = () => {
    setMode(mode === "login" ? "register" : "login");
    setError("");
    setMessage("");
  };

  return (
    <form className="notes-card notes-form" onSubmit={handleSubmit}>
      <h2>{mode === "login" ? "Log in" : "Create an account"}</h2>
      {error && <p className="notes-message notes-message-error" role="alert">{error}</p>}
      {message && <p className="notes-message" role="status">{message}</p>}
      <label className="notes-field">
        <span>Username</span>
        <input
          autoComplete="username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          required
        />
      </label>
      <label className="notes-field">
        <span>Password</span>
        <input
          type="password"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          minLength={mode === "register" ? 6 : undefined}
        />
      </label>
      <button className="notes-button" type="submit" disabled={submitting}>
        {submitting ? "Please wait..." : mode === "login" ? "Log in" : "Register"}
      </button>
      <button className="notes-link-button" type="button" onClick={switchMode}>
        {mode === "login" ? "Need an account? Register" : "Already registered? Log in"}
      </button>
    </form>
  );
};
