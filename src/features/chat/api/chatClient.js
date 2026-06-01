const XAI_RESPONSES_ENDPOINT = "https://api.x.ai/v1/responses";
const GROK_MODEL = "grok-4.3";

// WEATHER TOOL
const OPEN_METEO_GEOCODING_ENDPOINT =
  "https://geocoding-api.open-meteo.com/v1/search";
//https://cxf-executor-dev.cxfabric.io/restendpoint?tenant_id=cus_QZ2vTHtqYrOmud&flow_id=69e5fde2-e20d-4048-9499-8665cc70a0a5&draft=true&targetUserId=auth0_67bdf583d7397dc4f217a8e0&displayExecutionLogs=true // weather.gov api
//https://cxf-executor-dev.cxfabric.io/restendpoint?tenant_id=cus_QZ2vTHtqYrOmud&flow_id=34822cb4-a0dc-4893-9e50-0f90020b1de8&draft=true&targetUserId=auth0_67bdf583d7397dc4f217a8e0&displayExecutionLogs=true // open-meteo
//https://cxf-executor-qa.cxfabric.io/restendpoint?tenant_id=bb40a7e5-3721-4bc9-b430-aa980a8e9918&flow_id=6ebddf47-3694-4336-90af-578f10d6cb6c&draft=true&targetUserId=auth0_6a0b9365f87fcdb1e3441c76&displayExecutionLogs=true
const FLOW_WEATHER_ENDPOINT = "https://cxf-executor-dev.cxfabric.io/restendpoint?tenant_id=cus_QZ2vTHtqYrOmud&flow_id=34822cb4-a0dc-4893-9e50-0f90020b1de8&draft=true&targetUserId=*&displayExecutionLogs=true";
const WEATHER_TOOL_NAME = "get_current_weather";

// MAKO DEMO DYNAMO DB TOOL
const DYNAMO_DB_RETRIEVAL_ENDPOINT = "https://cxf-executor-qa.cxfabric.io/restendpoint?tenant_id=1bdd5282-6602-4a6b-8ad6-a94f57c5fa2b&flow_id=14106d32-c3c7-4b02-971a-bf8ee0ce6f95&draft=true&targetUserId=*&displayExecutionLogs=true";
const MAKO_DEMO_TOOL_NAME = "retrieve_gas_stations";
const MAKO_STATION_ID_MIN = 1004;
const MAKO_STATION_ID_MAX = 10010;

// MAKO NETWORKS TROUBLESHOOTING TOOL
const MAKO_TROUBLESHOOTING_ENDPOINT = "https://cxf-executor-qa.cxfabric.io/restendpoint?tenant_id=1bdd5282-6602-4a6b-8ad6-a94f57c5fa2b&flow_id=d3ed499f-1aa5-4eaa-9cee-59cdcfd829ce&draft=true&targetUserId=*&displayExecutionLogs=true";
const MAKO_TROUBLESHOOTING_TOOL_NAME = "get_mako_troubleshooting";

const MAX_TOOL_ROUNDS = 3;
const TOOL_RETRY_DELAYS_MS = [350, 900];

