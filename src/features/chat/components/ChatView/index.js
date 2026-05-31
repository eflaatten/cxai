import { useEffect, useLayoutEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import ChatComposer from "../ChatComposer";
import ChatMessage from "../ChatMessage";
import "../../styles.css";

function ChatView({
  draft,
  isBusy,
  isPreparingResponse,
  isTypingResponse,
  messages,
  onDraftChange,
  onRetryPrompt,
  onSend,
  onStop,
  reasoningMessage,
  streamingMessage,
}) {
  const endRef = useRef(null);
  const hasMessages = messages.length > 0;
  const thinkingText = reasoningMessage || "Thinking…";
  const shouldShowThinking =
    isPreparingResponse || (isTypingResponse && Boolean(reasoningMessage));

  useEffect(() => {
    if (typeof document === "undefined") {
      return undefined;
    }

    document.body.classList.toggle("cxai-empty-state", !hasMessages);

    return () => {
      document.body.classList.remove("cxai-empty-state");
    };
  }, [hasMessages]);

  useLayoutEffect(() => {
    const node = endRef.current;

    if (!node) {
      return;
    }

    const behavior =
      isTypingResponse || streamingMessage ? "auto" : "smooth";

    window.requestAnimationFrame(() => {
      node.scrollIntoView({ behavior, block: "end" });
    });
  }, [
    isPreparingResponse,
    isTypingResponse,
    messages,
    streamingMessage,
  ]);

  const getRetryPrompt = (index) => {
    for (let cursor = index; cursor >= 0; cursor -= 1) {
      if (messages[cursor].role === "user") {
        return messages[cursor].text;
      }
    }

    return "";
  };

  return (
    <section
      className={`chat-view${hasMessages ? " chat-view--thread" : " chat-view--empty"}`}
    >
      <div className="chat-view__scroll">
        {!hasMessages && (
          <section className="chat-view__hero">
            <div className="chat-view__hero-copy">
              <h1>What can I help you with?</h1>
            </div>
          </section>
        )}

        {hasMessages && (
          <div className="chat-view__thread">
            {messages.map((message, index) => {
              const retryPrompt = getRetryPrompt(index);

              return (
                <ChatMessage
                  key={message.id}
                  actionsDisabled={isBusy}
                  message={message}
                  onRetry={
                    retryPrompt ? () => onRetryPrompt(retryPrompt) : undefined
                  }
                />
              );
            })}

            {shouldShowThinking && (
              <div
                className={`chat-view__thinking${
                  reasoningMessage ? " chat-view__thinking--reasoning" : ""
                }`}
              >
                <Loader2 className="chat-view__thinking-icon" />
                <span className="chat-view__thinking-text">{thinkingText}</span>
              </div>
            )}

            {streamingMessage && (
              <ChatMessage
                isStreaming={isTypingResponse}
                message={{ id: "streaming-response", role: "assistant", text: streamingMessage }}
              />
            )}
          </div>
        )}

        <div ref={endRef} />
      </div>

      <div className="chat-view__composer-shell">
        <ChatComposer
          isBusy={isBusy}
          isPreparingResponse={isPreparingResponse}
          isTypingResponse={isTypingResponse}
          onChange={onDraftChange}
          onSend={onSend}
          onStop={onStop}
          placeholder={"Ask anything..."}
          value={draft}
          variant={hasMessages ? "thread" : "hero"}
        />
      </div>
    </section>
  );
}

export default ChatView;
