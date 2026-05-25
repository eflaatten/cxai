const XAI_RESPONSES_ENDPOINT = "https://api.x.ai/v1/responses";
const GROK_MODEL = "grok-4.3";
const OPEN_METEO_GEOCODING_ENDPOINT =
  "https://geocoding-api.open-meteo.com/v1/search";
//https://cxf-executor-qa.cxfabric.io/restendpoint?tenant_id=bb40a7e5-3721-4bc9-b430-aa980a8e9918&flow_id=6ebddf47-3694-4336-90af-578f10d6cb6c&draft=true&targetUserId=auth0_6a0b9365f87fcdb1e3441c76&displayExecutionLogs=true
const FLOW_WEATHER_ENDPOINT =
  "https://cxf-executor-dev.cxfabric.io/restendpoint?tenant_id=cus_QZ2vTHtqYrOmud&flow_id=34822cb4-a0dc-4893-9e50-0f90020b1de8&draft=true&targetUserId=auth0_67bdf583d7397dc4f217a8e0&displayExecutionLogs=true";
const WEATHER_TOOL_NAME = "get_current_weather";
const MAX_TOOL_ROUNDS = 3;

const GROK_INSTRUCTIONS = `You are a task-oriented assistant.

Guidelines:
- Break complex requests into clear steps in the final answer when useful
- If you are uncertain, say so rather than guessing
- Do not reveal hidden reasoning, private analysis, or meta-commentary about what the user said
- For simple tests or greetings, answer directly
- When the user asks for current weather, temperature, precipitation, or current conditions, call get_current_weather
- For weather requests, pass the user's location phrase to get_current_weather; include latitude and longitude only when you are confident
- Ask a clarifying question when the requested location is ambiguous

Format: Keep answers concise and useful.`;

const FALLBACK_MESSAGE = "I am unable to process your request right now.";

const GROK_TOOLS = [
  { type: "web_search" },
  {
    type: "function",
    name: WEATHER_TOOL_NAME,
    description:
      "Get current weather from the CX Fabric weather flow. Use this for current weather, temperature, precipitation, and conditions.",
    parameters: {
      type: "object",
      properties: {
        location: {
          type: "string",
          description:
            "Human-readable place name from the user's request, for example Austin, TX or Leander Texas.",
        },
        latitude: {
          type: "number",
          description: "Latitude in decimal degrees.",
        },
        longitude: {
          type: "number",
          description: "Longitude in decimal degrees.",
        },
        unit: {
          type: "string",
          enum: ["celsius", "fahrenheit"],
          default: "fahrenheit",
          description: "Preferred temperature unit.",
        },
      },
      required: ["location"],
      additionalProperties: false,
    },
  },
];

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

const parseToolArguments = (value) => {
  if (!value) {
    return {};
  }

  if (typeof value === "object") {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
};

const extractFunctionCalls = (payload) => {
  const output = Array.isArray(payload?.output)
    ? payload.output
    : Array.isArray(payload?.response?.output)
      ? payload.response.output
      : [];

  return output
    .filter((item) => item?.type === "function_call")
    .map((item) => ({
      name: item.name || item.function?.name || "",
      callId: item.call_id || item.callId || item.id || "",
      args: parseToolArguments(item.arguments || item.function?.arguments),
    }))
    .filter((item) => item.name && item.callId);
};

const createXaiRequestBody = (input, options = {}) => {
  const { includeInstructions = true, ...requestOptions } = options;

  return {
    model: GROK_MODEL,
    ...(includeInstructions ? { instructions: GROK_INSTRUCTIONS } : {}),
    max_output_tokens: 1000000,
    tools: GROK_TOOLS,
    reasoning: {
      effort: "low",
    },
    input,
    ...requestOptions,
  };
};

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

const getNumericCoordinate = (value) => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string" && value.trim()) {
    const parsedValue = Number.parseFloat(value);
    return Number.isFinite(parsedValue) ? parsedValue : null;
  }

  return null;
};

