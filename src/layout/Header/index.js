import { MenuIcon, MenuOpenIcon } from "../../assets/icons";
import "./styles.css";

function Header({ isSidebarOpen, onToggleSidebar }) {
  return (
    <header className="app-header">
      <div className="app-header__left">
        <button
          type="button"
          className="app-header__menu-button"
          aria-label={isSidebarOpen ? "Collapse sidebar" : "Open sidebar"}
          onClick={onToggleSidebar}
        >
          {isSidebarOpen ? <MenuOpenIcon /> : <MenuIcon />}
        </button>
      </div>
    </header>
  );
}

export default Header;
