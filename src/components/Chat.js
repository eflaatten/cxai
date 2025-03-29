import React, { useState, useRef, useEffect } from "react";
import { FaClipboard, FaCheck, FaArrowUp, FaStopCircle } from "react-icons/fa";
  
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";


function Chat({ darkTheme, senderMessage, handleSenderMessageChange, handleSendMessage, chatMessages, typingMessage }) {
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef(null);
  const chatEndRef = useRef(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [senderMessage]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, typingMessage]);

  const customBlackTheme = {
    ...tomorrow,
    'pre[class*="language-"]': {
      ...tomorrow['pre[class*="language-"]'],
      background: "#000000",
    },
    'code[class*="language-"]': {
      ...tomorrow['code[class*="language-"]'],
      background: "#000000",
    },
  };

  const sendMessage = async () => {
    if (!senderMessage.trim()) return; 
    setIsProcessing(true);
    await handleSendMessage();
    setIsProcessing(false); 
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    } else if (event.key === "Enter" && event.shiftKey) {
      event.preventDefault();
      handleSenderMessageChange({
        target: { value: senderMessage + "\n" },
      });
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

  return (
    <div className={`chat-container ${darkTheme ? "dark-mode" : ""}`}>
      <div className='chat-messages'>
        {chatMessages.map((message, index) => (
          <div
            key={index}
            className={`chat-message ${
              message.type === "sent"
                ? "sent"
                : `received ${darkTheme ? "dark-mode" : ""}`
            }`}
          >
            <ReactMarkdown components={components}>
              {message.text}
            </ReactMarkdown>
          </div>
        ))}
        {typingMessage && (
          <div
            className={`chat-message received ${darkTheme ? "dark-mode" : ""}`}
          >
            <ReactMarkdown components={components}>
              {typingMessage}
            </ReactMarkdown>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>
      <div className='chat-message-send'>
        <div className={`chat-box-wrapper ${darkTheme ? "dark-mode" : ""}`}>
          <textarea
            ref={textareaRef}
            className={`chat-box ${darkTheme ? "dark-mode" : ""}`}
            placeholder='Type your message...'
            value={senderMessage}
            onChange={(e) => handleSenderMessageChange(e)}
            onKeyPress={handleKeyPress}
          />
          <button
            type='button'
            onClick={sendMessage}
            className='send-button'
            disabled={isProcessing}
          >
            {isProcessing ? (
              <FaStopCircle style={{ width: "25px", height: "25px" }} />
            ) : (
              <FaArrowUp />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Chat;
