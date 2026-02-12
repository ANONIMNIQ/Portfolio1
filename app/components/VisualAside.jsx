"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Ellipsis, Info, List } from "lucide-react";
import Magnet from "./Magnet";

export default function VisualAside({
  canvasRef,
  showLangSwitch,
  showMenuTrigger,
  showInfoTrigger,
  showProjectsTrigger,
  lang,
  onToggleLang,
  onOpenMenu,
  onOpenAbout,
  onOpenProjects,
  showProjectsLike,
  isMenuOpen,
}) {
  return (
    <aside className="visual">
      <div className="visual-surface">
        <canvas ref={canvasRef} className="webgl" aria-hidden="true" />

        <div className="visual-overlay">
          <div className="brand-spacer" aria-hidden="true" />

          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            {showLangSwitch && (
              <motion.div
                initial={{ x: 96, opacity: 0 }}
                animate={{ x: 0, opacity: 1, transition: { duration: 0.52, ease: [0.22, 1, 0.36, 1] } }}
                exit={{ x: 56, opacity: 0, transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] } }}
              >
                <Magnet strength={0.3}>
                  <button className="menu-trigger" onClick={onToggleLang} style={{ fontSize: "11px", fontWeight: 700 }}>
                    {lang.toUpperCase()}
                  </button>
                </Magnet>
              </motion.div>
            )}

            <AnimatePresence>
              {showMenuTrigger && !(isMenuOpen || showProjectsLike) && (
                <motion.div
                  initial={{ x: 96, opacity: 0 }}
                  animate={{ x: 0, opacity: 1, transition: { delay: 0.14, duration: 0.52, ease: [0.22, 1, 0.36, 1] } }}
                  exit={{ x: 56, opacity: 0, transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] } }}
                  className="menu-trigger-container"
                >
                  <Magnet strength={0.3}>
                    <button className="menu-trigger" aria-label="Open menu" onClick={onOpenMenu}>
                      <Ellipsis size={20} />
                    </button>
                  </Magnet>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <AnimatePresence>
          {showInfoTrigger && (
            <motion.div
              initial={{ y: 120, scale: 0.72, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1, transition: { duration: 0.54, type: "spring", stiffness: 240, damping: 24 } }}
              exit={{ y: 80, scale: 0.86, opacity: 0, transition: { duration: 0.34, ease: [0.22, 1, 0.36, 1] } }}
              className="info-trigger-container"
            >
              <Magnet strength={0.3}>
                <button className="info-trigger" aria-label="About us" onClick={onOpenAbout}>
                  <Info size={20} />
                </button>
              </Magnet>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.div
        className="projects-trigger-wrap"
        initial={{ scale: 0.72, opacity: 0, y: 120 }}
        animate={{
          scale: showProjectsLike || !showProjectsTrigger ? 0.72 : 1,
          y: showProjectsLike || !showProjectsTrigger ? 120 : 0,
          opacity: showProjectsLike || !showProjectsTrigger ? 0 : 1,
          transition: {
            delay: showProjectsLike || !showProjectsTrigger ? 0 : 0.14,
            duration: 0.56,
            type: "spring",
            stiffness: 240,
            damping: 24,
          },
        }}
        style={{ pointerEvents: showProjectsLike || !showProjectsTrigger ? "none" : "auto" }}
      >
        <Magnet strength={0.4}>
          <button className="projects-trigger" type="button" aria-label="Open projects" onClick={onOpenProjects}>
            <List size={24} />
          </button>
        </Magnet>
      </motion.div>
    </aside>
  );
}
