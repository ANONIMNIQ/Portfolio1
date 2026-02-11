"use client";

import { motion } from "framer-motion";
import { WORDS } from "../lib/siteData";

export default function IntroLoader({ onComplete }) {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ scale: 1.2, filter: "blur(20px)", opacity: 0, transition: { duration: 1.2, ease: [0.76, 0, 0.24, 1] } }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        backgroundColor: "#0b0b12",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", gap: "0.4em", padding: "0 20px" }}>
        {WORDS.map((word, idx) => (
          <div key={word} style={{ overflow: "hidden" }}>
            <motion.span
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              transition={{ duration: 0.9, delay: idx * 0.12, ease: [0.33, 1, 0.68, 1] }}
              onAnimationComplete={() => {
                if (idx === WORDS.length - 1) {
                  setTimeout(onComplete, 1600);
                }
              }}
              style={{
                display: "block",
                color: "white",
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
      </div>
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1.3, opacity: 0.2 }}
        transition={{ duration: 4, ease: "easeOut" }}
        style={{
          position: "absolute",
          width: "100vw",
          height: "100vw",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(44, 44, 214, 0.4) 0%, transparent 70%)",
          filter: "blur(120px)",
          zIndex: -1,
        }}
      />
    </motion.div>
  );
}
