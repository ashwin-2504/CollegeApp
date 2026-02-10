export const colors = {
  background: "#0F172A", // Slate 900
  surface: "#1E293B", // Slate 800
  surfaceHighlight: "#334155", // Slate 700
  primary: "#3B82F6", // Blue 500
  primaryForeground: "#FFFFFF",
  secondary: "#64748B", // Slate 500
  text: "#F1F5F9", // Slate 100
  textMuted: "#94A3B8", // Slate 400
  danger: "#EF4444", // Red 500
  success: "#22C55E", // Green 500
  border: "#334155",
};

export const spacing = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
};

export const typography = {
  h1: { fontSize: 32, fontWeight: "700" as "700", color: colors.text },
  h2: { fontSize: 24, fontWeight: "600" as "600", color: colors.text },
  h3: { fontSize: 20, fontWeight: "600" as "600", color: colors.text },
  body: { fontSize: 16, color: colors.text },
  caption: { fontSize: 14, color: colors.textMuted },
};

export const layout = {
  radius: 12,
};
