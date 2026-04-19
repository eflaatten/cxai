import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { sendChatMessage } from "../api/chatClient";

const createMessage = (role, text) => ({
  id: `${role}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  role,
  text,
});

export function useChatSession(provider) {
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState([]);
  const [streamingMessage, setStreamingMessage] = useState("");
  const [isPreparingResponse, setIsPreparingResponse] = useState(false);
  const [isRequestInFlight, setIsRequestInFlight] = useState(false);
  const [isTypingResponse, setIsTypingResponse] = useState(false);
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
      setStreamingMessage("");
      setIsTypingResponse(false);
      setIsPreparingResponse(false);
      setIsRequestInFlight(false);
    },
    [appendAssistantMessage, clearTypingTimeout]
  );

  const startTypewriter = useCallback(
    (text) => {
      if (!text?.trim()) {
        setIsTypingResponse(false);
        setStreamingMessage("");
        return;
      }

      clearTypingTimeout();
      setIsTypingResponse(true);
      setStreamingMessage("");
      streamingMessageRef.current = "";

      let nextIndex = 0;
      const writeChunk = () => {
        if (nextIndex >= text.length) {
          clearTypingTimeout();
          appendAssistantMessage(text);
          streamingMessageRef.current = "";
          setStreamingMessage("");
          setIsTypingResponse(false);
          return;
        }

        nextIndex = Math.min(nextIndex + (nextIndex < 120 ? 3 : 6), text.length);
        const partial = text.slice(0, nextIndex);
        streamingMessageRef.current = partial;
        setStreamingMessage(partial);
        typingTimeoutRef.current = window.setTimeout(writeChunk, 18);
      };

      typingTimeoutRef.current = window.setTimeout(writeChunk, 200);
    },
    [appendAssistantMessage, clearTypingTimeout]
  );

  const sendPrompt = useCallback(
    async (prompt, providerOverride = provider) => {
      const trimmedPrompt = prompt.trim();

      if (
        !trimmedPrompt ||
        isPreparingResponse ||
        isRequestInFlight ||
        isTypingResponse
      ) {
        return false;
      }

      setMessages((current) => [...current, createMessage("user", trimmedPrompt)]);
      clearTypingTimeout();
      setStreamingMessage("");
      streamingMessageRef.current = "";
      setIsTypingResponse(false);
      setIsPreparingResponse(true);
      setIsRequestInFlight(true);

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const response = await sendChatMessage({
          message: trimmedPrompt,
          provider: providerOverride,
          signal: controller.signal,
        });

        if (controller.signal.aborted) {
          return false;
        }

        setIsPreparingResponse(false);
        startTypewriter(response);
        return true;
      } catch (error) {
        if (axios.isCancel(error) || error?.name === "CanceledError") {
          return false;
        }

        console.error("Failed to send chat message", error);
        setIsPreparingResponse(false);
        startTypewriter("Something went wrong while processing your message.");
        return false;
      } finally {
        if (abortControllerRef.current === controller) {
          abortControllerRef.current = null;
        }

        setIsRequestInFlight(false);
      }
    },
    [
      clearTypingTimeout,
      isPreparingResponse,
      isRequestInFlight,
      isTypingResponse,
      provider,
      startTypewriter,
    ]
  );

  const sendMessage = useCallback(async () => {
    const trimmedDraft = draft.trim();

    if (!trimmedDraft) {
      return;
    }

    setDraft("");
    await sendPrompt(trimmedDraft, provider);
  }, [draft, provider, sendPrompt]);

  useEffect(() => {
    streamingMessageRef.current = streamingMessage;
  }, [streamingMessage]);

  useEffect(() => () => cancelActiveResponse(false), [cancelActiveResponse]);

  return {
    draft,
    isBusy: isPreparingResponse || isRequestInFlight || isTypingResponse,
    isPreparingResponse,
    isTypingResponse,
    messages,
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
