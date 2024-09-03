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
    setIsTyping(true);
    let index = -1; // Starts at -1 so it doesn't skip the first letter. 

    setTypingMessage(""); // Clear previous typing message

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
        setTypingMessage(""); // Clear typing message
        setIsTyping(false);
      }
    }, 10); // Adjust speed as needed
  };

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
