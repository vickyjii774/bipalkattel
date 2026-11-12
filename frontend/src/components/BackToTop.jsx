import React, { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export default function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShow(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!show) return null;

  return (
    <button
      onClick={scrollToTop}
      aria-label="Back to top"
      className="fixed bottom-6 right-6 z-50 inline-flex items-center justify-center w-11 h-11 text-[#DCE8DF] hover:text-white border border-[#f0f3f1] bg-[#214E34]  backdrop-blur-sm rounded-full transition duration-300 shadow-lg cursor-pointer"
    >
      <ArrowUp className="w-4 h-4" />
    </button>
  );
}