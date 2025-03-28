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
  const [darkTheme, setDarkTheme] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (darkTheme) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, [darkTheme]);

  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };

  const handleSenderMessageChange = (e) => {
    setSenderMessage(e.target.value);
  };


  const typeMessage = (message) => {
    setIsTyping(true);
    let index = -1; 

    setTypingMessage(""); 

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
    }, 10);
  };

  const handleSendMessage = async () => {
    if (senderMessage.trim()) {
      setChatMessages([...chatMessages, { text: senderMessage, type: "sent" }]);
      setSenderMessage("");
    }

    if(isTyping) return;

    try {
      const response = await axios.post(
        `https://cxf-executor-dev.cxfabric.io/restendpoint?tenant_id=${process.env.REACT_APP_TENANT_ID}&flow_id=${process.env.REACT_APP_FLOW_ID}`,
        {
          model: "gpt-4o",
          messages: [{ role: "user", content: senderMessage }],
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.REACT_APP_BEARER_TOKEN}`,
          },
        }
      );
      const assistantMessage = response.data.choices[0].message.content;

      typeMessage(assistantMessage);
    } catch (error) {
      console.log("error:", error);
    }
  };

  

  return (
    <div className={`App ${darkTheme ? "dark" : ""}`}>
      <div className='settings'>
        <div className='gear-container'>
          <FaCog
            className={`gear-icon ${darkTheme ? "dark-mode" : ""}`}
            onClick={toggleSettings}
          />
          <span className={`settings-label ${darkTheme ? "dark-mode" : ""}`}>Settings</span>
        </div>
        {showSettings && (
          <Settings
            darkTheme={darkTheme}
            setDarkTheme={setDarkTheme}
            onClose={() => setShowSettings(false)}
          />
        )}
      </div>
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
