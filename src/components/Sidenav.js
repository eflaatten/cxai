import React, { useState } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import { CircleX, Sun, Moon } from "lucide-react";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import TooltipWrapper from "./Tooltip";
import "./styles/Sidenav.css";

const Sidenav = ({ darkTheme, setDarkTheme }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);

  const toggleSidenav = () => {
    if (isOpen) {
      setIsThemeMenuOpen(false); 
    }
    setIsOpen(!isOpen);
  };

  const handleThemeClick = () => {
    if (!isOpen) {
      setIsOpen(true);
    } else {
      setIsThemeMenuOpen(!isThemeMenuOpen);
    }
  };

  const closeMenu = () => {
    setIsThemeMenuOpen(false);
  };

  return (
    <div
      className={`sidenav ${darkTheme ? "dark-mode" : ""} ${
        isOpen ? "open" : ""
      } ${isThemeMenuOpen ? "menu-open" : ""}`} 
    >
      <TooltipWrapper
        title={isOpen ? "Minimize" : "Maximize"}
        placement='right'
        darkTheme={darkTheme}
      >
        <div className='menu-toggle' onClick={() => toggleSidenav()}>
          {isOpen ? (
            <MenuOpenIcon className='menu-toggle-open' />
          ) : (
            <MenuIcon />
          )}
          {isOpen && <span className='minimized-text'>Minimize</span>}
        </div>
      </TooltipWrapper>

      <div className='divider' />

      <TooltipWrapper title='Theme' placement='right' darkTheme={darkTheme}>
        <div className='menu-item-wrapper' onClick={handleThemeClick}>
          {isThemeMenuOpen ? (
            <CircleX className='close-icon' onClick={closeMenu} />
          ) : (
            <AutoAwesomeIcon style={{ width: "23px", height: "23px" }} />
          )}
          {isOpen && (
            <>
              <span className='theme-text'>Theme</span>
            </>
          )}
        </div>
      </TooltipWrapper>

      {isOpen && isThemeMenuOpen && (
        <div className='submenu-container'>
          <div className='submenu'>
            <div className='submenu-title'>Select Theme</div>

            <div className="divider" />

            <div
              className={`submenu-item ${!darkTheme ? "active" : ""}`}
              onClick={() => setDarkTheme(false)}
            >
              <Sun className='theme-icon' /> Light
            </div>
            <div
              className={`submenu-item ${darkTheme ? "active" : ""}`}
              onClick={() => setDarkTheme(true)}
            >
              <Moon className='theme-icon' /> Dark
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidenav;
