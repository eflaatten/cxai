import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Avatar from "@mui/material/Avatar";
import { toast } from "react-toastify";
import {
  CloseIcon,
  EditIcon,
  LogoutIcon,
  MoonIcon,
  NightIcon,
  SettingsIcon,
  SunIcon,
} from "../../assets/icons";
import cxfCircle from "../../assets/logos/cxfab_circle.png";
import cxfLogo from "../../assets/logos/cxf_logo.png";
import Dropdown from "../../shared/components/Dropdown";
import ModelSwitcher from "../../shared/components/ModelSwitcher";
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
  modelOptions,
  onNewChat,
  provider,
  setProvider,
  userEmail,
}) {
  const { selectedTheme, setTheme, themeOptions } = useTheme();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [profileMenuPosition, setProfileMenuPosition] = useState(null);
  const profileButtonRef = useRef(null);
  const profileMenuRef = useRef(null);
  const history = useMemo(
    () =>
      historyItems
        .filter((message) => message.role === "user")
        .slice()
        .reverse()
        .slice(0, 8),
    [historyItems]
  );
  const themedOptions = useMemo(
    () =>
      themeOptions.map((option) => {
        const icons = {
          light: <SunIcon width="18px" height="18px" />,
          dark: <MoonIcon width="18px" height="18px" />,
          system: <NightIcon width="18px" height="18px" />,
        };

        return {
          ...option,
          icon: icons[option.value],
        };
      }),
    [themeOptions]
  );

  const syncProfileMenuPosition = useCallback(() => {
    if (!profileButtonRef.current) {
      return;
    }

    const rect = profileButtonRef.current.getBoundingClientRect();
    const menuWidth = 224;
    const left = Math.max(16, rect.right - menuWidth);

    setProfileMenuPosition({
      left,
      top: rect.top - 12,
      width: menuWidth,
    });
  }, []);

  useEffect(() => {
    if (!dialogOpen) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setDialogOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dialogOpen]);

  useEffect(() => {
    if (!profileMenuOpen) {
      return undefined;
    }

    syncProfileMenuPosition();

    const handlePointerDown = (event) => {
      if (
        !profileButtonRef.current?.contains(event.target) &&
        !profileMenuRef.current?.contains(event.target)
      ) {
        setProfileMenuOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setProfileMenuOpen(false);
      }
    };
    const handleViewportChange = () => syncProfileMenuPosition();

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
  }, [profileMenuOpen, syncProfileMenuPosition]);

  useEffect(() => {
    if (dialogOpen) {
      setProfileMenuOpen(false);
    }
  }, [dialogOpen]);

  const profileMenu = profileMenuOpen && profileMenuPosition ? (
    <div
      ref={profileMenuRef}
      className="sidebar-profile-menu"
      style={profileMenuPosition}
      onClick={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        className="sidebar-profile-menu__item"
        onClick={() => {
          setProfileMenuOpen(false);
          setDialogOpen(true);
        }}
      >
        <SettingsIcon />
        <span>Settings</span>
      </button>
      <button
        type="button"
        className="sidebar-profile-menu__item"
        onClick={() => {
          setProfileMenuOpen(false);
          toast.info("Logout is not connected yet.");
        }}
      >
        <LogoutIcon />
        <span>Logout</span>
      </button>
    </div>
  ) : null;

  const dialog = dialogOpen ? (
    <div
      className="sidebar-dialog-backdrop"
      onClick={() => setDialogOpen(false)}
    >
      <div
        className="sidebar-dialog"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sidebar-dialog__header">
          <div>
            <p className="sidebar-dialog__eyebrow">Preferences</p>
            <h2>Workspace settings</h2>
          </div>
          <button
            type="button"
            className="sidebar-dialog__close"
            onClick={() => setDialogOpen(false)}
            aria-label="Close settings"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="sidebar-dialog__row">
          <span className="sidebar-dialog__label">Theme</span>
          <Dropdown
            ariaLabel="Select theme"
            options={themedOptions}
            value={selectedTheme}
            onSelect={(option) => setTheme(option.value)}
          />
        </div>

        <div className="sidebar-dialog__row">
          <span className="sidebar-dialog__label">Model</span>
          <ModelSwitcher
            modelOptions={modelOptions}
            provider={provider}
            setProvider={setProvider}
          />
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <aside className={`sidebar${isOpen ? "" : " sidebar--collapsed"}`}>
        <div className="sidebar__top">
          <div className="sidebar__brand">
            <img
              className={`sidebar__logo${isOpen ? "" : " sidebar__logo--compact"}`}
              src={isOpen ? cxfLogo : cxfCircle}
              alt="CXAI"
            />
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
              <EditIcon
                className="sidebar__new-chat-icon"
                color="var(--text-button)"
              />
              {isOpen && <span className="newChat">New chat</span>}
            </button>
          </TooltipWrapper>

          {isOpen && (
            <section className="sidebar__history">
              <div className="sidebar__history-header">
                <p className="sidebar__eyebrow">History</p>
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
                      <span className="sidebar__history-item-meta">
                        {index === 0 ? "Current chat" : "Earlier in thread"}
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
            className="sidebar__profile-button"
            onClick={() => setProfileMenuOpen((current) => !current)}
          >
            <Avatar className="sidebar__avatar">
              {userEmail.slice(0, 1).toUpperCase()}
            </Avatar>
            {isOpen && (
              <div className="sidebar__account-copy">
                <span className="sidebar__account-label">Workspace</span>
                <span className="sidebar__account-value">{userEmail}</span>
              </div>
            )}
          </button>
        </div>
      </aside>
      {typeof document !== "undefined"
        ? createPortal(profileMenu, document.body)
        : null}
      {typeof document !== "undefined" ? createPortal(dialog, document.body) : null}
    </>
  );
}

export default Sidebar;
