import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";
import Chat from "./components/Chat";
import Settings from './components/Settings';
import { FaCog } from "react-icons/fa";

function App() {
  const [senderMessage, setSenderMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [typingMessage, setTypingMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [darkTheme, setDarkTheme] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (darkTheme) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, [darkTheme]);

  const toggleTheme = () => {
    setDarkTheme(!darkTheme);
  }

  const toggleSettings = () => {
    setShowSettings(!showSettings);
  }

  const handleSenderMessageChange = (e) => {
    setSenderMessage(e.target.value);
  };

  const typeMessage = (message) => {
    let index = 0;
    setTypingMessage(message[0]);
    setIsTyping(true);

    const interval = setInterval(() => {
      if (index < message.length) {
        setTypingMessage((prev) => prev + message[index]);
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
    }, 20); // speed of typing
  }

  const handleSendMessage = async () => {
    if (senderMessage.trim()) {
      // add the user's message to the chat
      setChatMessages([...chatMessages, { text: senderMessage, type: "sent" }]);
      // clear the input field
      setSenderMessage("");
    }

    if(isTyping) return;

    try {
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4o",
          messages: [{ role: "user", content: senderMessage }],
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
          },
        }
      );

      const assistantMessage = response.data.choices[0].message.content;

      typeMessage(assistantMessage);
    } catch (error) {
      console.log("error:", error)
    }
  };

  return (
    <div className={`App ${darkTheme ? 'dark' : ''}`}>
      <div className="settings">
        <FaCog className={`gear-icon ${darkTheme ? "dark-mode" : ""}`}onClick={toggleSettings} />
        {showSettings && (
          <Settings darkTheme={darkTheme} toggleTheme={toggleTheme} />
        )}
      </div>
      <h1 className={`app-header ${darkTheme ? 'dark-mode' : ''}`}>CXAi</h1>
      <div className='chat-messages'>
        {chatMessages.map((message, index) => (
          <div key={index} className={`chat-message ${message.type === "sent" ? "sent" : `received ${darkTheme ? 'dark-mode' : ''}`}`}>
            {message.text}
          </div>
        ))}
        {typingMessage && (
          <div className={`chat-message received ${darkTheme ? 'dark-mode' : ''}`}>{typingMessage}</div>
        )}
      </div>
        <Chat
          darkTheme={darkTheme}
          senderMessage={senderMessage}
          handleSenderMessageChange={handleSenderMessageChange}
          handleSendMessage={handleSendMessage}
        />
    </div>
  );
}

export default App;
