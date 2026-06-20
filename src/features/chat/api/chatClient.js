const IANSWER_FLOW_ENDPOINT =
  process.env.REACT_APP_IANSWER_FLOW_URL ||
  "https://cxf-executor-qa.cxfabric.io/restendpoint?tenant_id=9fcac836-e609-4001-a194-3adfc1e1b66e&flow_id=14518808-f294-45f4-b267-f356219c9543&draft=true";

const FALLBACK_MESSAGE = "I am unable to process your request right now.";

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

const parseJsonString = (value) => {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  if (!trimmed || !/^[{[]/.test(trimmed)) {
    return null;
  }

  try {
    return JSON.parse(trimmed);
  } catch {
    return null;
  }
};

const extractAssistantMessage = (payload, depth = 0) => {
  if (!payload || depth > 7) {
    return "";
  }

  const parsedPayload = parseJsonString(payload);

  if (parsedPayload) {
    return extractAssistantMessage(parsedPayload, depth + 1);
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
    extractAssistantMessage(payload.data, depth + 1) ||
    extractAssistantMessage(payload.outputData, depth + 1) ||
    extractAssistantMessage(payload.response, depth + 1) ||
    extractAssistantMessage(payload.result, depth + 1) ||
    extractAssistantMessage(payload.message?.content, depth + 1)
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

const createFlowRequestBody = (message) => ({
  message,
  body: {
    message,
  },
});

const fetchFlowResponse = async ({ body, signal }) => {
  const response = await fetch(IANSWER_FLOW_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    signal,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    console.error("iAnswer flow request failed", response.status, errorText);
    return null;
  }

  const responseText = await response.text();
  const parsedResponse = parseJsonString(responseText);

  return parsedResponse || responseText;
};

export async function sendChatMessage({ message, onReasoning, signal }) {
  onReasoning?.("Checking iAnswer flow...");

  const payload = await fetchFlowResponse({
    body: createFlowRequestBody(message),
    signal,
  });

  if (!payload) {
    return { text: FALLBACK_MESSAGE, reasoning: "" };
  }

  const { answer, reasoning } = splitVisibleReasoning(
    extractAssistantMessage(payload) || FALLBACK_MESSAGE
  );

  if (reasoning) {
    onReasoning?.(reasoning);
  }

  return {
    text: answer,
    reasoning,
  };
}
