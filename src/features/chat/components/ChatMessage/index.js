import { useState } from "react";
import IconButton from "@mui/material/IconButton";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  oneDark,
  oneLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import "katex/dist/katex.min.css";
import {
  CheckCircleIcon,
  CopyIcon,
  CopyIcon2,
  RefreshIcon,
} from "../../../../assets/icons";
import TooltipWrapper from "../../../../shared/components/Tooltip";
import { useTheme } from "../../../../theme";

const formatMath = (text) =>
  text
    .replace(/\\\(/g, "$")
    .replace(/\\\)/g, "$")
    .replace(/\\\[/g, "$$")
    .replace(/\\\]/g, "$$");

const normalizeSyntaxTheme = (theme) =>
  Object.fromEntries(
    Object.entries(theme).map(([key, value]) => {
      if (!value || typeof value !== "object") {
        return [key, value];
      }

      if (key === 'pre[class*="language-"]') {
        return [
          key,
          {
            ...value,
            background: "var(--chat-code-background)",
            backgroundColor: "var(--chat-code-background)",
            textShadow: "none",
          },
        ];
      }

      if (key === 'code[class*="language-"]') {
        return [
          key,
          {
            ...value,
            background: "transparent",
            backgroundColor: "transparent",
            textShadow: "none",
          },
        ];
      }

      const sanitizedValue = { ...value, textShadow: "none" };
      delete sanitizedValue.background;
      delete sanitizedValue.backgroundColor;

      return [key, sanitizedValue];
    })
  );

function ChatMessage({
  actionsDisabled = false,
  isStreaming = false,
  message,
  onRetry,
}) {
  const { isDark } = useTheme();
  const [copied, setCopied] = useState(false);
  const [copiedCode, setCopiedCode] = useState("");

  const syntaxTheme = isDark
    ? normalizeSyntaxTheme(oneDark)
    : normalizeSyntaxTheme(oneLight);

  const copyText = async (value, scope = "message") => {
    await navigator.clipboard.writeText(value);

    if (scope === "message") {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
      return;
    }

    setCopiedCode(value);
    window.setTimeout(() => setCopiedCode(""), 1800);
  };

  const markdownComponents = {
    code({ children, className, inline, ...props }) {
      const match = /language-(\w+)/.exec(className || "");
      const codeText = Array.isArray(children)
        ? children.join("")
        : String(children);
      const normalizedCode = codeText.replace(/\n$/, "");
      const isCopied = copiedCode === normalizedCode;

      if (!inline && match) {
        return (
          <div className="chat-message__code-block">
            <div className="chat-message__code-header">
              <span>{match[1]}</span>
              <TooltipWrapper arrow title={isCopied ? "Copied" : "Copy code"}>
                <IconButton
                  className="chat-message__icon-button"
                  size="small"
                  onClick={() => copyText(normalizedCode, "code")}
                >
                  {isCopied ? <CheckCircleIcon /> : <CopyIcon2 />}
                </IconButton>
              </TooltipWrapper>
            </div>
            <SyntaxHighlighter
              {...props}
              customStyle={{ margin: 0, padding: "18px" }}
              language={match[1]}
              PreTag="div"
              style={syntaxTheme}
            >
              {normalizedCode}
            </SyntaxHighlighter>
          </div>
        );
      }

      return (
        <code className={className} {...props}>
          {children}
        </code>
      );
    },
  };

  return (
    <article
      className={`chat-message chat-message--${message.role}${
        isStreaming ? " chat-message--streaming" : ""
      }`}
    >
      <div className="chat-message__meta">
        <span>{message.role === "user" ? "You" : "CXAI"}</span>
      </div>

      <div className="chat-message__card">
        <ReactMarkdown
          components={markdownComponents}
          rehypePlugins={[rehypeKatex]}
          remarkPlugins={[remarkMath]}
        >
          {formatMath(message.text)}
        </ReactMarkdown>
      </div>

      {!isStreaming && (
        <div
          className={`chat-message__actions chat-message__actions--${message.role}`}
        >
          <button
            type="button"
            className="chat-message__action-button"
            onClick={() => copyText(message.text)}
          >
            {copied ? (
              <CheckCircleIcon width="18" height="18" />
            ) : (
              <CopyIcon width="18" height="18" />
            )}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>

          {onRetry ? (
            <button
              type="button"
              className="chat-message__action-button"
              onClick={onRetry}
              disabled={actionsDisabled}
            >
              <RefreshIcon width="18" height="18" />
              <span>Retry</span>
            </button>
          ) : null}

        </div>
      )}
    </article>
  );
}

export default ChatMessage;