const formatGeocodedLocation = (result, fallbackLocation) =>
  [result.name, result.admin1, result.country_code]
    .filter(Boolean)
    .join(", ") || fallbackLocation;

const resolveWeatherArgs = async (args, signal) => {
  const latitude = getNumericCoordinate(args.latitude);
  const longitude = getNumericCoordinate(args.longitude);

  if (latitude !== null && longitude !== null) {
    return {
      ...args,
      latitude,
      longitude,
      unit: args.unit || "fahrenheit",
    };
  }

  const location = String(args.location || "").trim();

  if (!location) {
    return {
      ...args,
      error: "Weather location is required.",
    };
  }

  const geocodingUrl = new URL(OPEN_METEO_GEOCODING_ENDPOINT);
  geocodingUrl.searchParams.set("name", location);
  geocodingUrl.searchParams.set("count", "1");
  geocodingUrl.searchParams.set("language", "en");
  geocodingUrl.searchParams.set("format", "json");

  const response = await fetch(geocodingUrl, { signal });
  const payload = await response.json().catch(() => ({}));
  const result = payload?.results?.[0];

  if (!response.ok || !result) {
    return {
      ...args,
      error: `Could not resolve coordinates for ${location}.`,
      details: payload,
    };
  }

  return {
    ...args,
    location: formatGeocodedLocation(result, location),
    latitude: result.latitude,
    longitude: result.longitude,
    unit: args.unit || "fahrenheit",
  };
};

const invokeWeatherFlow = async (args, signal) => {
  const resolvedArgs = await resolveWeatherArgs(args, signal);

  if (resolvedArgs.error) {
    return resolvedArgs;
  }

  const response = await fetch(FLOW_WEATHER_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      location: resolvedArgs.location,
      latitude: resolvedArgs.latitude,
      longitude: resolvedArgs.longitude,
      unit: resolvedArgs.unit,
    }),
    signal,
  });

  const text = await response.text();
  let payload = text;

  try {
    payload = text ? JSON.parse(text) : {};
  } catch {
    payload = { raw: text };
  }

  if (!response.ok) {
    return {
      error: "Weather flow request failed",
      status: response.status,
      details: payload,
    };
  }

  return payload;
};

const executeToolCall = async (toolCall, signal) => {
  if (toolCall.name !== WEATHER_TOOL_NAME) {
    return {
      error: `Unknown tool: ${toolCall.name}`,
    };
  }

  return invokeWeatherFlow(toolCall.args, signal);
};

export async function sendChatMessage({ message, onReasoning, signal }) {
  const apiKey = getXaiApiKey();

  if (!apiKey) {
    return {
      text: "Missing xAI API key. Set REACT_APP_XAI_API_KEY and restart the app.",
      reasoning: "",
    };
  }

  let payload = await fetchXaiResponse({
    apiKey,
    body: createXaiRequestBody([{ role: "user", content: message }]),
    signal,
  });

  if (!payload) {
    return { text: FALLBACK_MESSAGE, reasoning: "" };
  }

  let toolRound = 0;

  while (toolRound < MAX_TOOL_ROUNDS) {
    const toolCalls = extractFunctionCalls(payload);

    if (!toolCalls.length) {
      break;
    }

    toolRound += 1;
    onReasoning?.("Checking the weather flow...");

    const toolOutputs = await Promise.all(
      toolCalls.map(async (toolCall) => ({
        type: "function_call_output",
        call_id: toolCall.callId,
        output: JSON.stringify(await executeToolCall(toolCall, signal)),
      }))
    );

    payload = await fetchXaiResponse({
      apiKey,
      body: createXaiRequestBody(toolOutputs, {
        includeInstructions: false,
        previous_response_id: payload.id,
      }),
      signal,
    });

    if (!payload) {
      return { text: FALLBACK_MESSAGE, reasoning: "" };
    }
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
