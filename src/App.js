import React, { useState } from "react";
import axios from "axios";
import "./App.css";
import Chat from "./components/Chat";

function App() {
  const [senderMessage, setSenderMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([]);

  const handleSenderMessageChange = (e) => {
    setSenderMessage(e.target.value);
  };

  const handleSendMessage = async () => {
    if (senderMessage.trim()) {
      // add the user's message to the chat
      setChatMessages([...chatMessages, { text: senderMessage, type: "sent" }]);
      // clear the input field
      setSenderMessage("");
    }

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
            Authorization: `Bearer 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`,
          },
        }
      );

      const assistantMessage = response.data.choices[0].message.content;

      setChatMessages((prevMessages) => [
        ...prevMessages,
        { text: assistantMessage, type: "received" },
      ]);
    } catch (error) {
      console.log("error:", error)
    }
  };

  return (
    <div className='App'>
      <h1>CXAi</h1>
      <div className='chat-messages'>
        {chatMessages.map((message, index) => (
          <div
          key={index}
          className={`chat-message ${
            message.type === "sent" ? "sent" : "received"
          }`}
          >
            {message.text}
          </div>
        ))}
      </div>
        <Chat
          senderMessage={senderMessage}
          handleSenderMessageChange={handleSenderMessageChange}
          handleSendMessage={handleSendMessage}
        />
    </div>
  );
}

export default App;
