const XAI_RESPONSES_ENDPOINT = "https://api.x.ai/v1/responses";
const GROK_MODEL = "grok-4.3";

const GROK_INSTRUCTIONS = `You are a task-oriented assistant.

Guidelines:
- Break complex requests into clear steps in the final answer when useful
- If you are uncertain, say so rather than guessing
- Do not reveal hidden reasoning, private analysis, or meta-commentary about what the user said
- For simple tests or greetings, answer directly

Format: Keep answers concise and useful.`;

const FALLBACK_MESSAGE = "I am unable to process your request right now.";

const getXaiApiKey = () =>
  process.env.REACT_APP_XAI_API_KEY || process.env.XAI_API_KEY || "";

const getTextFromContent = (content) => {
  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((item) => item?.text || item?.content || "")
      .filter(Boolean)
      .join("");
  }

  return "";
};

const extractAssistantMessage = (payload, depth = 0) => {
  if (!payload || depth > 5) {
    return "";
  }

  if (typeof payload === "string") {
    return payload;
  }

  if (Array.isArray(payload)) {
    return payload
      .map((item) => extractAssistantMessage(item, depth + 1))
      .filter(Boolean)
      .join("");
  }

  const directText =
    getTextFromContent(payload.delta) ||
    getTextFromContent(payload.text) ||
    getTextFromContent(payload.output_text) ||
    getTextFromContent(payload.content) ||
    getTextFromContent(payload.error?.message);

  if (directText) {
    return directText;
  }

  return (
    extractAssistantMessage(payload.output, depth + 1) ||
    extractAssistantMessage(payload.response?.output, depth + 1) ||
    extractAssistantMessage(payload.message?.content, depth + 1)
  );
};

const extractStreamingDelta = (payload) => {
  if (!payload || typeof payload !== "object") {
    return "";
  }

  const type = String(payload.type || "");

  if (!type.includes("output_text") || !type.includes("delta")) {
    return "";
  }

  return (
    getTextFromContent(payload.delta) ||
    getTextFromContent(payload.output_text?.delta) ||
    getTextFromContent(payload.text?.delta)
  );
};

const extractReasoningDelta = (payload) => {
  if (!payload || typeof payload !== "object") {
    return "";
  }

  const type = String(payload.type || "");

  if (!type.includes("reasoning") || !type.includes("delta")) {
    return "";
  }

  return (
    getTextFromContent(payload.delta) ||
    getTextFromContent(payload.summary?.delta) ||
    getTextFromContent(payload.text?.delta)
  );
};

const splitVisibleReasoning = (text) => {
  const normalized = text.trim();
  const leadInPattern =
    /^((?:"?The user(?:'s)?(?: message)? (?:said|says|asked|is asking|wants|sent|provided|is just|seems|probably|appears)[\s\S]*?)(?:\n+|(?=\*\*)|(?=[A-Z][^\n]{0,80}[!?])))/i;
  const match = normalized.match(leadInPattern);

  if (!match) {
    return { answer: normalized, reasoning: "" };
  }

  const reasoning = match[1].trim();
  const answer = normalized.slice(match[1].length).trim();

  if (!answer) {
    return { answer: normalized, reasoning: "" };
  }

  return { answer, reasoning };
};

const parseStreamingChunk = (chunk) => {
  if (!chunk.trim()) {
    return { answerDelta: "", reasoningDelta: "" };
  }

  return chunk
    .split("\n")
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.replace(/^data:\s*/, "").trim())
    .filter((line) => line && line !== "[DONE]")
    .reduce(
      (accumulator, line) => {
        try {
          const payload = JSON.parse(line);
          accumulator.answerDelta += extractStreamingDelta(payload);
          accumulator.reasoningDelta += extractReasoningDelta(payload);
        } catch {
          return accumulator;
        }
        return accumulator;
      },
      { answerDelta: "", reasoningDelta: "" }
    );
};

export async function sendChatMessage({ message, onReasoning, signal }) {
  const apiKey = getXaiApiKey();

  if (!apiKey) {
    return {
      text: "Missing xAI API key. Set REACT_APP_XAI_API_KEY and restart the app.",
      reasoning: "",
    };
  }

  const response = await fetch(XAI_RESPONSES_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROK_MODEL,
      instructions: GROK_INSTRUCTIONS,
      max_output_tokens: 1000000,
      tools: [{ type: "web_search" }],
      reasoning: {
        effort: "low",
      },
      stream: true,
      input: message,
    }),
    signal,
  });

  if (!response.ok) {
    return { text: FALLBACK_MESSAGE, reasoning: "" };
  }

  if (!response.body) {
    const payload = await response.json();
    const { answer, reasoning } = splitVisibleReasoning(
      extractAssistantMessage(payload) || FALLBACK_MESSAGE
    );

    return { text: answer, reasoning };
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let assistantMessage = "";
  let reasoningMessage = "";

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const chunks = buffer.split("\n\n");
    buffer = chunks.pop() || "";

    for (const chunk of chunks) {
      const { answerDelta, reasoningDelta } = parseStreamingChunk(chunk);
      assistantMessage += answerDelta;

      if (reasoningDelta) {
        reasoningMessage += reasoningDelta;
        onReasoning?.(reasoningMessage.trim());
      }
    }
  }

  const { answerDelta, reasoningDelta } = parseStreamingChunk(buffer);
  assistantMessage += answerDelta;

  if (reasoningDelta) {
    reasoningMessage += reasoningDelta;
    onReasoning?.(reasoningMessage.trim());
  }

  const { answer, reasoning } = splitVisibleReasoning(
    assistantMessage.trim() || FALLBACK_MESSAGE
  );
  const finalReasoning = reasoningMessage.trim() || reasoning;

  if (finalReasoning) {
    onReasoning?.(finalReasoning);
  }

  return {
    text: answer,
    reasoning: finalReasoning,
  };
}
