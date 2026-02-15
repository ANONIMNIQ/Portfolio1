"use client";

import { AnimatePresence, motion } from "framer-motion";

export default function EmojiBurst({ items }) {
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 99999, overflow: "hidden" }}>
      <AnimatePresence>
        {items.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0, x: item.side === "left" ? "-5vw" : "105vw", y: "110vh" }}
            animate={{
              opacity: [0, 1, 1, 0],
              scale: item.scale,
              x: item.side === "left" ? `${10 + 60 * Math.random()}vw` : `${30 + 60 * Math.random()}vw`,
              y: `-${20 + 20 * Math.random()}vh`,
              rotate: item.rotation,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 3 + 1.5 * Math.random(), delay: item.delay, ease: [0.22, 1, 0.36, 1] }}
            style={{ position: "absolute", fontSize: "1.5rem", userSelect: "none" }}
          >
            {item.emoji}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}