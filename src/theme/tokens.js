const tokenSkeleton = {
  background: {
    canvas: "",
    surface: "",
    muted: "",
    elevated: "",
    inset: "",
    overlay: "",
  },
  text: {
    primary: "",
    secondary: "",
    muted: "",
    inverse: "",
    button: "",
  },
  border: {
    subtle: "",
    strong: "",
    accent: "",
  },
  accent: {
    primary: "",
    soft: "",
    strong: "",
    contrast: "",
  },
  interactive: {
    hover: "",
    active: "",
    focus: "",
    disabled: "",
  },
  chat: {
    userBubble: "",
    userText: "",
    assistantBubble: "",
    assistantText: "",
    composer: "",
    composerBorder: "",
    composerRing: "",
    codeBackground: "",
    codeHeader: "",
  },
  tooltip: {
    background: "",
    text: "",
  },
  scrollbar: {
    thumb: "",
    track: "",
  },
  shadow: {
    shell: "",
    panel: "",
    floating: "",
  },
  gradient: {
    hero: "",
    accent: "",
  },
  radius: {
    sm: "",
    md: "",
    lg: "",
    pill: "",
  },
  typography: {
    sans: "",
    mono: "",
  },
};

const isPlainObject = (value) =>
  Object.prototype.toString.call(value) === "[object Object]";

const deepMerge = (base, overrides) => {
  const output = { ...base };

  Object.entries(overrides).forEach(([key, value]) => {
    if (isPlainObject(value) && isPlainObject(base[key])) {
      output[key] = deepMerge(base[key], value);
      return;
    }

    output[key] = value;
  });

  return output;
};

export const createThemeTokens = (name, overrides) => ({
  name,
  tokens: deepMerge(tokenSkeleton, overrides),
});

