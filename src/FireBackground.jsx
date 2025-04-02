import React from "react";

const FireBackground = () => {
  return (
    <iframe
      src="/fire-bg.html"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: -1,
        border: "none",
        pointerEvents: "none", // Allows clicks to pass through
        backgroundColor: "black",
      }}
      title="Animated Fire Background"
    ></iframe>
  );
};

export default FireBackground;
