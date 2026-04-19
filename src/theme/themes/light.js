import { createThemeTokens } from "../tokens";

const lightTheme = createThemeTokens("light", {
  background: {
    canvas: "#f4f7fb",
    surface: "#ffffff",
    muted: "#eef2f7",
    elevated: "rgba(255, 255, 255, 0.88)",
    inset: "#e9eef5",
    overlay: "rgba(15, 23, 42, 0.08)",
  },
  text: {
    primary: "#0f172a",
    secondary: "#475569",
    muted: "#64748b",
    inverse: "#ffffff",
    button: "#ffffff",
  },
  border: {
    subtle: "#dbe3ee",
    strong: "#bcc8d8",
    accent: "rgba(37, 99, 235, 0.28)",
  },
  accent: {
    primary: "#2563eb",
    soft: "rgba(37, 99, 235, 0.1)",
    strong: "#1d4ed8",
    contrast: "#ffffff",
  },
  interactive: {
    hover: "rgba(148, 163, 184, 0.15)",
    active: "rgba(148, 163, 184, 0.24)",
    focus: "rgba(37, 99, 235, 0.2)",
    disabled: "#94a3b8",
  },
  chat: {
    userBubble: "#2563eb",
    userText: "#ffffff",
    assistantBubble: "#ffffff",
    assistantText: "#0f172a",
    composer: "rgba(255, 255, 255, 0.94)",
    composerBorder: "rgba(148, 163, 184, 0.28)",
    composerRing: "rgba(37, 99, 235, 0.14)",
    codeBackground: "#f8fafc",
    codeHeader: "#e2e8f0",
  },
  tooltip: {
    background: "#0f172a",
    text: "#ffffff",
  },
  scrollbar: {
    thumb: "#c1cbda",
    track: "transparent",
  },
  shadow: {
    shell: "0 30px 80px rgba(15, 23, 42, 0.08)",
    panel: "0 18px 48px rgba(15, 23, 42, 0.08)",
    floating: "0 12px 36px rgba(15, 23, 42, 0.16)",
  },
  gradient: {
    hero:
      "radial-gradient(circle at top, rgba(59, 130, 246, 0.15), transparent 42%)",
    accent: "linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%)",
  },
  radius: {
    sm: "10px",
    md: "18px",
    lg: "28px",
    pill: "999px",
  },
  typography: {
    sans: '"Avenir Next", "Segoe UI", "Helvetica Neue", sans-serif',
    mono: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
  },
});

export default lightTheme;
