import React, { useRef, useEffect } from "react";
import { FaSun, FaMoon } from "react-icons/fa";
import "./styles/Settings.css";

const Settings = ({ darkTheme, setDarkTheme, onClose }) => {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  return (
    <div
      className={`settings-container ${darkTheme ? "dark-mode" : ""}`}
      ref={menuRef}
    >
      <ul className='theme-options'>
        <li
          className={!darkTheme ? "active" : ""}
          onClick={() => {
            setDarkTheme(false);
            onClose(); 
          }}
        >
          <FaSun className='theme-icon' /> Light
        </li>
        <li
          className={darkTheme ? "active" : ""}
          onClick={() => {
            setDarkTheme(true); 
            onClose(); 
          }}
        >
          <FaMoon className='theme-icon' /> Dark
        </li>
      </ul>
    </div>
  );
};

export default Settings;
