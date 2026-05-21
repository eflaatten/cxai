import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AppLayout from "./app/AppLayout";
import ChatView from "./features/chat/components/ChatView";
import { useChatSession } from "./features/chat/hooks/useChatSession";
import Header from "./layout/Header";
import Sidebar from "./layout/Sidebar";
import { useTheme } from "./theme";

function App() {
  const { isDark } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window === "undefined") {
      return true;
    }

    return window.innerWidth > 960;
  });
  const {
    draft,
    isBusy,
    isPreparingResponse,
    isTypingResponse,
    messages,
    reasoningMessage,
    resetChat,
    sendPrompt,
    sendMessage,
    setDraft,
    stopResponse,
    streamingMessage,
  } = useChatSession();

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) {
      return undefined;
    }

    const mediaQuery = window.matchMedia("(max-width: 960px)");
    const syncSidebar = (event) => {
      if (event.matches) {
        setIsSidebarOpen(false);
        return;
      }

      setIsSidebarOpen(true);
    };

    syncSidebar(mediaQuery);

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", syncSidebar);
      return () => mediaQuery.removeEventListener("change", syncSidebar);
    }

    mediaQuery.addListener(syncSidebar);
    return () => mediaQuery.removeListener(syncSidebar);
  }, []);

  return (
    <>
      <ToastContainer
        position="top-right"
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
      <AppLayout
        header={
          <Header
            isSidebarOpen={isSidebarOpen}
            onToggleSidebar={() => setIsSidebarOpen((current) => !current)}
          />
        }
        isSidebarOpen={isSidebarOpen}
        onCloseSidebar={() => setIsSidebarOpen(false)}
        sidebar={
          <Sidebar
            historyItems={messages}
            isOpen={isSidebarOpen}
            onCloseSidebar={() => setIsSidebarOpen(false)}
            onNewChat={() => {
              resetChat();

              if (typeof window !== "undefined" && window.innerWidth <= 960) {
                setIsSidebarOpen(false);
              }
            }}
            onOpenSidebar={() => setIsSidebarOpen(true)}
            userEmail="user@email.com"
          />
        }
      >
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
