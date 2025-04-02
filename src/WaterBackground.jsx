import React from "react";

const WaterBackground = () => {
  return (
    <iframe
      src="/water-bg.html"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: -1,
        border: "none",
        pointerEvents: "none", // Allows clicks to pass through
        backgroundColor: "white",
      }}
      title="Animated Water Background"
    ></iframe>
  );
};

export default WaterBackground;
