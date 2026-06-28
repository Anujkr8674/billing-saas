"use client";

import { useState, useEffect } from "react";

const phrases = [
  "SMART BILLING",
  "QUICK QUOTES",
  "EASY INVOICES"
];

export default function Typewriter() {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const typingSpeed = 100;
    const deletingSpeed = 50;
    const delayBetweenPhrases = 2000;

    const handleType = () => {
      const fullText = phrases[currentPhraseIndex];

      if (!isDeleting) {
        // Typing
        setCurrentText(fullText.substring(0, currentText.length + 1));

        if (currentText === fullText) {
          // Pause before deleting
          setTimeout(() => setIsDeleting(true), delayBetweenPhrases);
          return;
        }
      } else {
        // Deleting
        setCurrentText(fullText.substring(0, currentText.length - 1));

        if (currentText === "") {
          setIsDeleting(false);
          setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
          return;
        }
      }
    };

    const speed = isDeleting ? deletingSpeed : typingSpeed;
    const timer = setTimeout(handleType, currentText === phrases[currentPhraseIndex] && !isDeleting ? delayBetweenPhrases : speed);

    return () => clearTimeout(timer);
  }, [currentText, isDeleting, currentPhraseIndex]);

  return (
    <span className="bg-gradient-to-r from-[#6142e5] to-[#ff7f40] text-transparent bg-clip-text pr-1 border-r-4 border-[#ff7f40] animate-[blink_1s_infinite]">
      {currentText}
    </span>
  );
}
