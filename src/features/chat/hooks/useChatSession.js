import { useCallback, useEffect, useRef, useState } from "react";
import { sendChatMessage } from "../api/chatClient";

const createMessage = (role, text) => ({
  id: `${role}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  role,
  text,
});

export function useChatSession() {
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState([]);
  const [reasoningMessage, setReasoningMessage] = useState("");
  const [streamingMessage, setStreamingMessage] = useState("");
  const [phase, setPhase] = useState("idle");
  const abortControllerRef = useRef(null);
  const streamingMessageRef = useRef("");
  const typingTimeoutRef = useRef(null);

  const clearTypingTimeout = useCallback(() => {
    if (typingTimeoutRef.current) {
      window.clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  }, []);

  const appendAssistantMessage = useCallback((text) => {
    if (!text?.trim()) {
      return;
    }

    setMessages((current) => [...current, createMessage("assistant", text)]);
  }, []);

  const cancelActiveResponse = useCallback(
    (preservePartial = false) => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }

      clearTypingTimeout();

      if (preservePartial && streamingMessageRef.current.trim()) {
        appendAssistantMessage(streamingMessageRef.current);
      }

      streamingMessageRef.current = "";
      setReasoningMessage("");
      setStreamingMessage("");
      setPhase("idle");
    },
    [appendAssistantMessage, clearTypingTimeout]
  );

  const startTypewriter = useCallback(
    (text) => {
      if (!text?.trim()) {
        setPhase("idle");
        setStreamingMessage("");
        setReasoningMessage("");
        return;
      }

      clearTypingTimeout();
      setPhase("typing");
      setStreamingMessage("");
      streamingMessageRef.current = "";

      let nextIndex = 0;
      const writeChunk = () => {
        if (nextIndex >= text.length) {
          clearTypingTimeout();
          appendAssistantMessage(text);
          streamingMessageRef.current = "";
          setStreamingMessage("");
          setReasoningMessage("");
          setPhase("idle");
          return;
        }

        const currentCharacter = text[nextIndex];
        const step =
          currentCharacter === "\n"
            ? 3
            : /[.!?]/.test(currentCharacter)
              ? 4
              : nextIndex < 180
                ? 5
                : 8;
        const delay =
          currentCharacter === "\n"
            ? 12
            : /[,:;]/.test(currentCharacter)
              ? 14
              : /[.!?]/.test(currentCharacter)
                ? 18
                : 9;

        nextIndex = Math.min(nextIndex + step, text.length);
        const partial = text.slice(0, nextIndex);
        streamingMessageRef.current = partial;
        setStreamingMessage(partial);
        typingTimeoutRef.current = window.setTimeout(writeChunk, delay);
      };

      typingTimeoutRef.current = window.setTimeout(writeChunk, 70);
    },
    [appendAssistantMessage, clearTypingTimeout]
  );

  const sendPrompt = useCallback(
    async (prompt) => {
      const trimmedPrompt = prompt.trim();

      if (!trimmedPrompt || phase !== "idle") {
        return false;
      }

      setMessages((current) => [...current, createMessage("user", trimmedPrompt)]);
      clearTypingTimeout();
      setStreamingMessage("");
      setReasoningMessage("");
      streamingMessageRef.current = "";
      setPhase("thinking");

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const response = await sendChatMessage({
          message: trimmedPrompt,
          onReasoning: (reasoning) => setReasoningMessage(reasoning),
          signal: controller.signal,
        });

        if (controller.signal.aborted) {
          return false;
        }

        if (response?.reasoning?.trim()) {
          setReasoningMessage(response.reasoning);
        }

        const assistantText = response?.text?.trim()
          ? response.text
          : "I am unable to process your request right now.";

        startTypewriter(assistantText);
        return true;
      } catch (error) {
        if (error?.name === "AbortError" || error?.name === "CanceledError") {
          return false;
        }

        console.error("Failed to send chat message", error);
        setPhase("idle");
        setReasoningMessage("");
        startTypewriter("Something went wrong while processing your message.");
        return false;
      } finally {
        if (abortControllerRef.current === controller) {
          abortControllerRef.current = null;
        }
      }
    },
    [clearTypingTimeout, phase, startTypewriter]
  );

  const sendMessage = useCallback(async () => {
    const trimmedDraft = draft.trim();

    if (!trimmedDraft) {
      return;
    }

    setDraft("");
    await sendPrompt(trimmedDraft);
  }, [draft, sendPrompt]);

  useEffect(() => {
    streamingMessageRef.current = streamingMessage;
  }, [streamingMessage]);

  useEffect(() => () => cancelActiveResponse(false), [cancelActiveResponse]);

  return {
    draft,
    isBusy: phase !== "idle",
    isPreparingResponse: phase === "thinking",
    isTypingResponse: phase === "typing",
    messages,
    reasoningMessage,
    resetChat: () => {
      cancelActiveResponse(false);
      setDraft("");
      setMessages([]);
    },
    sendPrompt,
    sendMessage,
    setDraft,
    stopResponse: () => cancelActiveResponse(true),
    streamingMessage,
  };
}
