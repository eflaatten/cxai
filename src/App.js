import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";
import Chat from "./components/Chat";
import Sidenav from "./components/Sidenav";

function App() {
  const [senderMessage, setSenderMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [typingMessage, setTypingMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [darkTheme, setDarkTheme] = useState(true);

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
    setIsTyping(true);
    let index = 0;

    setTypingMessage("");

    const interval = setInterval(() => {
      if (index < message.length) {
        setTypingMessage((prev) => prev + message.charAt(index));
        index++;
      } else {
        clearInterval(interval);
        setChatMessages((prevMessages) => [
          ...prevMessages,
          { text: message, type: "received" },
        ]);
        setTypingMessage("");
        setIsTyping(false);
      }
    }, 20); 
  };
  // const typeMessage = (message) => {
  //   setIsTyping(true);
  //   setTypingMessage("");

  //   const containsCodeBlock = message.includes("```"); // Check for code

  //   if (containsCodeBlock) {
  //     // Instantly display code blocks instead of typing effect
  //     setTypingMessage(message);
  //     setTimeout(() => {
  //       setChatMessages((prevMessages) => [
  //         ...prevMessages,
  //         { text: message, type: "received" },
  //       ]);
  //       setTypingMessage("");
  //       setIsTyping(false);
  //     }, 800); // Small delay for a smoother experience
  //     return;
  //   }

  //   // Typing effect for non-code messages
  //   const words = message.split(" ");
  //   let index = 0;

  //   const interval = setInterval(() => {
  //     if (index < words.length) {
  //       setTypingMessage((prev) =>
  //         prev ? `${prev} ${words[index]}` : words[index]
  //       );
  //       index++;
  //     } else {
  //       clearInterval(interval);
  //       setChatMessages((prevMessages) => [
  //         ...prevMessages,
  //         { text: message, type: "received" },
  //       ]);
  //       setTypingMessage("");
  //       setIsTyping(false);
  //     }
  //   }, 100); // Adjust speed (100ms per word)
  // }

  const handleSendMessage = async () => {
    if (senderMessage.trim()) {
      setChatMessages([...chatMessages, { text: senderMessage, type: "sent" }]);
      setSenderMessage("");
    }

    if(isTyping) return;

    try {
      const response = await axios.post(
        // OpenAI API endpoint: https://api.openai.com/v1/chat/completions
        `https://cxf-executor-dev.cxfabric.io/restendpoint?tenant_id=${process.env.REACT_APP_TENANT_ID}&flow_id=${process.env.REACT_APP_FLOW_ID}`,
        {
          model: "gpt-4o",
          messages: [{ role: "user", content: senderMessage }],
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.REACT_APP_BEARER_TOKEN}`, // For OpenAI API directly replace with REACT_APP_OPENAI_API_KEY
          },
        }
      );
      const assistantMessage = response.data?.choices?.[0]?.message?.content || "I am unable to process your request. Please try again later.";

      typeMessage(assistantMessage);
    } catch (error) {
      console.log("error:", error);
    }
  };

  return (
    <div className={`App ${darkTheme ? "dark" : ""}`}>
      <Sidenav darkTheme={darkTheme} setDarkTheme={setDarkTheme} />
      <Chat
        darkTheme={darkTheme}
        senderMessage={senderMessage}
        handleSenderMessageChange={handleSenderMessageChange}
        handleSendMessage={handleSendMessage}
        chatMessages={chatMessages}
        typingMessage={typingMessage}
        setTypingMessage={setTypingMessage}
      />
    </div>
  );
}

export default App;
