import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { Shield, Lock, User, Eye, EyeOff } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const AdminLoginPage = () => {
  const { loginAdmin, t, adminAuthError } = useApp();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [adminExists, setAdminExists] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    let active = true;

    fetch(`${API_URL}/api/admin/bootstrap-status`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Could not check admin registration status.");
        }
        return data;
      })
      .then((data) => {
        if (active) {
          setAdminExists(data.adminExists);
        }
      })
      .catch((error) => {
        if (active) {
          setErrorMsg(error instanceof Error ? error.message : "Could not check admin registration status.");
        }
      })
      .finally(() => {
        if (active) {
          setLoadingStatus(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const isRegisterMode = adminExists === false;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setSubmitting(true);

    try {
      if (isRegisterMode) {
        const response = await fetch(`${API_URL}/api/admin/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });
        const data = await response.json();

        if (!response.ok) {
          setErrorMsg(data.error || "Admin registration failed.");
          return;
        }

        setAdminExists(true);
        setPassword("");
        setSuccessMsg("Admin account created. Log in with your new account.");
        return;
      }

      const result = await loginAdmin(username, password);
      if (!result.success) {
        setErrorMsg(result.message);
        return;
      }

      navigate("/admin/dashboard");
    } catch {
      setErrorMsg("Cannot reach the admin API. Check that the backend is running.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="landing-container">
      <div className="landing-logo">
        <Shield size={48} />
      </div>
      <h1 className="landing-title">{isRegisterMode ? "Create Admin Account" : t.adminLogin}</h1>

      <div className="table-input-card">
        {loadingStatus && <p role="status">Checking admin account setup...</p>}
        {!loadingStatus && adminExists === false && (
          <p style={{ marginBottom: "16px", color: "var(--text-secondary)" }}>
            No admin account exists yet. Create the first admin account to continue.
          </p>
        )}
        {adminAuthError && !errorMsg && (
          <div role="alert" style={{ color: "var(--danger)", marginBottom: "16px" }}>
            {adminAuthError}
          </div>
        )}
        {errorMsg && (
          <div role="alert" style={{ background: "rgba(239, 68, 68, 0.1)", color: "var(--danger)", border: "1px solid var(--danger)", padding: "10px", borderRadius: "8px", fontSize: "0.85rem", marginBottom: "16px" }}>
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div role="status" style={{ background: "rgba(34, 197, 94, 0.1)", color: "var(--success)", padding: "10px", borderRadius: "8px", fontSize: "0.85rem", marginBottom: "16px" }}>
            {successMsg}
          </div>
        )}

        {!loadingStatus && adminExists !== null && (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">{t.username}</label>
              <div className="search-box">
                <User className="search-icon" size={18} />
                <input
                  type="text"
                  className="form-input search-input"
                  placeholder={t.username}
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">{t.password}</label>
              <div className="search-box">
                <Lock className="search-icon" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-input search-input"
                  placeholder={t.password}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete={isRegisterMode ? "new-password" : "current-password"}
                  minLength={isRegisterMode ? 8 : undefined}
                  style={{ paddingRight: "48px" }}
                  required
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  title={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((visible) => !visible)}
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--text-secondary)",
                    background: "transparent",
                    border: 0,
                    padding: "4px",
                    cursor: "pointer",
                    display: "flex",
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {isRegisterMode && (
                <small style={{ color: "var(--text-secondary)" }}>
                  Admin passwords must be at least 8 characters.
                </small>
              )}
            </div>

            <button
              type="submit"
              className="btn"
              disabled={submitting}
              style={{ width: "100%", padding: "12px", marginTop: "10px" }}
            >
              {submitting
                ? "Please wait..."
                : isRegisterMode
                  ? "Register Admin"
                  : t.login}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
