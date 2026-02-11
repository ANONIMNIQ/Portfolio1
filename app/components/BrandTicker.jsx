"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { WORDS } from "../lib/siteData";

const containerVariants = {
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
  exit: { transition: { staggerChildren: 0.05, staggerDirection: -1 } },
};

const wordVariants = {
  hidden: { y: "100%" },
  visible: { y: 0, transition: { duration: 0.7, ease: [0.33, 1, 0.68, 1] } },
  exit: { y: "100%", transition: { duration: 0.5, ease: [0.76, 0, 0.24, 1] } },
};

export default function BrandTicker() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTick((value) => value + 1), 8000);
    return () => clearInterval(timer);
  }, []);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        className="brand-ticker"
        key={tick}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        style={{
          display: "flex",
          flexDirection: "row",
          gap: "0.4em",
          lineHeight: 1,
          textTransform: "uppercase",
          fontSize: "14px",
          letterSpacing: "0.08em",
          fontWeight: 600,
          color: "#f1eef9",
        }}
      >
        {WORDS.map((word) => (
          <div key={word} style={{ overflow: "hidden" }}>
            <motion.span variants={wordVariants} style={{ display: "block" }}>
              {word}
            </motion.span>
          </div>
        ))}
      </motion.div>
    </AnimatePresence>
  );
}
