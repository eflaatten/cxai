import axios from "axios";

/*
const getFlowEndpoint = () =>
  `https://cxf-executor-dev.cxfabric.io/restendpoint` +
  `?tenant_id=${process.env.REACT_APP_TENANT_ID}` +
  `&flow_id=${process.env.REACT_APP_FLOW_ID}`;

const buildFlowHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${process.env.REACT_APP_BEARER_TOKEN}`,
});
*/

const OPENAI_ENDPOINT = "https://api.openai.com/v1/chat/completions";
const CXFABRIC_OLLAMA_ENDPOINT =
  "https://cxf-ollama-dev.cxfabric.io/v1/chat/completions";
const DEFAULT_OPENAI_MODEL = process.env.REACT_APP_OPENAI_MODEL || "gpt-4.1";

const buildOpenAIHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
});

const buildOllamaHeaders = () => ({
  "Content-Type": "application/json",
});

export async function sendChatMessage({ message, provider, signal }) {
  if (provider === "llama3.2:1b") {
    const response = await axios.post(
      CXFABRIC_OLLAMA_ENDPOINT,
      {
        model: provider,
        messages: [{ role: "user", content: message }],
      },
      {
        headers: buildOllamaHeaders(),
        signal,
      }
    );

    return (
      response.data?.choices?.[0]?.message?.content ||
      response.data?.message?.content ||
      response.data?.message ||
      response.data?.error?.message ||
      "I am unable to process your request right now."
    );
  }

  if (!process.env.REACT_APP_OPENAI_API_KEY) {
    throw new Error("Missing REACT_APP_OPENAI_API_KEY for direct OpenAI calls.");
  }

  /*
  const headers = buildFlowHeaders();

  if (provider === "llama3.2:1b") {
    const response = await axios.post(
      getFlowEndpoint(),
      { model: provider, question: message },
      {
        headers,
        signal,
      }
    );

    return (
      response.data?.choices?.[0]?.message?.content ||
      response.data?.message ||
      "I am unable to process your request right now."
    );
  }

  const response = await axios.post(
    getFlowEndpoint(),
    {
      type: "chat",
      model: provider,
      messages: [{ role: "user", content: message }],
      stream: true,
    },
    {
      headers,
      signal,
    }
  );
  */

  const response = await axios.post(
    OPENAI_ENDPOINT,
    {
      model: provider || DEFAULT_OPENAI_MODEL,
      messages: [{ role: "user", content: message }],
    },
    {
      headers: buildOpenAIHeaders(),
      signal,
    }
  );

  return (
    response.data?.choices?.[0]?.message?.content ||
    response.data?.message?.content ||
    response.data?.error?.message ||
    "I am unable to process your request right now."
  );
}
