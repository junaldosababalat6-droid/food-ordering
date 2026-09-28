import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { Shield, Lock, User, Eye, EyeOff } from "lucide-react";

export const AdminLoginPage = () => {
  const { loginAdmin, t } = useApp();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    const result = loginAdmin(username, password);
    if (result.success) {
      navigate("/admin/dashboard");
    } else {
      setErrorMsg(result.message);
    }
  };

  return (
    <div className="landing-container">
      <div className="landing-logo">
        <Shield size={48} />
      </div>
      <h1 className="landing-title">{t.adminLogin}</h1>

      <div className="table-input-card">
        {errorMsg && (
          <div style={{ background: "rgba(239, 68, 68, 0.1)", color: "var(--danger)", border: "1px solid var(--danger)", padding: "10px", borderRadius: "8px", fontSize: "0.85rem", marginBottom: "16px" }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">{t.username}</label>
            <div className="search-box">
              <User className="search-icon" size={18} />
              <input
                type="text"
                className="form-input search-input"
                placeholder={t.username}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
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
                onChange={(e) => setPassword(e.target.value)}
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
          </div>

          <button type="submit" className="btn" style={{ width: "100%", padding: "12px", marginTop: "10px" }}>
            {t.login}
          </button>
        </form>

      </div>
    </div>
  );
};
