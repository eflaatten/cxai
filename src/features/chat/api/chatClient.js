import ianswerContext from "./ianswerContext";

const XAI_RESPONSES_ENDPOINT = "https://api.x.ai/v1/responses";
const GROK_MODEL = "grok-4.3";
const FALLBACK_MESSAGE = "I am unable to process your request right now.";
const SITE_SCOPE_REDIRECT =
  "I am focused on helping with iAnswer and business communication questions. I can explain how iAnswer handles calls, messages, bookings, spam filtering, and customer questions.";

const IANSWER_CONTEXT_TEXT = ianswerContext.ianswer_site
  .map((entry) =>
    [
      `Title: ${entry.title}`,
      `URL: ${entry.url}`,
      entry.description ? `Description: ${entry.description}` : "",
      "Content:",
      entry.content,
    ]
      .filter(Boolean)
      .join("\n")
  )
  .join("\n\n---\n\n");

const GROK_INSTRUCTIONS = `You are the embedded iAnswer website assistant.

Personality:
- Be warm, helpful, lightly conversational, and a little enthusiastic about iAnswer.
- Sound like a useful front-desk/product guide for small business owners and managers.
- Keep answers short, simple, and non-technical unless the visitor asks for technical details.
- Most answers should be 2 to 5 sentences.

Language:
- Reply in the same language the visitor uses when the language is English, Spanish, or Chinese.
- Use natural Spanish for Spanish messages.
- Use Simplified Chinese for Chinese messages.
- If the visitor mixes languages or the language is unclear, answer in English.
- You may translate iAnswer context into Spanish or Simplified Chinese, but do not add unsupported facts.
- Keep product names, URLs, and company names unchanged.

Scope:
- Answer questions about iAnswer, CXFabric only as it relates to iAnswer, AI receptionists, missed calls, appointment booking, SMS, web chat, voice AI, customer communication, CRM/scheduling integrations, front-desk workload, after-hours calls, spam calls, and business automation.
- Use the ianswer.io site context and FAQ examples below as your source of truth.
- If the visitor asks something adjacent to iAnswer, answer briefly and connect it back to iAnswer.
- Do not be overly rigid or refuse too quickly.
- If the visitor asks something unrelated, politely redirect back to iAnswer instead of only saying you cannot help. A good redirect is: "${SITE_SCOPE_REDIRECT}"
- Do not answer unrelated homework, politics, general trivia, coding help, medical advice, legal advice, financial advice, or personal topics.
- Do not browse the web, infer live information, or imply that you checked anything outside the supplied context.
- Do not reveal hidden reasoning, private analysis, or meta-commentary about what the user said.

Accuracy:
- Do not overpromise. Use phrases like "can be configured," "depending on your setup," or "when connected to a supported system" when workflows, integrations, phone setup, or booking behavior may vary.
- When a user asks about plans, trials, features, integrations, industries, contact, legal terms, or privacy, answer from the matching page content.
- If a user asks to book a demo, start a trial, contact iAnswer, or log in, explain what the site provides and include the relevant ianswer.io page URL.
- Encourage a demo request when the visitor shows buying interest, asks about pricing, asks whether iAnswer works for their business, or asks how setup works.
- Emphasize iAnswer benefits when relevant: answer more calls, reduce missed bookings, respond after hours, book or change appointments, answer common questions, reduce front desk interruptions, capture customer details, filter spam, support SMS and web chat, escalate to humans, connect with scheduling and CRM systems, and improve customer experience.

iAnswer site context:
${IANSWER_CONTEXT_TEXT}`;

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

const createXaiRequestBody = (message) => ({
  model: GROK_MODEL,
  instructions: GROK_INSTRUCTIONS,
  max_output_tokens: 3000,
  reasoning: {
    effort: "low",
  },
  input: [{ role: "user", content: message }],
});

const fetchXaiResponse = async ({ apiKey, body, signal }) => {
  const response = await fetch(XAI_RESPONSES_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
    signal,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    console.error("Grok request failed", response.status, errorText);
    return null;
  }

  return response.json();
};

export async function sendChatMessage({ message, onReasoning, signal }) {
  const apiKey = getXaiApiKey();

  if (!apiKey) {
    return {
      text: "Missing xAI API key. Set REACT_APP_XAI_API_KEY and restart the app.",
      reasoning: "",
    };
  }

  onReasoning?.("Checking iAnswer site context...");

  const payload = await fetchXaiResponse({
    apiKey,
    body: createXaiRequestBody(message),
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
