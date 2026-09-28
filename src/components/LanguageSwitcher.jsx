import React from "react";
import { useApp } from "../context/AppContext";
import { Globe } from "lucide-react";

export const LanguageSwitcher = () => {
  const { language, setLanguage, t } = useApp();

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "id" : "en");
  };

  return (
    <button
      onClick={toggleLanguage}
      className="btn btn-secondary"
      style={{ padding: "6px 12px", fontSize: "0.85rem", gap: "4px" }}
      title={t.switchLanguage}
    >
      <Globe size={16} />
      <span style={{ fontWeight: 700, textTransform: "uppercase" }}>{language}</span>
    </button>
  );
};
