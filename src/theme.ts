export type Theme = {
  dark: boolean;
  bg: string;
  surface: string;
  surfaceAlt: string;
  elevated: string;
  text: string;
  subtext: string;
  muted: string;
  border: string;
  primary: string;
  primaryDark: string;
  primarySoft: string;
  teal: string;
  danger: string;
  dangerDark: string;
  dangerSoft: string;
  success: string;
  amber: string;
  map: string;
  shadow: string;
};

export const lightTheme: Theme = {
  dark: false,
  bg: "#F6F9FC",
  surface: "#FFFFFF",
  surfaceAlt: "#EFF6FF",
  elevated: "#FFFFFF",
  text: "#111827",
  subtext: "#5F6B7A",
  muted: "#94A3B8",
  border: "#E5EAF0",
  primary: "#2563EB",
  primaryDark: "#1E3A8A",
  primarySoft: "#DBEAFE",
  teal: "#14B8A6",
  danger: "#EF4444",
  dangerDark: "#C92936",
  dangerSoft: "#FEF2F2",
  success: "#16A34A",
  amber: "#F59E0B",
  map: "#E9F0F4",
  shadow: "#14213D"
};

export const darkTheme: Theme = {
  dark: true,
  bg: "#07111F",
  surface: "#111E33",
  surfaceAlt: "#132B49",
  elevated: "#132238",
  text: "#F8FAFC",
  subtext: "#CBD5E1",
  muted: "#8EA1B8",
  border: "#22334D",
  primary: "#3B82F6",
  primaryDark: "#60A5FA",
  primarySoft: "#18365F",
  teal: "#2DD4BF",
  danger: "#F87171",
  dangerDark: "#EF4444",
  dangerSoft: "#3B1D2B",
  success: "#4ADE80",
  amber: "#FBBF24",
  map: "#0E1D31",
  shadow: "#000000"
};
