import { MenuIcon } from "../../assets/icons";
import "./styles.css";

function Header({ isSidebarOpen, onToggleSidebar }) {
  return (
    <header className="app-header">
      <div className="app-header__left">
        {!isSidebarOpen && (
          <button
            type="button"
            className="app-header__menu-button"
            aria-label="Open sidebar"
            onClick={onToggleSidebar}
          >
            <MenuIcon />
          </button>
        )}
      </div>
    </header>
  );
}

export default Header;
