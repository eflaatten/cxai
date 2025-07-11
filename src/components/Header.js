import React, { useState, useEffect } from "react";
import Avatar from "@mui/material/Avatar";
import {
  CheckIcon,
  UserIcon,
  NightIcon,
  MoonIcon,
  SunIcon,
  LogoutIcon,
  RightArrowIcon,
  LeftArrowIcon,
  SettingsIcon,
  MenuIcon,
} from "../assets/icons";
//import ModelSwitcher from "./ModelSwitcher";
import "./Header.css";c

const Header = ({
  isSidenavOpen,
  onMenuClick,
  userEmail,
  darkTheme,
  setDarkTheme,
  provider,
  setProvider,
}) => {
  const [submenuOpen, setSubmenuOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);

  let headerClass = "app-header";
  if (isSidenavOpen) headerClass += " with-sidenav";
  else headerClass += " with-sidenav-min";

  const handleThemeChange = (isDark) => {
    setDarkTheme(isDark);
    setThemeMenuOpen(false);
    setSubmenuOpen(false);
  };

  const handleSubmenuClick = (e) => {
    e.stopPropagation();
  };

  useEffect(() => {
    const closeMenus = () => {
      setSubmenuOpen(false);
      setThemeMenuOpen(false);
    };
    if (submenuOpen) {
      window.addEventListener("click", closeMenus);
      return () => window.removeEventListener("click", closeMenus);
    }
  }, [submenuOpen]);

  return (
    <header className={headerClass}>
      <div className="header-left">
        {!isSidenavOpen && (
          <button
            className="header-menu-btn"
            onClick={onMenuClick}
            aria-label="Open menu"
          >
            <MenuIcon fontSize="medium" />
          </button>
        )}
        {/* <ModelSwitcher provider={provider} setProvider={setProvider} /> */}
      </div>
      <div className="header-right">
        <div
          className="header-avatar-wrapper hide-on-mobile"
          onClick={(e) => {
            e.stopPropagation();
            setSubmenuOpen((o) => !o);
          }}
        >
          <Avatar className="header-avatar" />
          {submenuOpen && (
            <div className="header-avatar-menu" onClick={handleSubmenuClick}>
              <div className="header-avatar-menu-item profile">
                <UserIcon className="header-avatar-menu-icon" />
                <span>{userEmail || "user@email.com"}</span>
              </div>
              <div
                className="header-avatar-menu-item"
                onClick={() => {
                  setSubmenuOpen(false);
                }}
              >
                <SettingsIcon className="header-avatar-menu-icon" />
                <span>Settings</span>
              </div>
              <div
                className="header-avatar-menu-item"
                onClick={(e) => {
                  e.stopPropagation();
                  setThemeMenuOpen((o) => !o);
                }}
                style={{ position: "relative" }}
              >
                <NightIcon className="header-avatar-menu-icon" />
                <span>Theme</span>
                <span className="header-theme-caret">
                  {themeMenuOpen ? (
                    <LeftArrowIcon className="header-avatar-menu-icon" />
                  ) : (
                    <RightArrowIcon className="header-avatar-menu-icon" />
                  )}
                </span>
                {themeMenuOpen && (
                  <div
                    className="header-theme-menu"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div
                      className="header-theme-menu-item"
                      onClick={() => handleThemeChange(false)}
                    >
                      <SunIcon className="header-avatar-menu-icon" /> Light
                      {!darkTheme && <CheckIcon className="check" />}
                    </div>
                    <div
                      className="header-theme-menu-item"
                      onClick={() => handleThemeChange(true)}
                    >
                      <MoonIcon className="header-avatar-menu-icon" /> Dark
                      {darkTheme && <CheckIcon className="check" />}
                    </div>
                  </div>
                )}
              </div>
              <div
                className="header-avatar-menu-item"
                onClick={() => {
                  setSubmenuOpen(false);
                }}
              >
                <LogoutIcon className="header-avatar-menu-icon" />
                <span>Log out</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
