import React, { useRef, useState, useEffect } from "react";
import "./ImageGenerator.css";
import { assets } from "../../assets/assets";

const ImageGenerator = () => {
  const [imageURL, setImageURL] = useState("/");
  const inputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Loading");

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingText(prevText => {
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

    try {
      const response = await fetch(
        "https://api.openai.com/v1/images/generations",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer sk-oe8Gbdb0WiQ50VQj5as5T3B1bkFJHOY4uSGd2UKCTTzfL1xX"
          },
          body: JSON.stringify({
            prompt: inputRef.current.value,
            n: 1,
            size: "512x512",
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response from API:", errorData);
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      console.log(data);

      if (data && data.data && data.data[0] && data.data[0].url) {
        setImageURL(data.data[0].url);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching image:", error);
      setLoading(false);
    }
  };

  return (
    <div className="ai-image-generator">
      <div className="header">
        &nbsp;AI Image&nbsp;<span>&nbsp;Generator&nbsp;</span>
      </div>
      <div className="img-loading">
        <div className="image">
          <img src={imageURL === "/" ? assets.default_image : imageURL} alt="" />
          <div className="loading">
            <div className={loading ? "loading-bar-full" : "loading-bar"}></div>
            <div className={loading ? "loading-text" : "display-none"}>{loadingText}</div>
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
    </div>
  );
};

export default ImageGenerator;
