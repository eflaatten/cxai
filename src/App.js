import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./App.css";
import Chat from "./components/Chat";
import Sidenav from "./components/Sidenav";
import Header from "./components/Header";
import WelcomePage from "./pages/WelcomePage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const [senderMessage, setSenderMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [typingMessage, setTypingMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [darkTheme, setDarkTheme] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sidenavOpen, setSidenavOpen] = useState(true);
  const typingTimeoutRef = useRef(null);
  const typingBufferRef = useRef("");
  const [isPreparingMessage, setIsPreparingMessage] = useState(false);
  //const [provider, setProvider] = useState("openai");

  useEffect(() => {
    if (darkTheme) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, [darkTheme]);

  const handleSenderMessageChange = (e) => {
    setSenderMessage(e.target.value);

  };

  const typeMessage = (message) => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    setIsTyping(true);
    setIsPreparingMessage(true);
    setTypingMessage("");
    typingBufferRef.current = "";

    typingTimeoutRef.current = setTimeout(() => {
      setIsPreparingMessage(false);

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
    }, 600);
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

  // Uncomment the following code if you want to use the OpenAI or Ollama API endpoints
  // const getEndpoint = () =>
  //   provider === "openai"
  //     ? `https://cxf-executor-dev.cxfabric.io/restendpoint` +
  //       `?tenant_id=${process.env.REACT_APP_TENANT_ID}` +
  //       `&flow_id=${process.env.REACT_APP_FLOW_ID}`
  //     : `${process.env.REACT_APP_OLLAMA_BASE_URL}/api/chat/completions`;

  //   const buildHeaders = () => {
  //     const base = { "Content-Type": "application/json" };
  //     if (provider === "openai")
  //       base.Authorization = `Bearer ${process.env.REACT_APP_BEARER_TOKEN}`;
  //     return base;
  //   };

  //   const getModelName = () => provider === "openai" ? "gpt-4o" : "llama3";

  //   const handleSendMessage = async () => {
  //     if (!senderMessage.trim()) return;

  //     const messageToSend = senderMessage;
  //     setChatMessages((prev) => [...prev, { text: messageToSend, type: "sent" }]);
  //     setSenderMessage("");
  //     setIsProcessing(true);
  //     setIsPreparingMessage(true);

  //     if (isTyping) {
  //       setIsProcessing(false);
  //       return;
  //     }

  //     try {
  //       const endpoint = getEndpoint();
  //       const headers = buildHeaders();
  //       const body = JSON.stringify({
  //         model: getModelName(),
  //         messages: [{ role: "user", content: messageToSend }],
  //         stream: true,
  //       });

  //       if (provider === "ollama") {
  //         const response = await fetch(endpoint, {
  //           method: "POST",
  //           headers,
  //           body,
  //         });

  //         const reader = response.body.getReader();
  //         const decoder = new TextDecoder("utf-8");
  //         let buffer = "";
  //         let finalMessage = "";

  //         setTypingMessage("");

  //         while (true) {
  //           const { value, done } = await reader.read();
  //           if (done) break;

  //           buffer += decoder.decode(value, { stream: true });
  //           const chunks = buffer.split("\n\n");
  //           buffer = chunks.pop();

  //           for (const chunk of chunks) {
  //             const line = chunk.replace(/^data:\s*/, "").trim();
  //             if (line === "[DONE]") break;

  //             try {
  //               const json = JSON.parse(line);
  //               const delta = json.choices?.[0]?.delta?.content;
  //               if (delta) {
  //                 finalMessage += delta;
  //                 setTypingMessage(finalMessage);
  //               }
  //             } catch (err) {
  //               console.warn("Stream parse error:", err, chunk);
  //             }
  //           }
  //         }

  //         setChatMessages((prev) => [...prev, { text: finalMessage, type: "received" }]);
  //         setTypingMessage("");
  //         setIsTyping(false);
  //       } else {
  //         const res = await axios.post(endpoint, JSON.parse(body), { headers });
  //         const assistantMessage =
  //           res.data?.choices?.[0]?.message?.content ||
  //           res.data?.output ||
  //           res.data?.result?.content ||
  //           "I am unable to process your request. Please try again later.";
  //         typeMessage(assistantMessage);
  //       }
  //     } catch (err) {
  //       console.error("SendMessage error:", err);
  //     } finally {
  //       setIsProcessing(false);
  //     }
  //   };


  // LIVE VERSION - CURRENT 
  const handleSendMessage = async () => {
    if (!senderMessage.trim()) return;
    const messageToSend = senderMessage;
    setIsProcessing(true);
    setChatMessages(prev => [...prev, { text: messageToSend, type: "sent" }]);
    setSenderMessage("");
    setIsPreparingMessage(true);

    if (isTyping) {
      setIsProcessing(false);
      return;
    }

    try {
      const response = await axios.post(
        // OpenAI API endpoint: https://api.openai.com/v1/chat/completions
        `https://cxf-executor-dev.cxfabric.io/restendpoint?tenant_id=${process.env.REACT_APP_TENANT_ID}&flow_id=${process.env.REACT_APP_FLOW_ID}`,
        {
          model: "gpt-4o",
          messages: [{ role: "user", content: messageToSend }],
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.REACT_APP_BEARER_TOKEN}`,
          },
        }
      );
      const assistantMessage = response.data?.choices?.[0]?.message?.content || "I am unable to process your request. Please try again later.";

      typeMessage(assistantMessage);
    } catch (error) {
      console.log("error:", error);
    }
    setIsProcessing(false);
  };

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
        //provider={provider}
        //setProvider={setProvider}
      />
      <Sidenav 
        darkTheme={darkTheme} 
        setDarkTheme={setDarkTheme}
        isOpen={sidenavOpen} 
        setIsOpen={setSidenavOpen} 
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
        />
      )}
    </div>
  );
}

export default App;
