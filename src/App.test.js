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
    sendMessage: jest.fn(),
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
    screen.getByRole("button", { name: /start a new chat/i })
  ).toBeInTheDocument();
  expect(screen.getByAltText(/mako networks/i)).toBeInTheDocument();
});
