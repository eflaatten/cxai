import { createThemeTokens } from "../tokens";

const darkTheme = createThemeTokens("dark", {
  background: {
    canvas: "#000000",
    surface: "#111317",
    muted: "#171a1f",
    elevated: "rgba(12, 14, 18, 0.9)",
    inset: "#0c0e12",
    overlay: "rgba(0, 0, 0, 0.72)",
  },
  text: {
    primary: "#eceff4",
    secondary: "#b2b8c2",
    muted: "#7e8794",
    inverse: "#090a0d",
    button: "#ffffff",
  },
  border: {
    subtle: "#22262d",
    strong: "#2f3640",
    accent: "rgba(114, 138, 173, 0.28)",
  },
  accent: {
    primary: "#7b93b3",
    soft: "rgba(123, 147, 179, 0.14)",
    strong: "#9bb0cb",
    contrast: "#ffffff",
  },
  interactive: {
    hover: "rgba(255, 255, 255, 0.06)",
    active: "rgba(255, 255, 255, 0.1)",
    focus: "rgba(123, 147, 179, 0.18)",
    disabled: "#5c6673",
  },
  chat: {
    userBubble: "#202832",
    userText: "#f2f4f8",
    assistantBubble: "#111317",
    assistantText: "#eceff4",
    composer: "rgba(17, 19, 23, 0.96)",
    composerBorder: "rgba(123, 147, 179, 0.16)",
    composerRing: "rgba(123, 147, 179, 0.12)",
    codeBackground: "#000000",
    codeHeader: "#181c22",
  },
  tooltip: {
    background: "#eceff4",
    text: "#090a0d",
  },
  scrollbar: {
    thumb: "#2d333c",
    track: "transparent",
  },
  shadow: {
    shell: "0 26px 72px rgba(0, 0, 0, 0.5)",
    panel: "0 18px 42px rgba(0, 0, 0, 0.38)",
    floating: "0 18px 54px rgba(0, 0, 0, 0.58)",
  },
  gradient: {
    hero:
      "radial-gradient(circle at top, rgba(123, 147, 179, 0.12), transparent 44%)",
    accent: "linear-gradient(135deg, #60758f 0%, #8d9fb6 100%)",
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

export default darkTheme;
