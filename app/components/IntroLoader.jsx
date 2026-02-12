"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { WORDS } from "../lib/siteData";

export default function IntroLoader({ isLoading, isMenuOpen, onComplete }) {
  const [kickoff, setKickoff] = useState(0);
  const didCompleteRef = useRef(false);

  useEffect(() => {
    if (isLoading) {
      didCompleteRef.current = false;
      setKickoff((value) => value + 1);
    }
  }, [isLoading]);

  const brandColor = isLoading ? "#ffffff" : isMenuOpen ? "#1f1f28" : "#f1eef9";

  return (
    <motion.div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        pointerEvents: "none",
      }}
    >
      <motion.div
        initial={false}
        animate={{
          opacity: isLoading ? 1 : 0,
          transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
        }}
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "#0b0b12",
        }}
      />

      <motion.div
        initial={false}
        animate={
          isLoading
            ? {
                top: "50%",
                left: "50%",
                x: "-50%",
                y: "-50%",
                scale: 1,
              }
            : {
                top: "32px",
                left: "40px",
                x: 0,
                y: 0,
                scale: 0.26,
              }
        }
        transition={{ duration: isLoading ? 0.5 : 1.05, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: "absolute",
          display: "flex",
          gap: "0.4em",
          padding: "0 20px",
          transformOrigin: "top left",
          willChange: "transform, top, left",
        }}
      >
        {WORDS.map((word, idx) => (
          <div key={word} style={{ overflow: "hidden" }}>
            <motion.span
              key={`${word}-${kickoff}`}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              transition={{ duration: 0.9, delay: idx * 0.12, ease: [0.33, 1, 0.68, 1] }}
              onAnimationComplete={() => {
                if (isLoading && idx === WORDS.length - 1 && !didCompleteRef.current) {
                  didCompleteRef.current = true;
                  setTimeout(onComplete, 1600);
                }
              }}
              style={{
                display: "block",
                color: brandColor,
                fontSize: "clamp(1.2rem, 5vw, 4.5rem)",
                fontFamily: '"Manrope", sans-serif',
                fontWeight: 800,
                letterSpacing: "0.02em",
                lineHeight: 1,
                textTransform: "uppercase",
                whiteSpace: "nowrap",
              }}
            >
              {word}
            </motion.span>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
}
