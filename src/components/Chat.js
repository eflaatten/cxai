import React, { useState } from "react";
import { FaPaperPlane, FaClipboard, FaCheck } from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";


function Chat({ darkTheme, senderMessage, handleSenderMessageChange, handleSendMessage, chatMessages, typingMessage }) {
  const [copied, setCopied] = useState(false);
  
  const customBlackTheme = {
    ...tomorrow,
    'pre[class*="language-"]': {
      ...tomorrow['pre[class*="language-"]'],
      background: "#000000", // Solid black background
    },
    'code[class*="language-"]': {
      ...tomorrow['code[class*="language-"]'],
      background: "#000000", // Solid black background
    },
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSendMessage();
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); 
  };


  const components = {
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || "");
      const language = match ? match[1] : "";
      const codeText = String(children).replace(/\n$/, "");

      return !inline && match ? (
        <div className='code-block-wrapper'>
          <div className='code-block-header'>
            <span className='language-label'>{language}</span>
            <button
              className='copy-button'
              onClick={() => copyToClipboard(codeText)}
            >
            {copied && (
              <div className='copy-notification'>
                <FaCheck className='check-icon' />
                <span>Code copied!</span>
              </div>
            )}
              <FaClipboard />
            </button>
          </div>
          <SyntaxHighlighter
            style={customBlackTheme}
            language={language}
            PreTag='div'
            {...props}
          >
            {codeText}
          </SyntaxHighlighter>
        </div>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      );
    },
  };

  // const components = {
  //   code({ node, inline, className, children, ...props }) {
  //     const match = /language-(\w+)/.exec(className || "");
  //     return !inline && match ? (
  //       <SyntaxHighlighter
  //         style={customBlackTheme}
  //         language={match[1]}
  //         PreTag='div'
  //         children={String(children).replace(/\n$/, "")}
  //         {...props}
  //       />
  //     ) : (
  //       <code className={className} {...props}>
  //         {children}
  //       </code>
  //     );
  //   },
  // };


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