const GROK_INSTRUCTIONS = `You are a task-oriented assistant.

Guidelines:
- Break complex requests into clear steps in the final answer when useful
- If you are uncertain, say so rather than guessing
- Do not reveal hidden reasoning, private analysis, or meta-commentary about what the user said
- For simple tests or greetings, answer directly
- When the user asks for current weather, temperature, precipitation, or current conditions, call get_current_weather
- For weather requests, pass the user's location phrase to get_current_weather; include latitude and longitude only when you are confident
- Ask a clarifying question when the requested location is ambiguous
- When the user asks for a Mako Networks gas station record or provides a Mako station ID, call retrieve_gas_stations
- For Mako gas station requests, require stationId from 1004 through 10010
- Ask for a valid stationId when a Mako request is missing stationId or uses a stationId outside the supported set
- When the user asks a Mako Networks troubleshooting question, call get_mako_troubleshooting
- For Mako troubleshooting requests, pass the user's complete question to get_mako_troubleshooting
- Use Mako troubleshooting guidance for appliance, internet connectivity, POS, payment processing, cellular failover, placement, installation, and upgrade questions

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
  {
    type: "function",
    name: MAKO_DEMO_TOOL_NAME,
    description:
      "Retrieve Mako Networks gas station information from the DynamoDB flow by stationId.",
    parameters: {
      type: "object",
      properties: {
        stationId: {
          type: "number",
          minimum: MAKO_STATION_ID_MIN,
          maximum: MAKO_STATION_ID_MAX,
          description:
            "Mako gas station ID. Supported IDs are from 1004 through 10010.",
        },
      },
      required: ["stationId"],
      additionalProperties: false,
    },
  },
  {
    type: "function",
    name: MAKO_TROUBLESHOOTING_TOOL_NAME,
    description:
      "Retrieve Mako Networks troubleshooting guidance for appliance, internet connectivity, POS, payment processing, cellular failover, placement, installation, and upgrade questions.",
    parameters: {
      type: "object",
      properties: {
        question: {
          type: "string",
          description:
            "The user's complete Mako Networks troubleshooting question, including the symptoms they described.",
        },
      },
      required: ["question"],
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

const waitForRetry = (delay, signal) =>
  new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Request aborted", "AbortError"));
      return;
    }

    const timeoutId = window.setTimeout(resolve, delay);

    signal?.addEventListener(
      "abort",
      () => {
        window.clearTimeout(timeoutId);
        reject(new DOMException("Request aborted", "AbortError"));
      },
      { once: true }
    );
  });

const withRetry = async (operation, { shouldRetry, signal }) => {
  let lastError = null;

  for (let attempt = 0; attempt <= TOOL_RETRY_DELAYS_MS.length; attempt += 1) {
    try {
      const result = await operation();

      if (!shouldRetry?.(result)) {
        return result;
      }

      lastError = result;
    } catch (error) {
      if (error?.name === "AbortError") {
        throw error;
      }

      lastError = error;
    }

    const delay = TOOL_RETRY_DELAYS_MS[attempt];

    if (delay === undefined) {
      break;
    }

    await waitForRetry(delay, signal);
  }

  if (lastError instanceof Error) {
    throw lastError;
  }

  return lastError;
};

const parseFlowResponse = async (response) => {
  const text = await response.text();

  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { raw: text };
  }
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

const getMakoStationId = (value) => {
  const parsedValue =
    typeof value === "number"
      ? value
      : typeof value === "string" && value.trim()
        ? Number(value)
        : NaN;

  if (
    !Number.isInteger(parsedValue) ||
    parsedValue < MAKO_STATION_ID_MIN ||
    parsedValue > MAKO_STATION_ID_MAX
  ) {
    return null;
  }

  return parsedValue;
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

  const response = await withRetry(
    () => fetch(geocodingUrl, { signal }),
    {
      shouldRetry: (result) => !result?.ok,
      signal,
    }
  );
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

  const response = await withRetry(
    () =>
      fetch(FLOW_WEATHER_ENDPOINT, {
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
      }),
    {
      shouldRetry: (result) => !result?.ok,
      signal,
    },
  );

  const payload = await parseFlowResponse(response);

  if (!response.ok) {
    return {
      error: "Weather flow request failed",
      status: response.status,
      details: payload,
    };
  }

  return payload;
};

const invokeMakoDemoFlow = async (args, signal) => {
  const stationId = getMakoStationId(args.stationId);

  if (stationId === null) {
    return {
      error: "Mako stationId is required and must be in the supported range.",
      supportedStationIdRange: {
        minimum: MAKO_STATION_ID_MIN,
        maximum: MAKO_STATION_ID_MAX,
      },
    };
  }

  const response = await withRetry(
    () =>
      fetch(DYNAMO_DB_RETRIEVAL_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ stationId }),
        signal,
      }),
    {
      shouldRetry: (result) => !result?.ok,
      signal,
    },
  );

  const payload = await parseFlowResponse(response);

  if (!response.ok) {
    return {
      error: "Mako DynamoDB retrieval flow request failed",
      status: response.status,
      details: payload,
    };
  }

  return payload;
};

const invokeMakoTroubleshootingFlow = async (args, signal) => {
  const question = String(args.question || "").trim();

  if (!question) {
    return {
      error: "A Mako Networks troubleshooting question is required.",
    };
  }

  const response = await withRetry(
    () =>
      fetch(MAKO_TROUBLESHOOTING_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question }),
        signal,
      }),
    {
      shouldRetry: (result) => !result?.ok,
      signal,
    },
  );

  const payload = await parseFlowResponse(response);

  if (!response.ok) {
    return {
      error: "Mako Networks troubleshooting flow request failed",
      status: response.status,
      details: payload,
    };
  }

  return payload;
};

const getToolProgressMessage = (toolCalls) => {
  const toolNames = new Set(toolCalls.map((toolCall) => toolCall.name));

  if (toolNames.size === 1 && toolNames.has(WEATHER_TOOL_NAME)) {
    return "Checking the weather flow...";
  }

  if (toolNames.size === 1 && toolNames.has(MAKO_DEMO_TOOL_NAME)) {
    return "Checking the Mako station flow...";
  }

  if (toolNames.size === 1 && toolNames.has(MAKO_TROUBLESHOOTING_TOOL_NAME)) {
    return "Checking Mako troubleshooting guidance...";
  }

  return "Checking connected tools...";
};

const executeToolCall = async (toolCall, signal) => {
  try {
    if (toolCall.name === WEATHER_TOOL_NAME) {
      return await invokeWeatherFlow(toolCall.args, signal);
    }

    if (toolCall.name === MAKO_DEMO_TOOL_NAME) {
      return await invokeMakoDemoFlow(toolCall.args, signal);
    }

    if (toolCall.name === MAKO_TROUBLESHOOTING_TOOL_NAME) {
      return await invokeMakoTroubleshootingFlow(toolCall.args, signal);
    }

    return {
      error: `Unknown tool: ${toolCall.name}`,
    };
  } catch (error) {
    if (error?.name === "AbortError") {
      throw error;
    }

    console.error(`${toolCall.name} tool failed`, error);
    return {
      error: `${toolCall.name} request failed`,
      message:
        "The connected service did not respond successfully. Ask the user to retry shortly.",
    };
  }
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
    onReasoning?.(getToolProgressMessage(toolCalls));

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
