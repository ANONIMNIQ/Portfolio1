"use client";

import { useEffect } from "react";
import { AnimatePresence, motion, useSpring, useTransform } from "framer-motion";
import { X } from "lucide-react";
import Magnet from "./Magnet";

export default function AboutOverlay({ isOpen, onClose, text }) {
  const springX = useSpring(0, { stiffness: 50, damping: 20 });
  const rotateY = useTransform(springX, [-0.5, 0.5], [-10, 10]);
  const translateX = useTransform(springX, [-0.5, 0.5], [-30, 30]);

  useEffect(() => {
    const onMouseMove = (event) => {
      if (!isOpen) return;
      const normalized = event.clientX / window.innerWidth - 0.5;
      springX.set(normalized);
    };

    window.addEventListener("mousemove", onMouseMove);
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, [isOpen, springX]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="about-overlay">
          <div className="about-header">
            <motion.div initial={{ y: -100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
              <Magnet strength={0.2}>
                <button className="menu-close" onClick={onClose} aria-label="Close about">
                  <X size={24} />
                </button>
              </Magnet>
            </motion.div>
          </div>

          <motion.div className="about-content" style={{ rotateY, x: translateX, perspective: 1000 }}>
            <motion.div className="about-inner" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 1, ease: [0.22, 1, 0.36, 1] }}>
              <span className="about-kicker">{text.aboutKicker}</span>
              <h2 className="about-title">{text.aboutTitle}</h2>
              <div className="about-grid">
                <div className="about-col">
                  <h3>{text.techTitle}</h3>
                  <p>{text.techDesc}</p>
                </div>
                <div className="about-col">
                  <h3>{text.innovTitle}</h3>
                  <p>{text.innovDesc}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
