import React, { useState, useRef, useEffect } from "react";
import { FaClipboard, FaCheckCircle, FaStopCircle, FaClone } from "react-icons/fa";
import SendIcon from "@mui/icons-material/Send";
import TooltipWrapper from "./Tooltip";
import IconButton from "@mui/material/IconButton";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight, oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import "katex/dist/katex.min.css";

function Chat({
  darkTheme,
  senderMessage,
  handleSenderMessageChange,
  handleSendMessage,
  chatMessages,
  typingMessage,
}) {
  const [copiedMessageIndex, setCopiedMessageIndex] = useState(null);
  const [lastCopiedCode, setLastCopiedCode] = useState(null);
  const textareaRef = useRef(null);
  const chatEndRef = useRef(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const formatMath = (text) => {
    return text
      .replace(/\\\(/g, "$")
      .replace(/\\\)/g, "$")
      .replace(/\\\[/g, "$$") 
      .replace(/\\\]/g, "$$");
  };

  const handleCopyMessage = (messageText, index) => {
    navigator.clipboard
      .writeText(messageText)
      .then(() => {
        console.log("Message copied!");
        setCopiedMessageIndex(index);
        setLastCopiedCode(null);
        setTimeout(() => setCopiedMessageIndex(null), 2000);
      })
      .catch((err) => console.error("Failed to copy message: ", err));
  };

  const handleCopyCode = (codeText) => {
    navigator.clipboard
      .writeText(codeText)
      .then(() => {
        console.log("Code copied!");
        setLastCopiedCode(codeText);
        setCopiedMessageIndex(null);
        setTimeout(() => setLastCopiedCode(null), 2000);
      })
      .catch((err) => console.error("Failed to copy code: ", err));
  };

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
    ...oneDark,
    'pre[class*="language-"]': {
      ...oneDark['pre[class*="language-"]'],
      background: "#000000",
    },
    'code[class*="language-"]': {
      ...oneDark['code[class*="language-"]'],
      background: "#000000",
    },
  };

  const customLightTheme = {
    ...oneLight,
    'pre[class*="language-"]': {
      ...oneLight['pre[class*="language-"]'],
      background: "#ffffff",
    },
    'code[class*="language-"]': {
      ...oneLight['code[class*="language-"]'],
      background: "#ffffff",
    },
  }

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

  const components = {
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || "");
      const language = match ? match[1] : "";
      const codeText = React.Children.toArray(children)
        .join("")
        .replace(/\n$/, "");

      const isCopied = lastCopiedCode === codeText;

      return !inline && match ? (
        <div className='code-block-wrapper'>
          <div className='code-block-header'>
            <span className='language-label'>{language || "code"}</span>

            <TooltipWrapper title={isCopied ? "Copied!" : "Copy code"} arrow>
              <IconButton
                aria-label={isCopied ? "Copied!" : "Copy code"}
                className='code-block-copy-button'
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopyCode(codeText);
                }}
                size='small'
              >
                {isCopied ? (
                  <FaCheckCircle className='check-icon' />
                ) : (
                  <FaClipboard className='clipboard-icon' />
                )}
              </IconButton>
            </TooltipWrapper>
          </div>
          <SyntaxHighlighter
            style={darkTheme ? customBlackTheme : customLightTheme}
            language={language}
            PreTag='div'
            customStyle={{ padding: '0', margin: '0', fontSize: '14px' }}
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
        {chatMessages.map((message, index) => {
          const isMessageCopied = copiedMessageIndex === index;

          return (
            <div
              key={index}
              className={`chat-message-container ${
                message.type === "sent" ? "sent" : "received"
              } ${darkTheme && message.type === "received" ? "dark-mode" : ""}`}
            >
              <div
                className={`chat-message ${
                  message.type === "sent"
                    ? "sent"
                    : `received ${darkTheme ? "dark-mode" : ""}`
                }`}
              >
                <ReactMarkdown
                  components={components}
                  remarkPlugins={[remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                >
                  {formatMath(message.text)}
                </ReactMarkdown>
              </div>
              <div className='chat-actions-container'>
                <TooltipWrapper
                  title={isMessageCopied ? "Copied!" : "Copy message"}
                  arrow
                >
                  <IconButton
                    aria-label={isMessageCopied ? "Copied!" : "Copy message"}
                    className='copy-message-button'
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyMessage(message.text, index);
                    }}
                    size='small'
                  >
                    {isMessageCopied ? (
                      <FaCheckCircle className='check-icon' />
                    ) : (
                      <FaClone className='content-copy-icon' />
                    )}
                  </IconButton>
                </TooltipWrapper>
              </div>
            </div>
          );
        })}
        {typingMessage && (
          <div className='chat-message-container received'>
            <div
              className={`chat-message received ${
                darkTheme ? "dark-mode" : ""
              }`}
            >
              <ReactMarkdown
                components={components}
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
              >
                {typingMessage}
              </ReactMarkdown>
            </div>
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
            //disabled={isProcessing}
          >
            {isProcessing ? (
              <TooltipWrapper title='Processing...' arrow placement='top'>
                <FaStopCircle className='stop-circle' />
              </TooltipWrapper>
            ) : (
              <TooltipWrapper title='Send' arrow placement='top'>
                <SendIcon style={{ marginLeft: "2px" }} />
              </TooltipWrapper>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Chat;
