import { useEffect, useMemo, useRef, useState } from "react";
import {
  CheckIcon,
  DownArrowIcon,
  UpArrowIcon2,
} from "../../../assets/icons";
import "./styles.css";

function Dropdown({
  align = "left",
  ariaLabel,
  className = "",
  closeOnSelect = true,
  direction = "down",
  onSelect,
  options,
  placeholder = "Select",
  renderTrigger,
  showCheck = true,
  triggerClassName = "",
  value,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const currentOption = useMemo(
    () => options.find((option) => option.value === value) ?? null,
    [options, value]
  );

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handlePointerDown = (event) => {
      if (!containerRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const toggleMenu = () => setIsOpen((current) => !current);

  const dropdownClasses = [
    "dropdown",
    `dropdown--${align}`,
    `dropdown--${direction}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const renderDefaultTrigger = () => (
    <button
      type="button"
      className={["dropdown__trigger", triggerClassName].filter(Boolean).join(" ")}
      aria-expanded={isOpen}
      aria-haspopup="menu"
      aria-label={ariaLabel}
      onClick={toggleMenu}
    >
      <span className="dropdown__trigger-main">
        {currentOption?.icon ? (
          <span className="dropdown__trigger-icon">{currentOption.icon}</span>
        ) : null}
        <span className="dropdown__trigger-label">
          {currentOption?.label ?? placeholder}
        </span>
      </span>
      {isOpen ? (
        <UpArrowIcon2 color="currentColor" width="18px" height="18px" />
      ) : (
        <DownArrowIcon color="currentColor" width="18px" height="18px" />
      )}
    </button>
  );

  return (
    <div
      ref={containerRef}
      className={dropdownClasses}
      onClick={(event) => event.stopPropagation()}
    >
      {renderTrigger
        ? renderTrigger({
            currentOption,
            isOpen,
            setIsOpen,
            toggleMenu,
          })
        : renderDefaultTrigger()}

      {isOpen && (
        <div className="dropdown__menu" role="menu">
          {options.map((option) => {
            const isSelected = option.value === value;

            return (
              <button
                key={option.value}
                type="button"
                className={`dropdown__option${
                  isSelected ? " dropdown__option--selected" : ""
                }`}
                role="menuitem"
                onClick={() => {
                  onSelect?.(option);

                  if (closeOnSelect) {
                    setIsOpen(false);
                  }
                }}
              >
                <span className="dropdown__option-main">
                  {option.icon ? (
                    <span className="dropdown__option-icon">{option.icon}</span>
                  ) : null}
                  <span className="dropdown__option-label">{option.label}</span>
                </span>
                {showCheck && isSelected ? (
                  <CheckIcon color="currentColor" width="18px" height="18px" />
                ) : null}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Dropdown;
