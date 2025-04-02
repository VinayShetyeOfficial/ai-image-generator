import React from "react";
import ImageGenerator from "./componnets/image_generator/ImageGenerator";
import { useTheme } from "./ThemeContext";

const App = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      <div className="theme-toggle-container">
        <div className="theme-toggle-button" onClick={toggleTheme}>
          {theme === "dark" ? "☀️" : "🌙"}
        </div>
      </div>
      <ImageGenerator />
    </>
  );
};

export default App;
