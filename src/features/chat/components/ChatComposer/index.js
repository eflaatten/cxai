import { useEffect, useRef, useState } from "react";
import { StopIcon, UpArrowIcon } from "../../../../assets/icons";

function ChatComposer({
  isBusy,
  onChange,
  onSend,
  onStop,
  placeholder,
  value,
  variant = "thread",
}) {
  const textareaRef = useRef(null);
  const [isMultiline, setIsMultiline] = useState(false);

  useEffect(() => {
    if (!textareaRef.current) {
      return;
    }

    textareaRef.current.style.height = "0px";
    const nextHeight = textareaRef.current.scrollHeight;
    textareaRef.current.style.height = `${nextHeight}px`;
    setIsMultiline(nextHeight > 48);
  }, [value]);

  const handleKeyDown = (event) => {
    if (event.key === "Escape" && isBusy) {
      event.preventDefault();
      onStop();
      return;
    }

    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();

      if (isBusy) {
        return;
      }

      onSend();
    }
  };

  return (
    <div
      className={`chat-composer chat-composer--${variant}${
        isMultiline ? " chat-composer--multiline" : ""
      }`}
    >
      <div className="chat-composer__frame">
        <textarea
          ref={textareaRef}
          className="chat-composer__textarea"
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
        />

        <div className="chat-composer__footer">
          <div className="chat-composer__controls">
            <button
              type="button"
              className="chat-composer__button"
              onClick={isBusy ? onStop : onSend}
              disabled={!isBusy && !value.trim()}
              aria-label={isBusy ? "Stop response" : "Send message"}
            >
              {isBusy ? (
                <StopIcon width="20" height="20" />
              ) : (
                <UpArrowIcon color="var(--text-button)" width="21" height="21" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatComposer;
