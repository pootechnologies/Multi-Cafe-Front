import React, { useState, useEffect } from "react";

const ScrollTop = () => {
  // State to control the visibility of the button
  const [isVisible, setIsVisible] = useState(false);

  // Scroll event handler
  const handleScroll = () => {
    if (window.scrollY > 300) {
      // Show the button when the page is scrolled 300px down
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Scroll the page to the top
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth", // Smooth scrolling effect
    });
  };

  // Add scroll event listener on mount and clean it up on unmount
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <button
      onClick={scrollToTop}
      style={{
        position: "fixed",
        bottom: "20px",
        left: "20px",
        backgroundColor: "#007bff",
        color: "#fff",
        border: "none",
        borderRadius: "50%",
        width: "50px",
        height: "50px",
        display: isVisible ? "block" : "none",
        cursor: "pointer",
      }}
    >
      ↑
    </button>
  );
};

export default ScrollTop
