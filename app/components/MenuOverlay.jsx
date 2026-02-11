"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import Magnet from "./Magnet";

export default function MenuOverlay({ isOpen, onClose, onOpenProjects, onOpenAbout, onOpenContact, text }) {
  const links = [
    { id: "projects", label: text.projects, action: onOpenProjects },
    { id: "about", label: text.about, action: onOpenAbout },
    { id: "contacts", label: text.contacts, action: onOpenContact },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ clipPath: "circle(0% at calc(100% - 62px) 54px)" }}
          animate={{ clipPath: "circle(220% at calc(100% - 62px) 54px)" }}
          exit={{ clipPath: "circle(0% at calc(100% - 62px) 54px)", transition: { duration: 0.5, ease: [0.76, 0, 0.24, 1], delay: 0.1 } }}
          transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1] }}
          className="menu-overlay"
          style={{ willChange: "clip-path, opacity, transform", transform: "translateZ(0)", backfaceVisibility: "hidden" }}
        >
          <div className="menu-header">
            <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1, transition: { delay: 0.8, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] } }}>
              <Magnet strength={0.2}>
                <button className="menu-close" onClick={onClose} aria-label="Close menu">
                  <X size={24} />
                </button>
              </Magnet>
            </motion.div>
          </div>
          <nav className="menu-nav">
            <div className="menu-section">
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="menu-kicker">
                {text.nav}
              </motion.span>
              <div className="menu-links">
                {links.map((link, idx) => (
                  <div key={link.id} className="menu-link-item">
                    <motion.button
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.1 + idx * 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                      className="menu-link"
                      onClick={() => {
                        link.action();
                        onClose();
                      }}
                    >
                      <span className="menu-arrow">↳</span>
                      <span className="menu-text">{link.label}</span>
                    </motion.button>
                  </div>
                ))}
              </div>
            </div>
          </nav>
          <div className="menu-footer">
            <motion.div className="menu-footer-col" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.5 }}>
              <span>{text.location}</span>
              <p>{text.city}</p>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
