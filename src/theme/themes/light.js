import { createThemeTokens } from "../tokens";

const lightTheme = createThemeTokens("light", {
  background: {
    canvas: "#ffffff",
    surface: "#ffffff",
    muted: "#edf4f1",
    elevated: "rgba(255, 255, 255, 0.92)",
    inset: "#e7f0ed",
    overlay: "rgba(18, 32, 51, 0.1)",
  },
  text: {
    primary: "#122033",
    secondary: "#465b67",
    muted: "#6e7f8b",
    inverse: "#ffffff",
    button: "#ffffff",
  },
  border: {
    subtle: "#dce8e4",
    strong: "#b8cbc5",
    accent: "rgba(15, 118, 110, 0.3)",
  },
  accent: {
    primary: "#0f766e",
    soft: "rgba(15, 118, 110, 0.1)",
    strong: "#0b5f59",
    contrast: "#ffffff",
  },
  interactive: {
    hover: "rgba(15, 118, 110, 0.08)",
    active: "rgba(15, 118, 110, 0.14)",
    focus: "rgba(15, 118, 110, 0.18)",
    disabled: "#9aa9a5",
  },
  chat: {
    userBubble: "#0f766e",
    userText: "#ffffff",
    assistantBubble: "#ffffff",
    assistantText: "#122033",
    composer: "rgba(255, 255, 255, 0.94)",
    composerBorder: "rgba(110, 127, 139, 0.26)",
    composerRing: "rgba(15, 118, 110, 0.16)",
    codeBackground: "#f7faf9",
    codeHeader: "#e7f0ed",
  },
  tooltip: {
    background: "#122033",
    text: "#ffffff",
  },
  scrollbar: {
    thumb: "#b9c9c4",
    track: "transparent",
  },
  shadow: {
    shell: "0 24px 70px rgba(18, 32, 51, 0.08)",
    panel: "0 14px 36px rgba(18, 32, 51, 0.08)",
    floating: "0 16px 40px rgba(18, 32, 51, 0.14)",
  },
  gradient: {
    hero:
      "radial-gradient(circle at top, rgba(15, 118, 110, 0.12), transparent 42%)",
    accent: "linear-gradient(135deg, #0f766e 0%, #256d85 100%)",
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
