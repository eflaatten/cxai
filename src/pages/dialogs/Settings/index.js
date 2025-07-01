import React, { useState } from "react";
import SettingsIcon from "@mui/icons-material/Settings";
import ThemeSettings from "./components/ThemeSettings";
import "./styles.css";

const SETTINGS_OPTIONS = [
  { key: "theme", label: "Theme" },
  { key: "account", label: "Account" },
];

const SettingsDialog = ({ open, onClose, selectedOption, setSelectedOption, theme, setTheme }) => {
  if (!open) return null;
  return (
    <div className="settings-dialog-backdrop">
      <div className="settings-dialog">
        <div className="settings-dialog-header">
          <span className="settings-dialog-title">Settings</span>
          <button className="settings-dialog-close" onClick={onClose}>&#10005;</button>
        </div>
        <div className="settings-dialog-content">
          <div className="settings-dialog-sidebar">
            {SETTINGS_OPTIONS.map(opt => (
              <button
                key={opt.key}
                className={`settings-sidebar-btn${selectedOption === opt.key ? " selected" : ""}`}
                onClick={() => setSelectedOption(opt.key)}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="settings-dialog-main">
            {selectedOption === "theme" && (
              <ThemeSettings theme={theme} setTheme={setTheme} />
            )}
            {selectedOption === "account" && (
              <div style={{padding: 32}}>Account settings coming soon...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Settings = ({ theme, setTheme }) => {
  const [open, setOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState("theme");
  return (
    <>
      <div className="settings-gear-container">
        <button className="settings-gear-btn" onClick={() => setOpen(true)}>
          <SettingsIcon style={{ fontSize: 24 }} />
        </button>
      </div>
      <SettingsDialog
        open={open}
        onClose={() => setOpen(false)}
        selectedOption={selectedOption}
        setSelectedOption={setSelectedOption}
        theme={theme}
        setTheme={setTheme}
      />
    </>
  );
};

export default Settings;
