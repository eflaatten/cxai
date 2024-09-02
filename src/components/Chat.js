import React from "react";
import { FaPaperPlane } from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark, coy } from "react-syntax-highlighter/dist/esm/styles/prism";


function Chat({ darkTheme, senderMessage, handleSenderMessageChange, handleSendMessage, chatMessages, typingMessage }) {
  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSendMessage();
    }
  };

  const components = {
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || "");
      return !inline && match ? (
        <SyntaxHighlighter
          style={darkTheme ? atomDark : coy}
          language={match[1]}
          PreTag='div'
          children={String(children).replace(/\n$/, "")}
          {...props}
        />
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      );
    },
  };


  return (
    <div className={`chat-container ${darkTheme ? 'dark-mode': ''}`}>
      <div className='chat-messages'>
        {chatMessages.map((message, index) => (
          <div
            key={index}
            className={`chat-message ${message.type === "sent" ? "sent" : `received ${darkTheme ? "dark-mode" : ""}`}`}>
            <ReactMarkdown components={components}>
              {message.text}
            </ReactMarkdown>
          </div>
        ))}
        {typingMessage && (
          <div className={`chat-message received ${darkTheme ? "dark-mode" : ""}`}>
            <ReactMarkdown components={components}>
              {typingMessage}
            </ReactMarkdown>
          </div>
        )}
      </div>
      <div className='chat-message-send'>
        <input
          className={`chat-box ${darkTheme ? "dark-mode" : ""}`}
          placeholder='Message CXAi'
          value={senderMessage}
          onChange={handleSenderMessageChange}
          onKeyPress={handleKeyPress}
        />
        <button type='button' onClick={handleSendMessage}>
          <FaPaperPlane />
        </button>
      </div>
    </div>
  );
}

export default Chat;
