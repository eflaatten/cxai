import axios from "axios";

const getEndpoint = () =>
  `https://cxf-executor-dev.cxfabric.io/restendpoint` +
  `?tenant_id=${process.env.REACT_APP_TENANT_ID}` +
  `&flow_id=${process.env.REACT_APP_FLOW_ID}`;

const buildHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${process.env.REACT_APP_BEARER_TOKEN}`,
});

export async function sendChatMessage({ message, provider, signal }) {
  const headers = buildHeaders();

  if (provider === "llama3.2:1b") {
    const response = await axios.post(
      getEndpoint(),
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
    getEndpoint(),
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

  return (
    response.data?.choices?.[0]?.message?.content ||
    response.data?.message ||
    "I am unable to process your request right now."
  );
}