import React from "react";
import { useTheme } from "./ThemeContext";
import FireBackground from "./FireBackground";
import WaterBackground from "./WaterBackground";

const ThemeBackground = () => {
  const { theme } = useTheme();

  return theme === "dark" ? <FireBackground /> : <WaterBackground />;
};

export default ThemeBackground;
