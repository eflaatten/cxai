import { useEffect, useRef } from "react";
import { StopIcon, UpArrowIcon } from "../../../../assets/icons";
import ModelSwitcher from "../../../../shared/components/ModelSwitcher";

function ChatComposer({
  isBusy,
  modelOptions,
  onChange,
  onSend,
  onStop,
  placeholder,
  provider,
  setProvider,
  value,
  variant = "thread",
}) {
  const textareaRef = useRef(null);

  useEffect(() => {
    if (!textareaRef.current) {
      return;
    }

    textareaRef.current.style.height = "0px";
    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
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
    <div className={`chat-composer chat-composer--${variant}`}>
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
          <div className="chat-composer__actions">
            <ModelSwitcher
              className="chat-composer__model-switcher"
              direction="up"
              modelOptions={modelOptions}
              provider={provider}
              setProvider={setProvider}
              triggerClassName="chat-composer__model-trigger"
            />
          </div>

          <div className="chat-composer__controls">
          <button
            type="button"
            className="chat-composer__button"
            onClick={isBusy ? onStop : onSend}
            disabled={!isBusy && !value.trim()}
            aria-label={isBusy ? "Stop response" : "Send message"}
          >
            {isBusy ? (
              <StopIcon width="18" height="18" />
            ) : (
              <UpArrowIcon color="var(--text-button)" width="18" height="18" />
            )}
          </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatComposer;
