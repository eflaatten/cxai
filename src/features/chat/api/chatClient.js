import axios from "axios";

//const CXFABRIC_EXECUTOR_ENDPOINT = `https://cxf-executor-dev.cxfabric.io/restendpoint?tenant_id=${process.env.REACT_APP_TENANT_ID}&flow_id=${process.env.REACT_APP_FLOW_ID}&draft=true&targetUserId=${process.env.REACT_APP_USER_ID}&displayExecutionLogs=true`;
const CXFABRIC_EXECUTOR_ENDPOINT = `https://cxf-executor-dev.cxfabric.io/restendpoint?tenant_id=cus_QZ2vTHtqYrOmud&flow_id=3cdf6db1-d2c3-4408-889d-a542c78ab2c9&draft=true&targetUserId=auth0|67bdf583d7397dc4f217a8e0&displayExecutionLogs=true`; // replace with extended rest trigger endpoint
// const UBUNTU_SERVER_ENDPOINT = `${process.env.REACT_APP_UBUNTU_SERVER_URL}/api/rag`;

const buildExecutorHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
});

const FALLBACK_MESSAGE = "I am unable to process your request right now.";

const getTextFromContent = (content) => {
  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((item) => {
        if (typeof item === "string") {
          return item;
        }

        return item?.text || item?.content || "";
      })
      .filter(Boolean)
      .join("");
  }

  return "";
};

const extractAssistantMessage = (payload, depth = 0) => {
  if (!payload || depth > 4) {
    return "";
  }

  if (typeof payload === "string") {
    return payload;
  }

  if (Array.isArray(payload)) {
    for (const item of payload) {
      const text = extractAssistantMessage(item, depth + 1);

      if (text) {
        return text;
      }
    }

    return "";
  }

  const choice = payload.choices?.[0];
  const choiceText =
    getTextFromContent(choice?.message?.content) ||
    getTextFromContent(choice?.delta?.content) ||
    getTextFromContent(choice?.text);

  if (choiceText) {
    return choiceText;
  }

  const directText =
    getTextFromContent(payload.message?.content) ||
    getTextFromContent(payload.message) ||
    getTextFromContent(payload.content) ||
    getTextFromContent(payload.answer) ||
    getTextFromContent(payload.output_text) ||
    getTextFromContent(payload.response) ||
    getTextFromContent(payload.error?.message);

  if (directText) {
    return directText;
  }

  return (
    extractAssistantMessage(payload.data, depth + 1) ||
    extractAssistantMessage(payload.result, depth + 1) ||
    extractAssistantMessage(payload.response, depth + 1) ||
    extractAssistantMessage(payload.output, depth + 1)
  );
};

export async function sendChatMessage({ message, provider, signal }) {
  let assistantMessage = "";
  try {
    let response;
    if (provider === "llama3.2:1b" || provider === "gemma4:e4b-it-q4_K_M") {
      response = await axios.post(
        CXFABRIC_EXECUTOR_ENDPOINT,
        { model: provider, question: message },
        { signal }
      );
    } else {
      response = await axios.post(
        CXFABRIC_EXECUTOR_ENDPOINT,
        {
          model: provider,
          messages: [{ role: "user", content: message }],
        },
        {
          headers: buildExecutorHeaders(),
          signal,
        }
      );
    }
    assistantMessage =
      extractAssistantMessage(response?.data) || FALLBACK_MESSAGE;
    return assistantMessage;
  } catch (err) {
    return FALLBACK_MESSAGE;
  }
}

// export async function sendChatMessage({ message, provider, signal }) {
//   try {
//     const response = await axios.post(
//       UBUNTU_SERVER_ENDPOINT,
//       { question: message },
//       { signal }
//     );
//     const assistantMessage =
//       response.data?.answer || "I am unable to process your request right now.";
//     return assistantMessage;
//   } catch (err) {
//     return "I am unable to process your request right now.";
//   }
// }
