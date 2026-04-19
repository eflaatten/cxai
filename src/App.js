import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AppLayout from "./app/AppLayout";
import ChatView from "./features/chat/components/ChatView";
import { useChatSession } from "./features/chat/hooks/useChatSession";
import Header from "./layout/Header";
import Sidebar from "./layout/Sidebar";
import { useTheme } from "./theme";

function App() {
  const { isDark } = useTheme();
  const [provider, setProvider] = useState(() => {
    if (typeof window === "undefined") {
      return "gpt-4.1";
    }

    return window.localStorage.getItem("cxai-provider") || "gpt-4.1";
  });
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
    resetChat,
    sendPrompt,
    sendMessage,
    setDraft,
    stopResponse,
    streamingMessage,
  } = useChatSession(provider);

  const modelOptions = [
    { label: "OpenAI", value: "gpt-4.1" },
    { label: "CXFabric AI", value: "llama3.2:1b" },
  ];
  const alternateModel =
    modelOptions.find((option) => option.value !== provider) ?? null;

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("cxai-provider", provider);
    }
  }, [provider]);

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
            modelOptions={modelOptions}
            onNewChat={() => {
              resetChat();

              if (typeof window !== "undefined" && window.innerWidth <= 960) {
                setIsSidebarOpen(false);
              }
            }}
            provider={provider}
            setProvider={setProvider}
            userEmail="user@email.com"
          />
        }
      >
        <ChatView
          alternateModelLabel={alternateModel?.label ?? ""}
          draft={draft}
          isBusy={isBusy}
          isPreparingResponse={isPreparingResponse}
          isTypingResponse={isTypingResponse}
          messages={messages}
          modelOptions={modelOptions}
          onDraftChange={setDraft}
          onRetryPrompt={(prompt) => sendPrompt(prompt)}
          onRetryWithOtherModel={async (prompt) => {
            if (!alternateModel) {
              return;
            }

            const wasSent = await sendPrompt(prompt, alternateModel.value);

            if (wasSent) {
              setProvider(alternateModel.value);
              toast.success(`Switched to ${alternateModel.label}`, {
                autoClose: 1800,
                closeOnClick: true,
                draggable: false,
                pauseOnHover: false,
              });
            }
          }}
          onSend={sendMessage}
          onStop={stopResponse}
          onSuggestionSelect={setDraft}
          provider={provider}
          setProvider={setProvider}
          streamingMessage={streamingMessage}
        />
      </AppLayout>
    </>
  );
}

export default App;
