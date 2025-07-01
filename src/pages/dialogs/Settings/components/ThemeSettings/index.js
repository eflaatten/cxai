import React from "react";
import { Sun, Moon, Monitor } from "lucide-react";

const ThemeSettings = ({ theme, setTheme }) => {
  return (
    <div className="theme-settings-container">
      <div className="theme-settings-header">
        <h2 className="theme-settings-title">Theme</h2>
      </div>
      <div className="theme-btn-group">
        <button
          className={`theme-btn${theme === "light" ? " selected" : ""}`}
          onClick={() => setTheme("light")}
        >
          <Sun className="theme-btn-icon" />
          Light
        </button>
        <button
          className={`theme-btn${theme === "dark" ? " selected" : ""}`}
          onClick={() => setTheme("dark")}
        >
          <Moon className="theme-btn-icon" />
          Dark
        </button>
        <button
          className={`theme-btn${theme === "system" ? " selected" : ""}`}
          onClick={() => setTheme("system")}
        >
          <Monitor className="theme-btn-icon" />
          System
        </button>
      </div>
    </div>
  );
};

export default ThemeSettings;
