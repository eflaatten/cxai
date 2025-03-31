import React, { useState } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { FaSun, FaMoon } from "react-icons/fa";
import TooltipWrapper from "./Tooltip";
import "./styles/Sidenav.css";

const Sidenav = ({ darkTheme, setDarkTheme }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);

  const handleThemeClick = () => {
    if (!isOpen) {
      setIsOpen(true);
      setIsThemeMenuOpen(true);
    } else {
      setIsThemeMenuOpen(!isThemeMenuOpen); 
    }
  };

  return (
    <div
      className={`sidenav ${darkTheme ? "dark-mode" : ""} ${
        isOpen ? "open" : ""
      }`}
    >
      <TooltipWrapper title={isOpen ? "Minimize" : "Maximize"}>
        <div className='menu-toggle' onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? (
            <MenuOpenIcon className='menu-toggle-open' />
          ) : (
            <MenuIcon />
          )}
          {isOpen && <span className='minimized-text'>Minimized</span>}
        </div>
      </TooltipWrapper>

      <div className='divider' />

      <TooltipWrapper title='Theme'>
        <div className='theme-icon-wrapper' onClick={handleThemeClick}>
          <AutoAwesomeIcon />
          {isOpen && (
            <>
              <span className='theme-text'>Theme</span>
              {isThemeMenuOpen ? (
                <KeyboardArrowLeftIcon className='arrow-icon' />
              ) : (
                <KeyboardArrowRightIcon className='arrow-icon' />
              )}
            </>
          )}
        </div>
      </TooltipWrapper>

      {isOpen && isThemeMenuOpen && (
        <div className='submenu'>
          <div
            className={`submenu-item ${!darkTheme ? "active" : ""}`}
            onClick={() => setDarkTheme(false)}
          >
            <FaSun className='theme-icon' /> Light
          </div>
          <div
            className={`submenu-item ${darkTheme ? "active" : ""}`}
            onClick={() => setDarkTheme(true)}
          >
            <FaMoon className='theme-icon' /> Dark
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidenav;
