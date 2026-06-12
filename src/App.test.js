import { render, screen } from "@testing-library/react";
import React from "react";
jest.mock("./features/chat/components/ChatView", () => () => (
  <div>Mock chat view</div>
));
jest.mock("./features/chat/hooks/useChatSession", () => ({
  useChatSession: () => ({
    draft: "",
    isBusy: false,
    isPreparingResponse: false,
    isTypingResponse: false,
    messages: [],
    resetChat: jest.fn(),
    reasoningMessage: "",
    sendMessage: jest.fn(),
    sendPrompt: jest.fn(),
    setDraft: jest.fn(),
    stopResponse: jest.fn(),
    streamingMessage: "",
  }),
}));
import App from "./App";
import { ThemeProvider } from "./theme";

test("renders the refreshed app shell", () => {
  render(
    <ThemeProvider>
      <App />
    </ThemeProvider>
  );

  expect(screen.getByText(/mock chat view/i)).toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: /start a new chat/i })
  ).not.toBeInTheDocument();
  expect(screen.queryByRole("complementary")).not.toBeInTheDocument();
});
