import { useEffect, useLayoutEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import ChatComposer from "../ChatComposer";
import ChatMessage from "../ChatMessage";
import "../../styles.css";

const quickPrompts = [
  "Summarize this idea into a clear project brief.",
  "Help me draft a concise professional reply.",
  "Turn these notes into a plan with next steps.",
];

function ChatView({
  alternateModelLabel,
  draft,
  isBusy,
  isPreparingResponse,
  isTypingResponse,
  messages,
  modelOptions,
  onDraftChange,
  onRetryPrompt,
  onRetryWithOtherModel,
  onSend,
  onStop,
  onSuggestionSelect,
  provider,
  setProvider,
  streamingMessage,
}) {
  const endRef = useRef(null);
  const hasMessages = messages.length > 0;

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
              <span className="chat-view__eyebrow">CXAI Workspace</span>
              <h1>Ask anything...</h1>
              <p>Choose a quick prompt to get started</p>
            </div>

            <div className="chat-view__prompt-grid">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  className="chat-view__prompt"
                  onClick={() => onSuggestionSelect(prompt)}
                >
                  {prompt}
                </button>
              ))}
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
                  alternateModelLabel={alternateModelLabel}
                  message={message}
                  onRetry={
                    retryPrompt ? () => onRetryPrompt(retryPrompt) : undefined
                  }
                  onRetryWithOtherModel={
                    retryPrompt && alternateModelLabel
                      ? () => onRetryWithOtherModel(retryPrompt)
                      : undefined
                  }
                />
              );
            })}

            {isPreparingResponse && (
              <div className="chat-view__thinking">
                <Loader2 className="chat-view__thinking-icon" />
                <span>Thinking…</span>
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
          modelOptions={modelOptions}
          onChange={onDraftChange}
          onSend={onSend}
          onStop={onStop}
          placeholder={hasMessages ? "Message CXAI..." : "Ask anything..."}
          provider={provider}
          setProvider={setProvider}
          value={draft}
          variant={hasMessages ? "thread" : "hero"}
        />
      </div>
    </section>
  );
}

export default ChatView;
