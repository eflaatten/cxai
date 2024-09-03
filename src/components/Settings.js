import React, { useEffect } from "react";

const Settings = ({ darkTheme, toggleTheme }) => {

  return (
    <div className={`settings-container ${darkTheme ? 'dark-mode' : ''}`}>
      <label className={`settings-label ${darkTheme ? 'dark-mode' : ''}`}  htmlFor='theme-toggle'>Dark Mode</label>
      <div className='switch'>
        <input
          type='checkbox'
          id='theme-toggle'
          checked={darkTheme}
          onChange={toggleTheme}
        />
        <span className={`slider round ${darkTheme ? 'dark-mode' : ''}`}></span>
      </div>
    </div>
  );
};

export default Settings;