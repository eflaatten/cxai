import React, { useState, useEffect } from "react";
import { MenuOpenIcon, ChatIcon, EditIcon, UpArrowIcon2, DownArrowIcon, SettingsIcon, SunIcon, MoonIcon, NightIcon, LogoutIcon, CheckIcon } from "../assets/icons";
import cxfab_logo from "../assets/logos/cxf_logo.png";
import cxfab_circle from "../assets/logos/cxfab_circle.png";
import './styles/Sidenav.css';
import Avatar from '@mui/material/Avatar';
import MobileSettingsModal from "./MobileSettingsModal";

const Sidenav = ({
  darkTheme,
  isOpen,
  setIsOpen,
  userEmail,
  setDarkTheme = () => {},
  }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileSettingsOpen, setMobileSettingsOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);

  // Sync dark mode class on body
  useEffect(() => {
    if (darkTheme) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkTheme]);

  // Sample chat data
const chats = [
  { id: 1, name: "Client: Sarah Miller – Contract Review" },
  { id: 2, name: "Research – Texas Non-Compete Statutes" },
  { id: 3, name: "Client: Acme Corp – MSA Negotiations" },
  { id: 4, name: "Quick Ask: PTO Policy Template" },
  { id: 5, name: "Client: Brian O’Connor – Employment Inquiry" },
  { id: 6, name: "Research – Trademark Application Steps" },
  { id: 7, name: "Client: Jane Lee – Lease Agreement Draft" },
  { id: 8, name: "Team: Litigation Prep Notes" },
  { id: 9, name: "Client: Robert Yu – IP Transfer Questions" },
  { id: 10, name: "Draft Email: Opposing Counsel Follow-Up" },
  { id: 11, name: "Client: Delta Partners – NDA Terms" },
  { id: 12, name: "Research – Texas Discovery Deadlines" },
  { id: 13, name: "Team: Friday Standup Recap" },
  { id: 14, name: "Client: Ingrid Patel – Divorce Consultation" },
  { id: 15, name: "Draft: Court Motion for Continuance" },
  { id: 16, name: "Client: Omar Reyes – Billing Question" },
  { id: 17, name: "Research – Fair Use Copyright" },
  { id: 18, name: "Client: Ava Robinson – Demand Letter" },
  { id: 19, name: "Team: Onboarding Checklist" },
  { id: 20, name: "Client: Leo Chang – Case Status Update" },
  { id: 21, name: "Research – Arbitration vs Mediation" },
  { id: 22, name: "Client: Harper Group – Corporate Minutes" },
  { id: 23, name: "Draft: Retainer Agreement Template" },
  { id: 24, name: "Client: Michael Lee – Real Estate Closing" },
  { id: 25, name: "Team: Q3 Budget Planning, LONG CHAT NAMELONG CHAT NAMELONG CHAT NAMELONG CHAT NAME " },
];

  return (
    <div className={`sidenav${darkTheme ? " dark-mode" : ""}${isOpen ? " open" : ""}`}>
      <div className="sidenav-top">
        <div className="sidenav-logo-container">
          {isOpen ? (
            <>
              <img
                className="sidenav-logo"
                src={cxfab_logo}
                alt="Logo"
                width={170}
                height={28}
              />
              <button
                className="sidenav-toggle-btn"
                onClick={() => setIsOpen(false)}
                aria-label="Minimize menu"
              >
                <MenuOpenIcon className="sidenav-toggle-icon" />
              </button>
            </>
          ) : (
            <img
              className="sidenav-logo minimized"
              src={cxfab_circle}
              alt="Logo"
              width={32}
              height={32}
            />
          )}
        </div>

        <div className="sidenav-settings-container">
          {isOpen ? (
            <button className="new-chat-btn">
              <EditIcon className="edit-icon" />
              New Chat
            </button>
          ) : (
            <button className="new-chat-btn minimized">
              <EditIcon className="edit-icon" />
            </button>
          )}
        </div>

        {isOpen && (
        <>
          <div className="chats-dropdown-section">
            <button
              className="chats-dropdown-btn"
              onClick={() => setDropdownOpen((open) => !open)}
              aria-expanded={dropdownOpen}
              aria-label="Toggle chats dropdown"
            >
              <ChatIcon className="chats-header-icon" />
              <span className="chats-header">Chats</span>
              {dropdownOpen ? (
                <UpArrowIcon2 className="chats-dropdown-caret" style={{ marginLeft: "auto" }} />
              ) : (
                <DownArrowIcon className="chats-dropdown-caret" style={{ marginLeft: "auto" }} />
              )}
            </button>
            {dropdownOpen && (
              <div className="chats-list">
                {chats.map(chat => {
                  let summary = chat.name.split(/[–:]/)[1] || chat.name;
                  summary = summary.trim();
                  if (summary.length > 20) {
                    summary = summary.slice(0, 23) + "...";
                  }
                  return (
                    <div className="dropdown-chat-item" key={chat.id}>
                      {summary}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
        )}
      </div>
      <div className="sidenav-bottom-mobile" onClick={() => setMobileSettingsOpen(true)}>
        <div className="sidenav-avatar-menu-item">
          <Avatar className="sidenav-avatar" />
          <span className="sidenav-avatar-email">{userEmail || 'user@email.com'}</span>
        </div>
      </div>
      <MobileSettingsModal open={mobileSettingsOpen} onClose={() => { setMobileSettingsOpen(false); setThemeMenuOpen(false); }}>
        <div className="mobile-settings-modal-content">
          <div className="mobile-settings-avatar-row">
            <Avatar className="sidenav-avatar" />
            <span>{userEmail || 'user@email.com'}</span>
          </div>
          <button className="mobile-settings-menu-item" onClick={() => setMobileSettingsOpen(false)}>
            <SettingsIcon className="header-avatar-menu-icon" />
            <span>Settings</span>
          </button>
          <div className="mobile-settings-theme-dropdown">
            <button className="mobile-settings-theme-dropdown-toggle" onClick={() => setThemeMenuOpen(o => !o)}>
              <NightIcon className="header-avatar-menu-icon" />
              <span>Theme</span>
              <span style={{marginLeft:'auto'}}>
                {themeMenuOpen ? <UpArrowIcon2 style={{marginTop: "5px"}} /> : <DownArrowIcon style={{marginTop: "5px"}} />}
              </span>
            </button>
            {themeMenuOpen && (
              <div className="mobile-settings-theme-menu">
                <button className="mobile-settings-theme-menu-item" onClick={() => { setDarkTheme(false); setThemeMenuOpen(false); }}>
                  <SunIcon className="header-avatar-menu-icon" /> Light
                  { !darkTheme && <CheckIcon className="check" /> }
                </button>
                <button className="mobile-settings-theme-menu-item" onClick={() => { setDarkTheme(true); setThemeMenuOpen(false); }}>
                  <MoonIcon className="header-avatar-menu-icon" /> Dark
                  { darkTheme && <CheckIcon className="check" /> }
                </button>
              </div>
            )}
          </div>
          <button className="mobile-settings-menu-item logout">
            <LogoutIcon className="header-avatar-menu-icon" />
            <span>Log out</span>
          </button>
        </div>
      </MobileSettingsModal>
    </div>
  );
};

export default Sidenav;
