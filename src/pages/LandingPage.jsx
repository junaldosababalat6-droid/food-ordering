import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { Utensils, QrCode } from "lucide-react";

export const LandingPage = () => {
  const { tableNumber, setTableNumber, t } = useApp();
  const [tableInput, setTableInput] = useState(tableNumber);
  const navigate = useNavigate();

  const handleStart = (e) => {
    e.preventDefault();
    if (tableInput) {
      setTableNumber(tableInput);
    }
    navigate("/menu");
  };

  return (
    <div className="landing-container">
      <div className="landing-logo">
        <Utensils size={48} />
      </div>
      <h1 className="landing-title">{t.appName}</h1>
      <p className="landing-subtitle">{t.tagline}</p>

      <div className="table-input-card">
        <form onSubmit={handleStart}>
          <div className="form-group">
            <label className="form-label">
              <QrCode size={16} style={{ display: "inline", marginRight: "6px" }} />
              {t.tableNumber}
            </label>
            <input
              type="text"
              className="form-input text-center"
              placeholder={t.tablePlaceholder}
              value={tableInput}
              onChange={(e) => setTableInput(e.target.value)}
              required
              style={{ fontSize: "1.2rem", fontWeight: 700 }}
            />
          </div>

          <button type="submit" className="btn" style={{ width: "100%", padding: "14px" }}>
            {t.startOrdering}
          </button>
        </form>
      </div>
    </div>
  );
};
