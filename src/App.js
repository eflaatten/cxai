import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./App.css";
import Chat from "./components/Chat";
import Sidenav from "./components/Sidenav";
import Header from "./components/Header";
import WelcomePage from "./pages/WelcomePage";

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

  // const typeMessage = (message) => {
  //   if (typingTimeoutRef.current) {
  //     clearTimeout(typingTimeoutRef.current);
  //   }

  //   setIsTyping(true);
  //   setTypingMessage("");
  //   typingBufferRef.current = "";

  //   let index = 0;

  //   const typeNextChar = () => {
  //     if (index < message.length) {
  //       typingBufferRef.current += message.charAt(index);
  //       setTypingMessage(typingBufferRef.current);
  //       index++;
  //       typingTimeoutRef.current = setTimeout(typeNextChar, 5);
  //     } else {
  //       setChatMessages((prevMessages) => [
  //         ...prevMessages,
  //         { text: message, type: "received" },
  //       ]);
  //       setTypingMessage("");
  //       setIsTyping(false);
  //       typingTimeoutRef.current = null;
  //     }
  //   };

  //   typeNextChar();
  // };
  const typeMessage = (message) => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    setIsTyping(true);
    setTypingMessage("");
    typingBufferRef.current = "";

    let index = 0;
    const chunkSize = 5;  // smoother appearance

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
    const messageToSend = senderMessage; // capture before clearing
    setIsProcessing(true);
    setChatMessages(prev => [...prev, { text: messageToSend, type: "sent" }]);
    setSenderMessage("");

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
    <div className={`App ${darkTheme ? "dark" : ""}`}>  
      <Header 
        isSidenavOpen={sidenavOpen} 
        onMenuClick={() => setSidenavOpen(true)} 
        onMenuClose={() => setSidenavOpen(false)}
        userEmail={"user@email.com"} 
        darkTheme={darkTheme} 
        setDarkTheme={setDarkTheme} 
      />
      <Sidenav 
        darkTheme={darkTheme} 
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
        />
      )}
    </div>
  );
}

export default App;
