"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { WORDS } from "../lib/siteData";

export default function IntroLoader({ isLoading, isMenuOpen, onComplete }) {
  const [kickoff, setKickoff] = useState(0);
  const [isDocked, setIsDocked] = useState(false);
  const didCompleteRef = useRef(false);

  useEffect(() => {
    if (isLoading) {
      didCompleteRef.current = false;
      setIsDocked(false);
      setKickoff((value) => value + 1);
    }
  }, [isLoading]);

  useEffect(() => {
    if (isLoading) return undefined;

    const dockTimer = setTimeout(() => {
      setIsDocked(true);
    }, 1080);

    return () => clearTimeout(dockTimer);
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
          filter: isLoading ? "blur(0px)" : "blur(16px)",
          transition: { duration: 1.05, ease: [0.22, 1, 0.36, 1] },
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
            {isLoading ? (
              <motion.span
                key={`${word}-${kickoff}`}
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.86, delay: idx * 0.12, ease: [0.33, 1, 0.68, 1] }}
                onAnimationComplete={() => {
                  if (idx === WORDS.length - 1 && !didCompleteRef.current) {
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
            ) : (
              isDocked ? (
                <motion.span
                  initial={{ y: "100%" }}
                  animate={{ y: ["100%", "0%", "0%", "100%", "100%"] }}
                  transition={{
                    duration: 3.6,
                    delay: idx * 0.12,
                    times: [0, 0.24, 0.58, 0.82, 1],
                    ease: [0.33, 1, 0.68, 1],
                    repeat: Infinity,
                    repeatDelay: 0,
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
              ) : (
                <motion.span
                  initial={false}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
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
              )
            )}
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
}
