import React from "react";
import { useApp } from "../context/AppContext";
import { Sun, Moon } from "lucide-react";

export const DarkModeToggle = () => {
  const { theme, toggleTheme, t } = useApp();

  return (
    <button
      onClick={toggleTheme}
      className="icon-btn"
      title={t.toggleTheme}
    >
      {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
    </button>
  );
};
