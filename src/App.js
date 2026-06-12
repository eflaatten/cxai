import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AppLayout from "./app/AppLayout";
import ChatView from "./features/chat/components/ChatView";
import { useChatSession } from "./features/chat/hooks/useChatSession";
import { useTheme } from "./theme";

function App() {
  const { isDark } = useTheme();
  const {
    draft,
    isBusy,
    isPreparingResponse,
    isTypingResponse,
    messages,
    reasoningMessage,
    sendPrompt,
    sendMessage,
    setDraft,
    stopResponse,
    streamingMessage,
  } = useChatSession();

  return (
    <>
      <ToastContainer
        position="top-center"
        autoClose={3200}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={isDark ? "dark" : "light"}
      />
      <AppLayout>
        <ChatView
          draft={draft}
          isBusy={isBusy}
          isPreparingResponse={isPreparingResponse}
          isTypingResponse={isTypingResponse}
          messages={messages}
          reasoningMessage={reasoningMessage}
          onDraftChange={setDraft}
          onRetryPrompt={(prompt) => sendPrompt(prompt)}
          onSend={sendMessage}
          onStop={stopResponse}
          streamingMessage={streamingMessage}
        />
      </AppLayout>
    </>
  );
}

export default App;
