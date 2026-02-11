// Design system constants — dark mode by default with vibrant accents

export const Colors = {
  dark: {
    background: "#0A0A0F",
    surface: "#14141F",
    surfaceElevated: "#1C1C2E",
    border: "#2A2A3D",
    text: "#F0F0F5",
    textSecondary: "#8888A0",
    textTertiary: "#5A5A70",
    primary: "#7C5CFC", // indigo-violet
    primaryLight: "#9B7FFF",
    primaryDark: "#5A3AD4",
    accent: "#FF7A5C", // warm coral
    accentLight: "#FF9B82",
    success: "#4ADE80",
    warning: "#FBBF24",
    danger: "#F87171",
    card: "#16162A",
    tabBar: "#0D0D18",
    tabBarActive: "#7C5CFC",
    tabBarInactive: "#5A5A70",
  },
  light: {
    background: "#F8F8FC",
    surface: "#FFFFFF",
    surfaceElevated: "#FFFFFF",
    border: "#E8E8F0",
    text: "#1A1A2E",
    textSecondary: "#6B6B80",
    textTertiary: "#9999AA",
    primary: "#7C5CFC",
    primaryLight: "#9B7FFF",
    primaryDark: "#5A3AD4",
    accent: "#FF7A5C",
    accentLight: "#FF9B82",
    success: "#22C55E",
    warning: "#F59E0B",
    danger: "#EF4444",
    card: "#FFFFFF",
    tabBar: "#FFFFFF",
    tabBarActive: "#7C5CFC",
    tabBarInactive: "#9999AA",
  },
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  hero: 40,
} as const;

export const FontWeight = {
  regular: "400" as const,
  medium: "500" as const,
  semibold: "600" as const,
  bold: "700" as const,
};

// Notification defaults
export const DAILY_NOTIFICATION_HOUR = 9; // 9 AM for date-critical tasks
export const DAILY_NOTIFICATION_MINUTE = 0;
export const DB_NAME = "collegeapp.db";
