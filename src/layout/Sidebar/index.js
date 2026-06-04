import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Avatar from "@mui/material/Avatar";
import { toast } from "react-toastify";
import {
  EditIcon,
  LogoutIcon,
  MenuIcon,
  MenuOpenIcon,
  SettingsIcon,
} from "../../assets/icons";
import cxfLogo from "../../assets/logos/cxf_logo.png";
import cxfCircle from "../../assets/logos/cxfab_circle.png";
import TooltipWrapper from "../../shared/components/Tooltip";
import { useTheme } from "../../theme";
import "./styles.css";

const summarizeMessage = (text) => {
  const normalized = text.replace(/\s+/g, " ").trim();

  if (normalized.length <= 42) {
    return normalized;
  }

  return `${normalized.slice(0, 42).trim()}...`;
};

function Sidebar({
  historyItems,
  isOpen,
  onCloseSidebar,
  onNewChat,
  onOpenSidebar,
  userEmail,
}) {
  const { selectedTheme, setTheme, themeOptions } = useTheme();
  const [settingsMenuOpen, setSettingsMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [closingMenu, setClosingMenu] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [settingsMenuPosition, setSettingsMenuPosition] = useState(null);
  const [profileMenuPosition, setProfileMenuPosition] = useState(null);
  const settingsButtonRef = useRef(null);
  const profileButtonRef = useRef(null);
  const settingsMenuRef = useRef(null);
  const profileMenuRef = useRef(null);
  const closeTimeoutRef = useRef(null);
  const history = useMemo(
    () =>
      historyItems
        .filter((message) => message.role === "user")
        .slice()
        .reverse()
        .slice(0, 8),
    [historyItems]
  );

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) {
      return undefined;
    }

    const mediaQuery = window.matchMedia("(max-width: 960px)");
    const syncMobileState = (event) => setIsMobile(event.matches);

    syncMobileState(mediaQuery);

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", syncMobileState);
      return () => mediaQuery.removeEventListener("change", syncMobileState);
    }

    mediaQuery.addListener(syncMobileState);
    return () => mediaQuery.removeListener(syncMobileState);
  }, []);

  useEffect(
    () => () => {
      if (closeTimeoutRef.current) {
        window.clearTimeout(closeTimeoutRef.current);
      }
    },
    []
  );

  const clearCloseTimeout = useCallback(() => {
    if (closeTimeoutRef.current) {
      window.clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  }, []);

  const closeFloatingMenu = useCallback(
    (type) => {
      const setMenuOpen =
        type === "settings" ? setSettingsMenuOpen : setProfileMenuOpen;

      if (isMobile) {
        clearCloseTimeout();
        setClosingMenu(type);
        closeTimeoutRef.current = window.setTimeout(() => {
          setMenuOpen(false);
          setClosingMenu(null);
          closeTimeoutRef.current = null;
        }, 180);
        return;
      }

      setMenuOpen(false);
    },
    [clearCloseTimeout, isMobile]
  );

  const toggleFloatingMenu = useCallback(
    (type) => {
      clearCloseTimeout();
      setClosingMenu(null);

      if (type === "settings") {
        if (settingsMenuOpen) {
          closeFloatingMenu("settings");
          return;
        }

        setProfileMenuOpen(false);
        setSettingsMenuOpen(true);
        return;
      }

      if (profileMenuOpen) {
        closeFloatingMenu("profile");
        return;
      }

      setSettingsMenuOpen(false);
      setProfileMenuOpen(true);
    },
    [
      clearCloseTimeout,
      closeFloatingMenu,
      profileMenuOpen,
      settingsMenuOpen,
    ]
  );

  const syncFloatingMenuPosition = useCallback((buttonRef, setPosition, type) => {
    if (!buttonRef.current) {
      return;
    }

    if (isMobile) {
      setPosition({
        bottom: 0,
        left: 0,
        right: 0,
        top: "auto",
        width: "100vw",
      });
      return;
    }

    const rect = buttonRef.current.getBoundingClientRect();
    const sidebarRect = buttonRef.current
      .closest(".sidebar")
      ?.getBoundingClientRect();
    const menuWidth = 238;
    const estimatedMenuHeight = type === "profile" ? 158 : 98;
    const sidebarLeft = sidebarRect?.left ?? 0;
    const sidebarRight = sidebarRect?.right ?? rect.right;
    const left =
      type === "settings"
        ? Math.max(12, sidebarRight - menuWidth - 12)
        : sidebarLeft + 12;
    const top = Math.max(
      16,
      Math.min(rect.top - estimatedMenuHeight - 10, window.innerHeight - estimatedMenuHeight - 16)
    );

    setPosition({
      left,
      top,
      width: menuWidth,
    });
  }, [isMobile]);

  useEffect(() => {
    if (!settingsMenuOpen) {
      return undefined;
    }

    syncFloatingMenuPosition(settingsButtonRef, setSettingsMenuPosition, "settings");

    const handlePointerDown = (event) => {
      if (
        !settingsButtonRef.current?.contains(event.target) &&
        !settingsMenuRef.current?.contains(event.target)
      ) {
        closeFloatingMenu("settings");
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeFloatingMenu("settings");
      }
    };
    const handleViewportChange = () =>
      syncFloatingMenuPosition(settingsButtonRef, setSettingsMenuPosition, "settings");

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
    };
  }, [closeFloatingMenu, settingsMenuOpen, syncFloatingMenuPosition]);

  useEffect(() => {
    if (!profileMenuOpen) {
      return undefined;
    }

    syncFloatingMenuPosition(profileButtonRef, setProfileMenuPosition, "profile");

    const handlePointerDown = (event) => {
      if (
        !profileButtonRef.current?.contains(event.target) &&
        !profileMenuRef.current?.contains(event.target)
      ) {
        closeFloatingMenu("profile");
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeFloatingMenu("profile");
      }
    };
    const handleViewportChange = () =>
      syncFloatingMenuPosition(profileButtonRef, setProfileMenuPosition, "profile");

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
    };
  }, [closeFloatingMenu, profileMenuOpen, syncFloatingMenuPosition]);

  const settingsMenu = (settingsMenuOpen || closingMenu === "settings") && settingsMenuPosition ? (
    <div
      ref={settingsMenuRef}
      className={`sidebar-profile-menu sidebar-profile-menu--settings${
        isMobile ? " sidebar-profile-menu--mobile" : ""
      }${
        isMobile && closingMenu === "settings"
          ? " sidebar-profile-menu--closing"
          : ""
      }`}
      style={settingsMenuPosition}
      onClick={(event) => event.stopPropagation()}
    >
      <div className="sidebar-profile-menu__section">
        <span className="sidebar-profile-menu__label">Theme</span>
        <select
          className="sidebar-profile-menu__select"
          aria-label="Select theme"
          value={selectedTheme}
          onChange={(event) => setTheme(event.target.value)}
        >
          {themeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  ) : null;

  const profileMenu = (profileMenuOpen || closingMenu === "profile") && profileMenuPosition ? (
    <div
      ref={profileMenuRef}
      className={`sidebar-profile-menu sidebar-profile-menu--profile${
        isMobile ? " sidebar-profile-menu--mobile" : ""
      }${
        isMobile && closingMenu === "profile"
          ? " sidebar-profile-menu--closing"
          : ""
      }`}
      style={profileMenuPosition}
      onClick={(event) => event.stopPropagation()}
    >
      <div className="sidebar-profile-menu__account">
        <Avatar className="sidebar__avatar sidebar__avatar--menu">
          {userEmail.slice(0, 1).toUpperCase()}
        </Avatar>
        <div className="sidebar__account-copy">
          <span className="sidebar__account-label">Workspace</span>
          <span className="sidebar__account-value">{userEmail}</span>
        </div>
      </div>
      {isMobile && (
        <div className="sidebar-profile-menu__section">
          <span className="sidebar-profile-menu__label">Theme</span>
          <select
            className="sidebar-profile-menu__select"
            aria-label="Select theme"
            value={selectedTheme}
            onChange={(event) => setTheme(event.target.value)}
          >
            {themeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      )}
      <button
        type="button"
        className="sidebar-profile-menu__item sidebar-profile-menu__item--logout"
        onClick={() => {
          closeFloatingMenu("profile");
          toast.info("Logout is not connected yet.");
        }}
      >
        <LogoutIcon />
        <span>Logout</span>
      </button>
    </div>
  ) : null;

  return (
    <>
      <aside
        className={`sidebar${isOpen ? "" : " sidebar--collapsed"}`}
        onClick={() => {
          if (!isOpen) {
            onOpenSidebar();
          }
        }}
      >
        <div className="sidebar__top">
          <div className="sidebar__brand">
            {isOpen ? (
              <>
                <img
                  className="sidebar__logo sidebar__logo--open"
                  src={cxfLogo}
                  alt="CXAI"
                />
                <button
                  type="button"
                  className="sidebar__chrome-button"
                  aria-label="Collapse sidebar"
                  onClick={onCloseSidebar}
                >
                  <MenuOpenIcon />
                </button>
              </>
            ) : (
              <button
                type="button"
                className="sidebar__brand-button"
                aria-label="Open sidebar"
                onClick={(event) => {
                  event.stopPropagation();
                  onOpenSidebar();
                }}
              >
                <img
                  className="sidebar__logo sidebar__logo--compact"
                  src={cxfCircle}
                  alt="CXAI"
                />
                <span className="sidebar__brand-open-icon">
                  <MenuIcon />
                </span>
              </button>
            )}
          </div>

          <TooltipWrapper
            arrow
            placement={isOpen ? "bottom" : "right"}
            title="Start a new chat"
          >
            <button
              type="button"
              className="sidebar__new-chat"
              onClick={onNewChat}
            >
              <EditIcon className="sidebar__new-chat-icon" />
              {isOpen && <span className="newChat">New chat</span>}
            </button>
          </TooltipWrapper>

          {isOpen && (
            <section className="sidebar__history">
              <div className="sidebar__history-header">
                <p className="sidebar__eyebrow">Recents</p>
                <span className="sidebar__history-count">{history.length}</span>
              </div>

              {history.length > 0 ? (
                <div className="sidebar__history-list">
                  {history.map((message, index) => (
                    <button
                      key={message.id}
                      type="button"
                      className={`sidebar__history-item${
                        index === 0 ? " is-current" : ""
                      }`}
                    >
                      <span className="sidebar__history-item-title">
                        {summarizeMessage(message.text)}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="sidebar__history-empty">
                  Your recent prompts will show up here as chat history.
                </div>
              )}
            </section>
          )}
        </div>

        <div className="sidebar__footer">
          <button
            ref={profileButtonRef}
            type="button"
            className={`sidebar__profile-button${
              isMobile ? " sidebar__profile-button--combined" : ""
            }`}
            aria-label={isMobile ? "Profile and settings" : "Profile"}
            onClick={(event) => {
              event.stopPropagation();
              toggleFloatingMenu("profile");
            }}
          >
            <Avatar className="sidebar__avatar">
              {userEmail.slice(0, 1).toUpperCase()}
            </Avatar>
            {isOpen && (
              <span className="sidebar__profile-name">{userEmail}</span>
            )}
            {isMobile && <SettingsIcon />}
          </button>
          {!isMobile && (
            <TooltipWrapper
              arrow
              placement={isOpen ? "top" : "right"}
              title={settingsMenuOpen ? "" : "Settings"}
            >
              <button
                ref={settingsButtonRef}
                type="button"
                className="sidebar__icon-button"
                aria-label="Settings"
                onClick={(event) => {
                  event.stopPropagation();
                  toggleFloatingMenu("settings");
                }}
              >
                <SettingsIcon />
              </button>
            </TooltipWrapper>
          )}
        </div>
      </aside>
      {typeof document !== "undefined"
        ? createPortal(settingsMenu, document.body)
        : null}
      {typeof document !== "undefined"
        ? createPortal(profileMenu, document.body)
        : null}
    </>
  );
}

export default Sidebar;
