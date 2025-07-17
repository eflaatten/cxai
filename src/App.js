import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./App.css";
import Chat from "./components/Chat";
import Sidenav from "./components/Sidenav";
import Header from "./components/Header";
import WelcomePage from "./pages/WelcomePage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSwipe } from "./utils/useSwipe";

function App() {
  const [senderMessage, setSenderMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [typingMessage, setTypingMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [darkTheme, setDarkTheme] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sidenavOpen, setSidenavOpen] = useState(true);
  const [isPreparingMessage, setIsPreparingMessage] = useState(false);
  const [provider, setProvider] = useState("gpt-4o");
  const [newChat, setNewChat] = useState(false);

  const typingTimeoutRef = useRef(null);
  const typingBufferRef = useRef("");

  const modelOptions = [
    { label: "OpenAI", value: "gpt-4o" },
    { label: "Mako Networks", value: "llama3.2:1b" },
  ];

  
  const getEndpoint = () =>
    `https://cxf-executor-dev.cxfabric.io/restendpoint` +
  `?tenant_id=${process.env.REACT_APP_TENANT_ID}` +
  `&flow_id=${process.env.REACT_APP_FLOW_ID}`;
  
  const buildHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.REACT_APP_BEARER_TOKEN}`,
  });
  
  const handleProviderChange = async (newProvider) => {
    setProvider(newProvider);
  };
  
  const handleSenderMessageChange = (e) => {
    setSenderMessage(e.target.value);
  };

  const handleNewChat = () => {
    setNewChat(true);
    setChatMessages([]);
    setSenderMessage("");
    setIsTyping(false);
    setIsProcessing(false);
    setTypingMessage("");
    setIsPreparingMessage(false);
  }
  
  const typeMessage = (message) => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    setIsTyping(true);
    setTypingMessage("");
    typingBufferRef.current = "";
    
    typingTimeoutRef.current = setTimeout(() => {
      
      let index = 0;
      const chunkSize = 5;
      
      const typeNextChunk = () => {
        if (index < message.length) {
          typingBufferRef.current += message.slice(index, index + chunkSize);
          setTypingMessage(typingBufferRef.current);
          index += chunkSize;
          typingTimeoutRef.current = setTimeout(typeNextChunk, 20);
        } else {
          setChatMessages((prevMessages) => [
            ...prevMessages,
            { text: message, type: "received" },
          ]);
          setTypingMessage("");
          setIsTyping(false);
          typingTimeoutRef.current = null;
        }
      };
      
      typeNextChunk();
    }, 400);
  };
  
  const stopTyping = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    if (typingMessage) {
      setChatMessages((prevMessages) => [
        ...prevMessages,
        { text: typingMessage, type: "received" },
      ]);
    }
    setIsTyping(false);
    setTypingMessage("");
  };
  
  const handleSendMessage = async () => {
    if (!senderMessage.trim()) return;
    
    const messageToSend = senderMessage;
    setChatMessages((prev) => [...prev, { text: messageToSend, type: "sent" }]);
    setSenderMessage("");
    setIsProcessing(true);
    setIsPreparingMessage(true);

    try {
      let assistantMessage = "";

      if (provider === "llama3.2:1b") {
        const res = await axios.post(
          //"https://cxai-backend-dev.cxfabric.io/api/rag",
          getEndpoint(),
          { model: provider, question: messageToSend }
        );
        assistantMessage = res.data?.choices?.[0]?.message?.content || "I am unable to process your request. Please try again later.";
      } else {
        const res = await axios.post(
          getEndpoint(),
          {
            type: "chat",
            model: provider,
            messages: [{ role: "user", content: messageToSend }],
            stream: true,
          },
          { headers: buildHeaders() }
        );
        assistantMessage = res.data?.choices?.[0]?.message?.content || "I am unable to process your request. Please try again later.";
    }

      setIsPreparingMessage(false);
      typeMessage(assistantMessage);
    } catch (err) {
      console.error("SendMessage error:", err);
      setIsPreparingMessage(false);
      typeMessage("Error occurred while processing your message.");
    } finally {
      setIsProcessing(false);
    }
  };
  
  useEffect(() => {
    if (darkTheme) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, [darkTheme]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 700) {
        setSidenavOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  
  return (
    <div className={`App ${darkTheme ? "dark" : ""} ${sidenavOpen ? "sidenav-open" : ""}`}>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={darkTheme ? "dark" : "light"}
      />
      <Header
        isSidenavOpen={sidenavOpen}
        onMenuClick={() => setSidenavOpen(true)}
        onMenuClose={() => setSidenavOpen(false)}
        userEmail={"user@email.com"}
        darkTheme={darkTheme}
        setDarkTheme={setDarkTheme}
        provider={provider}
        setProvider={handleProviderChange}
        modelOptions={modelOptions}
      />
      <Sidenav
        darkTheme={darkTheme}
        setDarkTheme={setDarkTheme}
        isOpen={sidenavOpen}
        setIsOpen={setSidenavOpen}
        provider={provider}
        setProvider={handleProviderChange}
        modelOptions={modelOptions}
        handleNewChat={handleNewChat}
      />
      {chatMessages.length === 0 ? (
        <WelcomePage
          darkTheme={darkTheme}
          senderMessage={senderMessage}
          handleSenderMessageChange={handleSenderMessageChange}
          handleSendMessage={handleSendMessage}
          isProcessing={isProcessing}
        />
      ) : (
        <Chat
          darkTheme={darkTheme}
          senderMessage={senderMessage}
          handleSenderMessageChange={handleSenderMessageChange}
          handleSendMessage={handleSendMessage}
          chatMessages={chatMessages}
          typingMessage={typingMessage}
          setTypingMessage={setTypingMessage}
          isProcessing={isProcessing}
          isTyping={isTyping}
          stopTyping={stopTyping}
          isPreparingMessage={isPreparingMessage}
          typeMessage={typeMessage}
        />
      )}
    </div>
  );
}

export default App;
