import React, { useRef, useState, useEffect } from "react";
import "./ImageGenerator.css";
import { assets } from "../../assets/assets";
import Draggable from "react-draggable";

const ImageGenerator = () => {
  const [imageURL, setImageURL] = useState("/");
  const inputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Loading");
  const [currentKeyIndex, setCurrentKeyIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [tiltStyle, setTiltStyle] = useState({});
  const [isDraggable, setIsDraggable] = useState(false);

  // Check screen size on mount and resize
  useEffect(() => {
    const checkScreenSize = () => {
      setIsDraggable(window.innerWidth <= 768);
    };

    // Initial check
    checkScreenSize();

    // Add event listener for window resize
    window.addEventListener("resize", checkScreenSize);

    // Cleanup
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Get all API keys from environment variables
  const getApiKeys = () => {
    const keys = [];
    let index = 1;

    while (true) {
      const key = import.meta.env[`VITE_STABILITY_API_KEY_${index}`];
      if (!key) break;
      keys.push(key);
      index++;
    }

    return keys;
  };

  const apiKeys = getApiKeys();

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingText((prevText) => {
        switch (prevText) {
          case "Loading":
            return "Loading.";
          case "Loading.":
            return "Loading..";
          default:
            return "Loading...";
        }
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const imageGenerator = async () => {
    if (inputRef.current.value === "") {
      return;
    }

    setLoading(true);

    // Try with current API key
    let success = false;
    let startKeyIndex = currentKeyIndex;

    // Loop through available keys until success or all keys tried
    while (!success && apiKeys.length > 0) {
      const apiKey = apiKeys[currentKeyIndex];

      if (!apiKey) {
        console.error("No valid API keys available");
        break;
      }

      try {
        console.log(`Trying with API key ${currentKeyIndex + 1}`);

        const response = await fetch(
          "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              text_prompts: [
                {
                  text: inputRef.current.value,
                  weight: 1.0,
                },
              ],
              cfg_scale: 7,
              height: 1024,
              width: 1024,
              samples: 1,
              steps: 30,
            }),
          }
        );

        const responseData = await response.json();

        if (!response.ok) {
          console.error("Error response from Stability API:", responseData);

          // Check if error is related to quota/billing
          if (
            responseData.name === "unauthorized" ||
            responseData.message?.includes("billing") ||
            responseData.message?.includes("quota") ||
            responseData.message?.includes("limit") ||
            responseData.message?.includes("credit")
          ) {
            // Try next key
            setCurrentKeyIndex((prevIndex) => (prevIndex + 1) % apiKeys.length);

            // If we've tried all keys, break the loop
            if ((currentKeyIndex + 1) % apiKeys.length === startKeyIndex) {
              throw new Error("All API keys exhausted");
            }

            continue;
          }

          throw new Error(
            responseData.message || "Network response was not ok"
          );
        }

        // If we get here, the request was successful
        console.log("API Response:", responseData);

        if (
          responseData &&
          responseData.artifacts &&
          responseData.artifacts.length > 0
        ) {
          const base64Image = responseData.artifacts[0].base64;
          const imageUrl = `data:image/png;base64,${base64Image}`;
          setImageURL(imageUrl);
          success = true;
        } else {
          console.error("Unexpected API response format:", responseData);
        }
      } catch (error) {
        console.error(`Error with API key ${currentKeyIndex + 1}:`, error);

        // Move to next key for next attempt
        setCurrentKeyIndex((prevIndex) => (prevIndex + 1) % apiKeys.length);

        // If we've tried all keys, break the loop
        if ((currentKeyIndex + 1) % apiKeys.length === startKeyIndex) {
          console.error("All API keys have been tried without success");
          break;
        }
      }
    }

    // If all API keys failed, fall back to mock image
    if (!success) {
      try {
        console.log("All API keys failed, falling back to mock image");
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const encodedPrompt = encodeURIComponent(inputRef.current.value);
        const mockImageUrl = `https://placehold.co/1024x1024/random/ffffff?text=${encodedPrompt}`;
        setImageURL(mockImageUrl);
      } catch (fallbackError) {
        console.error("Error with fallback image:", fallbackError);
      }
    }

    setLoading(false);
  };

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle("light-mode");
  };

  const handleMouseMove = (e) => {
    if (!loading) return;

    const imageContainer = document.querySelector(".image");
    if (!imageContainer) return;

    const rect = imageContainer.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const tiltX = (y - centerY) / 20;
    const tiltY = (centerX - x) / 20;

    setTiltStyle({
      transform: `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
    });
  };

  const resetTilt = () => {
    setTiltStyle({
      transform: "rotateX(0deg) rotateY(0deg)",
    });
  };

  return (
    <div className="ai-image-generator">
      <div className="header">
        &nbsp;AI Image&nbsp;<span>&nbsp;Generator&nbsp;</span>
      </div>
      <div className="img-loading">
        <div
          className="image"
          style={tiltStyle}
          onMouseMove={handleMouseMove}
          onMouseLeave={resetTilt}
        >
          <img
            src={imageURL === "/" ? assets.default_image : imageURL}
            alt=""
            className={imageLoaded ? "fade-in" : ""}
            onLoad={() => setImageLoaded(true)}
          />
          <div className="loading">
            {loading && <div className="loading-spinner"></div>}
            <div className="loading-bar-container">
              <div
                className={loading ? "loading-bar-full" : "loading-bar"}
              ></div>
            </div>
            <div className={loading ? "loading-text" : "display-none"}>
              {loadingText}
            </div>
          </div>
        </div>
      </div>
      <div className="search-box">
        <input
          type="text"
          ref={inputRef}
          className="search-input"
          placeholder="Describe what you want to see ?"
        />
        <div className="generate-btn" onClick={imageGenerator}>
          Generate
        </div>
      </div>

      {/* Fixed position theme toggle button with high visibility */}
      <div className="theme-toggle-container">
        <div className="theme-toggle-button" onClick={toggleTheme}>
          {darkMode ? "☀️" : "🌙"}
        </div>
      </div>
    </div>
  );
};

export default ImageGenerator;
