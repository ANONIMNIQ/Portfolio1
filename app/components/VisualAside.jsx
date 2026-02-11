"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Ellipsis, Info, List } from "lucide-react";
import Magnet from "./Magnet";
import BrandTicker from "./BrandTicker";

export default function VisualAside({
  canvasRef,
  showLangSwitch,
  showInfoTrigger,
  hasLoadedOnce,
  lang,
  onToggleLang,
  onOpenMenu,
  onOpenAbout,
  onOpenProjects,
  showProjectsLike,
  isMenuOpen,
}) {
  return (
    <aside className={`visual ${isMenuOpen ? "menu-open" : ""}`}>
      <div className="visual-surface">
        <canvas ref={canvasRef} className="webgl" aria-hidden="true" />

        <div className={`visual-overlay ${isMenuOpen ? "menu-open" : ""}`}>
          <BrandTicker isMenuOpen={isMenuOpen} />

          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            {showLangSwitch && (
              <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                <Magnet strength={0.3}>
                  <button className="menu-trigger" onClick={onToggleLang} style={{ fontSize: "11px", fontWeight: 700 }}>
                    {lang.toUpperCase()}
                  </button>
                </Magnet>
              </motion.div>
            )}

            <AnimatePresence>
              {!(isMenuOpen || showProjectsLike) && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1, transition: { delay: hasLoadedOnce ? 0 : 0.5, duration: 0.6, type: "spring", stiffness: 260, damping: 20 } }}
                  exit={{ scale: 0, opacity: 0, transition: { duration: 0.3 } }}
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
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1, transition: { delay: hasLoadedOnce ? 0 : 0.7, duration: 0.6, type: "spring", stiffness: 260, damping: 20 } }}
              exit={{ y: 100, opacity: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }}
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
        initial={{ scale: 0, opacity: 0, x: "-50%" }}
        animate={{
          x: "-50%",
          scale: showProjectsLike ? 0 : 1,
          y: showProjectsLike ? 100 : 0,
          opacity: showProjectsLike ? 0 : 1,
          transition: { delay: showProjectsLike ? 0 : hasLoadedOnce ? 0 : 0.9, duration: 0.6, type: "spring", stiffness: 260, damping: 20 },
        }}
        style={{ pointerEvents: showProjectsLike ? "none" : "auto" }}
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
